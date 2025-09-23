import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, name: string) {
    const response = await apiClient.post('/auth/register', { email, password, name });
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },
};

export const projectService = {
  async getProjects() {
    const response = await apiClient.get('/projects');
    return response.data.projects;
  },

  async getProject(id: string) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.project;
  },

  async createProject(data: any) {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: any) {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string) {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  async getProjectStats(id: string) {
    const response = await apiClient.get(`/projects/${id}/stats`);
    return response.data.stats;
  },
};

export const pipelineService = {
  async getPipelines(params?: any) {
    const response = await apiClient.get('/pipelines', { params });
    return response.data.pipelines;
  },

  async getPipeline(id: string) {
    const response = await apiClient.get(`/pipelines/${id}`);
    return response.data.pipeline;
  },

  async triggerPipeline(projectId: string, data: any) {
    const response = await apiClient.post(`/pipelines/${projectId}/trigger`, data);
    return response.data;
  },

  async cancelPipeline(id: string) {
    const response = await apiClient.patch(`/pipelines/${id}/cancel`);
    return response.data;
  },

  async getPipelineLogs(id: string) {
    const response = await apiClient.get(`/pipelines/${id}/logs`);
    return response.data.logs;
  },
};

export const deploymentService = {
  async getDeployments(params?: any) {
    const response = await apiClient.get('/deployments', { params });
    return response.data.deployments;
  },

  async getDeployment(id: string) {
    const response = await apiClient.get(`/deployments/${id}`);
    return response.data.deployment;
  },

  async getDeploymentHistory(projectId: string, params?: any) {
    const response = await apiClient.get(`/deployments/project/${projectId}/history`, { params });
    return response.data.deployments;
  },

  async rollbackDeployment(id: string) {
    const response = await apiClient.post(`/deployments/${id}/rollback`);
    return response.data;
  },

  async getDeploymentLogs(id: string) {
    const response = await apiClient.get(`/deployments/${id}/logs`);
    return response.data.logs;
  },

  async getDeploymentStats(params?: any) {
    const response = await apiClient.get('/deployments/stats/overview', { params });
    return response.data.stats;
  },
};

export { apiClient };
