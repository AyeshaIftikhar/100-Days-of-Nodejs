import { Router, Response } from 'express';
import { db } from '../database/setup';
import { AuthRequest } from '../types';

export const deploymentRoutes = Router();

// Get all deployments for user's projects
deploymentRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { environment, status, project_id, limit = 50, offset = 0 } = req.query;

    let query = db('deployments')
      .select(
        'deployments.*',
        'projects.name as project_name',
        'pipelines.name as pipeline_name'
      )
      .join('pipelines', 'deployments.pipeline_id', 'pipelines.id')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where('projects.user_id', req.user!.id)
      .orderBy('deployments.created_at', 'desc');

    if (environment) {
      query = query.where('deployments.environment', environment as string);
    }

    if (status) {
      query = query.where('deployments.status', status as string);
    }

    if (project_id) {
      query = query.where('projects.id', project_id as string);
    }

    const deployments = await query
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({ deployments });
  } catch (error) {
    console.error('Get deployments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment by ID
deploymentRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deployment = await db('deployments')
      .select(
        'deployments.*',
        'projects.name as project_name',
        'pipelines.name as pipeline_name',
        'pipelines.commit_sha',
        'pipelines.commit_message'
      )
      .join('pipelines', 'deployments.pipeline_id', 'pipelines.id')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where({
        'deployments.id': id,
        'projects.user_id': req.user!.id
      })
      .first();

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json({ deployment });
  } catch (error) {
    console.error('Get deployment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment history for a project
deploymentRoutes.get('/project/:project_id/history', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.params;
    const { environment, limit = 20 } = req.query;

    // Verify project ownership
    const project = await db('projects')
      .where({ id: project_id, user_id: req.user!.id })
      .first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let query = db('deployments')
      .select(
        'deployments.*',
        'pipelines.name as pipeline_name',
        'pipelines.commit_sha',
        'pipelines.commit_message',
        'pipelines.author_name'
      )
      .join('pipelines', 'deployments.pipeline_id', 'pipelines.id')
      .where('pipelines.project_id', project_id)
      .orderBy('deployments.created_at', 'desc');

    if (environment) {
      query = query.where('deployments.environment', environment as string);
    }

    const deployments = await query.limit(Number(limit));

    res.json({ deployments });
  } catch (error) {
    console.error('Get deployment history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rollback deployment
deploymentRoutes.post('/:id/rollback', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deployment = await db('deployments')
      .select('deployments.*', 'projects.user_id')
      .join('pipelines', 'deployments.pipeline_id', 'pipelines.id')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where({
        'deployments.id': id,
        'projects.user_id': req.user!.id
      })
      .first();

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    if (deployment.status !== 'success') {
      return res.status(400).json({ error: 'Can only rollback successful deployments' });
    }

    // Update deployment status to rollback
    await db('deployments')
      .where('id', id)
      .update({
        status: 'rollback',
        updated_at: new Date()
      });

    // Create a notification
    await db('notifications').insert({
      user_id: req.user!.id,
      type: 'deployment_failed',
      title: 'Deployment Rollback',
      message: `Deployment ${deployment.id} has been rolled back`,
      metadata: {
        deployment_id: id,
        environment: deployment.environment
      }
    });

    res.json({ message: 'Deployment rollback initiated' });
  } catch (error) {
    console.error('Rollback deployment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment logs
deploymentRoutes.get('/:id/logs', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deployment = await db('deployments')
      .select('deployments.deployment_logs', 'projects.user_id')
      .join('pipelines', 'deployments.pipeline_id', 'pipelines.id')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where({
        'deployments.id': id,
        'projects.user_id': req.user!.id
      })
      .first();

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json({ 
      logs: deployment.deployment_logs || 'No logs available' 
    });
  } catch (error) {
    console.error('Get deployment logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment statistics
deploymentRoutes.get('/stats/overview', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - Number(days));

    let baseQuery = db('deployments')
      .join('pipelines', 'deployments.pipeline_id', 'pipelines.id')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where('projects.user_id', req.user!.id)
      .where('deployments.created_at', '>=', dateLimit);

    if (project_id) {
      baseQuery = baseQuery.where('projects.id', project_id as string);
    }

    const [totalDeployments] = await baseQuery.clone().count('* as count');
    const [successfulDeployments] = await baseQuery.clone().where('deployments.status', 'success').count('* as count');
    const [failedDeployments] = await baseQuery.clone().where('deployments.status', 'failed').count('* as count');

    // Get deployments by environment
    const deploymentsByEnv = await baseQuery.clone()
      .select('environment')
      .count('* as count')
      .groupBy('environment');

    // Get recent deployments
    const recentDeployments = await baseQuery.clone()
      .select(
        'deployments.*',
        'projects.name as project_name',
        'pipelines.commit_sha'
      )
      .orderBy('deployments.created_at', 'desc')
      .limit(10);

    const stats = {
      total_deployments: totalDeployments.count,
      successful_deployments: successfulDeployments.count,
      failed_deployments: failedDeployments.count,
      success_rate: totalDeployments.count > 0 
        ? ((successfulDeployments.count / totalDeployments.count) * 100).toFixed(2)
        : 0,
      deployments_by_environment: deploymentsByEnv,
      recent_deployments: recentDeployments
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get deployment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
