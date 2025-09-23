import { Router } from 'express';
import DeploymentService from '../services/DeploymentService';

export default function projectRoutes(deploymentService: DeploymentService) {
  const router = Router();

  // Get all deployment configurations
  router.get('/', (req, res) => {
    try {
      const configs = deploymentService.getDeploymentConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get specific deployment configuration
  router.get('/:id', (req, res) => {
    try {
      const config = deploymentService.getDeploymentConfig(req.params.id);
      if (!config) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  // Create new deployment configuration
  router.post('/', async (req, res) => {
    try {
      const { name, repository, branch, environment, buildCommand, deployCommand, envVars, webhookUrl } = req.body;
      
      if (!name || !repository || !branch || !environment) {
        return res.status(400).json({ 
          error: 'name, repository, branch, and environment are required' 
        });
      }

      const config = await deploymentService.createDeploymentConfig({
        name,
        repository,
        branch,
        environment,
        buildCommand,
        deployCommand,
        envVars,
        webhookUrl
      });

      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update deployment configuration
  router.put('/:id', async (req, res) => {
    try {
      const updates = req.body;
      const config = await deploymentService.updateDeploymentConfig(req.params.id, updates);
      
      if (!config) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Delete deployment configuration
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await deploymentService.deleteDeploymentConfig(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  return router;
}
