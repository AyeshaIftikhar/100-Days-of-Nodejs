import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface DeploymentConfig {
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

interface DeploymentStatus {
  id: string;
  configId: string;
  status: 'pending' | 'cloning' | 'building' | 'deploying' | 'success' | 'failed';
  progress: number;
  logs: string[];
  startTime: Date;
  endTime?: Date;
  error?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [projects, setProjects] = useState<DeploymentConfig[]>([]);
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<DeploymentConfig | null>(null);

  const [projectForm, setProjectForm] = useState({
    name: '',
    repository: '',
    branch: 'main',
    environment: 'development' as const,
    buildCommand: 'npm install && npm run build',
    deployCommand: '',
    webhookUrl: ''
  });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Load initial data
    loadProjects();
    loadDeployments();

    // Socket event listeners
    newSocket.on('deployment-update', (deployment: DeploymentStatus) => {
      setDeployments(prev => {
        const index = prev.findIndex(d => d.id === deployment.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = deployment;
          return updated;
        }
        return [deployment, ...prev];
      });
    });

    newSocket.on('deployment-list-update', (deploymentList: DeploymentStatus[]) => {
      setDeployments(deploymentList);
    });

    return () => newSocket.close();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadDeployments = async () => {
    try {
      const response = await fetch(`${API_BASE}/deployments`);
      const data = await response.json();
      setDeployments(data);
    } catch (error) {
      console.error('Failed to load deployments:', error);
    }
  };

  const startDeployment = async (configId: string) => {
    try {
      const response = await fetch(`${API_BASE}/deployments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId })
      });
      const { deploymentId } = await response.json();
      
      if (socket) {
        socket.emit('join-deployment', deploymentId);
      }
      
      setSelectedDeployment(deploymentId);
    } catch (error) {
      console.error('Failed to start deployment:', error);
    }
  };

  const cancelDeployment = async (deploymentId: string) => {
    try {
      await fetch(`${API_BASE}/deployments/${deploymentId}/cancel`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to cancel deployment:', error);
    }
  };

  const saveProject = async () => {
    try {
      const url = editingProject 
        ? `${API_BASE}/projects/${editingProject.id}`
        : `${API_BASE}/projects`;
      
      const method = editingProject ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });
      
      setShowProjectForm(false);
      setEditingProject(null);
      setProjectForm({
        name: '',
        repository: '',
        branch: 'main',
        environment: 'development',
        buildCommand: 'npm install && npm run build',
        deployCommand: '',
        webhookUrl: ''
      });
      
      loadProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const editProject = (project: DeploymentConfig) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      repository: project.repository,
      branch: project.branch,
      environment: project.environment,
      buildCommand: project.buildCommand || '',
      deployCommand: project.deployCommand || '',
      webhookUrl: project.webhookUrl || ''
    });
    setShowProjectForm(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      cloning: 'default',
      building: 'default',
      deploying: 'default',
      success: 'success',
      failed: 'destructive'
    } as const;
    
    return variants[status as keyof typeof variants] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const selectedDeploymentData = deployments.find(d => d.id === selectedDeployment);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Automated Deployment Bot
          </h1>
          <p className="text-gray-600">
            Manage and monitor your application deployments across multiple environments
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projects</h2>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <GitBranch className="w-4 h-4 mr-1" />
                        {project.branch}
                        <Badge variant="outline" className="ml-2">
                          {project.environment}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editProject(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{project.repository}</p>
                  <Button
                    onClick={() => startDeployment(project.id)}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Deploy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Deployments Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Deployments</h2>
            
            {deployments.slice(0, 10).map(deployment => {
              const project = projects.find(p => p.id === deployment.configId);
              return (
                <Card 
                  key={deployment.id}
                  className={`cursor-pointer transition-all ${
                    selectedDeployment === deployment.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDeployment(deployment.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{project?.name || 'Unknown Project'}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(deployment.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadge(deployment.status)}>
                          {getStatusIcon(deployment.status)}
                          <span className="ml-1">{deployment.status}</span>
                        </Badge>
                        {deployment.status !== 'success' && deployment.status !== 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelDeployment(deployment.id);
                            }}
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={deployment.progress} className="mb-2" />
                    <p className="text-xs text-gray-500">
                      {deployment.logs[deployment.logs.length - 1]?.replace(/^\[.*?\]\s*/, '') || 'No logs yet'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Deployment Details Modal */}
        {selectedDeploymentData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Deployment Details</h3>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDeployment(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={getStatusBadge(selectedDeploymentData.status)}>
                      {selectedDeploymentData.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <Progress value={selectedDeploymentData.progress} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Logs</p>
                  <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
                    {selectedDeploymentData.logs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Form Modal */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Repository URL</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectForm.repository}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, repository: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={projectForm.branch}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, branch: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Environment</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={projectForm.environment}
                      onChange={(e) => setProjectForm(prev => ({ 
                        ...prev, 
                        environment: e.target.value as 'development' | 'staging' | 'production'
                      }))}
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Build Command</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectForm.buildCommand}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, buildCommand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deploy Command</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectForm.deployCommand}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, deployCommand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Webhook URL (optional)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={projectForm.webhookUrl}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProjectForm(false);
                    setEditingProject(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveProject}>
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
