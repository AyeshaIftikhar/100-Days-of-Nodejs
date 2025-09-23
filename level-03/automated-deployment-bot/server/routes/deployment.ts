import { Router } from 'express';
import DeploymentService from '../services/DeploymentService';

export default function deploymentRoutes(deploymentService: DeploymentService) {
  const router = Router();

  // Get all deployments
  router.get('/', (req, res) => {
    try {
      const deployments = deploymentService.getDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch deployments' });
    }
  });

  // Get specific deployment
  router.get('/:id', (req, res) => {
    try {
      const deployment = deploymentService.getDeployment(req.params.id);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch deployment' });
    }
  });

  // Start new deployment
  router.post('/', async (req, res) => {
    try {
      const { configId } = req.body;
      if (!configId) {
        return res.status(400).json({ error: 'configId is required' });
      }

      const deploymentId = await deploymentService.startDeployment(configId);
      res.status(201).json({ deploymentId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel deployment
  router.post('/:id/cancel', async (req, res) => {
    try {
      const cancelled = await deploymentService.cancelDeployment(req.params.id);
      if (!cancelled) {
        return res.status(400).json({ error: 'Cannot cancel deployment' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel deployment' });
    }
  });

  return router;
}
