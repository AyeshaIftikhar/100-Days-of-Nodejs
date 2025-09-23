import { Server } from 'socket.io';
import simpleGit from 'simple-git';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface DeploymentConfig {
  id: string;
  name: string;
  repository: string;
  branch: string;
  environment: 'development' | 'staging' | 'production';
  buildCommand?: string;
  deployCommand?: string;
  envVars?: Record<string, string>;
  webhookUrl?: string;
}

export interface DeploymentStatus {
  id: string;
  configId: string;
  status: 'pending' | 'cloning' | 'building' | 'deploying' | 'success' | 'failed';
  progress: number;
  logs: string[];
  startTime: Date;
  endTime?: Date;
  error?: string;
}

class DeploymentService {
  private io: Server;
  private deployments: Map<string, DeploymentStatus> = new Map();
  private configs: Map<string, DeploymentConfig> = new Map();
  private workspaceDir: string;

  constructor(io: Server) {
    this.io = io;
    this.workspaceDir = path.join(process.cwd(), 'deployments');
    this.initializeWorkspace();
    this.loadConfigurations();
  }

  private async initializeWorkspace() {
    try {
      await fs.mkdir(this.workspaceDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create workspace directory:', error);
    }
  }

  private async loadConfigurations() {
    try {
      const configPath = path.join(this.workspaceDir, 'configs.json');
      const data = await fs.readFile(configPath, 'utf-8');
      const configs = JSON.parse(data);
      configs.forEach((config: DeploymentConfig) => {
        this.configs.set(config.id, config);
      });
    } catch (error) {
      // File doesn't exist or is invalid, start with empty configs
      console.log('No existing configurations found, starting fresh');
    }
  }

  private async saveConfigurations() {
    try {
      const configPath = path.join(this.workspaceDir, 'configs.json');
      const configs = Array.from(this.configs.values());
      await fs.writeFile(configPath, JSON.stringify(configs, null, 2));
    } catch (error) {
      console.error('Failed to save configurations:', error);
    }
  }

  public async createDeploymentConfig(config: Omit<DeploymentConfig, 'id'>): Promise<DeploymentConfig> {
    const id = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deploymentConfig: DeploymentConfig = { ...config, id };
    
    this.configs.set(id, deploymentConfig);
    await this.saveConfigurations();
    
    return deploymentConfig;
  }

  public getDeploymentConfigs(): DeploymentConfig[] {
    return Array.from(this.configs.values());
  }

  public getDeploymentConfig(id: string): DeploymentConfig | undefined {
    return this.configs.get(id);
  }

  public async updateDeploymentConfig(id: string, updates: Partial<DeploymentConfig>): Promise<DeploymentConfig | null> {
    const config = this.configs.get(id);
    if (!config) return null;

    const updatedConfig = { ...config, ...updates, id };
    this.configs.set(id, updatedConfig);
    await this.saveConfigurations();
    
    return updatedConfig;
  }

  public async deleteDeploymentConfig(id: string): Promise<boolean> {
    const deleted = this.configs.delete(id);
    if (deleted) {
      await this.saveConfigurations();
    }
    return deleted;
  }

  public async startDeployment(configId: string): Promise<string> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Deployment config not found: ${configId}`);
    }

    const deploymentId = `deployment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deployment: DeploymentStatus = {
      id: deploymentId,
      configId,
      status: 'pending',
      progress: 0,
      logs: [],
      startTime: new Date()
    };

    this.deployments.set(deploymentId, deployment);
    this.emitDeploymentUpdate(deploymentId, deployment);

    // Start deployment process asynchronously
    this.executeDeployment(deploymentId, config).catch((error) => {
      console.error(`Deployment ${deploymentId} failed:`, error);
      this.updateDeploymentStatus(deploymentId, 'failed', 100, error.message);
    });

    return deploymentId;
  }

  private async executeDeployment(deploymentId: string, config: DeploymentConfig) {
    const projectDir = path.join(this.workspaceDir, deploymentId);

    try {
      // Step 1: Clone repository
      await this.updateDeploymentStatus(deploymentId, 'cloning', 10, 'Cloning repository...');
      await this.cloneRepository(config.repository, config.branch, projectDir);

      // Step 2: Build project
      if (config.buildCommand) {
        await this.updateDeploymentStatus(deploymentId, 'building', 50, 'Building project...');
        await this.runCommand(config.buildCommand, projectDir, deploymentId);
      }

      // Step 3: Deploy
      await this.updateDeploymentStatus(deploymentId, 'deploying', 80, 'Deploying...');
      if (config.deployCommand) {
        await this.runCommand(config.deployCommand, projectDir, deploymentId);
      }

      // Step 4: Complete
      await this.updateDeploymentStatus(deploymentId, 'success', 100, 'Deployment completed successfully!');

      // Call webhook if configured
      if (config.webhookUrl) {
        await this.callWebhook(config.webhookUrl, { deploymentId, status: 'success', config });
      }

    } catch (error) {
      await this.updateDeploymentStatus(deploymentId, 'failed', 100, `Deployment failed: ${error.message}`);
      
      if (config.webhookUrl) {
        await this.callWebhook(config.webhookUrl, { deploymentId, status: 'failed', error: error.message, config });
      }
    }
  }

  private async cloneRepository(repository: string, branch: string, targetDir: string) {
    const git = simpleGit();
    await git.clone(repository, targetDir, ['--branch', branch, '--single-branch']);
  }

  private async runCommand(command: string, cwd: string, deploymentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { cwd, shell: true });

      process.stdout?.on('data', (data) => {
        const log = data.toString();
        this.addDeploymentLog(deploymentId, log);
      });

      process.stderr?.on('data', (data) => {
        const log = data.toString();
        this.addDeploymentLog(deploymentId, log);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async callWebhook(url: string, payload: any) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.error(`Webhook call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook call error:', error);
    }
  }

  private async updateDeploymentStatus(
    deploymentId: string,
    status: DeploymentStatus['status'],
    progress: number,
    message?: string
  ) {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return;

    deployment.status = status;
    deployment.progress = progress;
    
    if (message) {
      deployment.logs.push(`[${new Date().toISOString()}] ${message}`);
    }

    if (status === 'success' || status === 'failed') {
      deployment.endTime = new Date();
    }

    if (status === 'failed' && message) {
      deployment.error = message;
    }

    this.emitDeploymentUpdate(deploymentId, deployment);
  }

  private addDeploymentLog(deploymentId: string, log: string) {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return;

    deployment.logs.push(`[${new Date().toISOString()}] ${log.trim()}`);
    this.emitDeploymentUpdate(deploymentId, deployment);
  }

  private emitDeploymentUpdate(deploymentId: string, deployment: DeploymentStatus) {
    this.io.to(`deployment-${deploymentId}`).emit('deployment-update', deployment);
    this.io.emit('deployment-list-update', this.getDeployments());
  }

  public getDeployment(deploymentId: string): DeploymentStatus | undefined {
    return this.deployments.get(deploymentId);
  }

  public getDeployments(): DeploymentStatus[] {
    return Array.from(this.deployments.values()).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  public async cancelDeployment(deploymentId: string): Promise<boolean> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment || deployment.status === 'success' || deployment.status === 'failed') {
      return false;
    }

    await this.updateDeploymentStatus(deploymentId, 'failed', deployment.progress, 'Deployment cancelled by user');
    return true;
  }
}

export default DeploymentService;
