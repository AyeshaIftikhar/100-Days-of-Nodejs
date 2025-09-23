import { Router, Response } from 'express';
import { db } from '../database/setup';
import { AuthRequest } from '../types';

export const pipelineRoutes = Router();

// Get all pipelines for user's projects
pipelineRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, project_id, limit = 50, offset = 0 } = req.query;

    let query = db('pipelines')
      .select('pipelines.*', 'projects.name as project_name')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where('projects.user_id', req.user!.id)
      .orderBy('pipelines.created_at', 'desc');

    if (status) {
      query = query.where('pipelines.status', status as string);
    }

    if (project_id) {
      query = query.where('pipelines.project_id', project_id as string);
    }

    const pipelines = await query
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({ pipelines });
  } catch (error) {
    console.error('Get pipelines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pipeline by ID
pipelineRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const pipeline = await db('pipelines')
      .select('pipelines.*', 'projects.name as project_name')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where({
        'pipelines.id': id,
        'projects.user_id': req.user!.id
      })
      .first();

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Get pipeline steps
    const steps = await db('pipeline_steps')
      .where('pipeline_id', id)
      .orderBy('step_number', 'asc');

    // Get deployments
    const deployments = await db('deployments')
      .where('pipeline_id', id)
      .orderBy('created_at', 'desc');

    res.json({ 
      pipeline: {
        ...pipeline,
        steps,
        deployments
      }
    });
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual pipeline
pipelineRoutes.post('/:project_id/trigger', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.params;
    const { commit_sha, commit_message } = req.body;

    // Verify project ownership
    const project = await db('projects')
      .where({ id: project_id, user_id: req.user!.id })
      .first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create pipeline
    const [pipelineId] = await db('pipelines').insert({
      name: `Manual trigger - ${new Date().toISOString()}`,
      project_id,
      trigger_type: 'manual',
      status: 'pending',
      commit_sha,
      commit_message: commit_message || 'Manual trigger',
      author_name: req.user!.name,
      author_email: req.user!.email,
      started_at: new Date()
    });

    // Create initial pipeline steps
    const steps = [
      { name: 'Checkout', step_number: 1 },
      { name: 'Install Dependencies', step_number: 2 },
      { name: 'Run Tests', step_number: 3 },
      { name: 'Build', step_number: 4 },
      { name: 'Deploy', step_number: 5 }
    ];

    for (const step of steps) {
      await db('pipeline_steps').insert({
        pipeline_id: pipelineId,
        ...step,
        status: 'pending'
      });
    }

    const pipeline = await db('pipelines').where('id', pipelineId).first();

    res.status(201).json({ 
      message: 'Pipeline triggered successfully', 
      pipeline 
    });
  } catch (error) {
    console.error('Trigger pipeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pipeline logs
pipelineRoutes.get('/:id/logs', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const pipeline = await db('pipelines')
      .select('pipelines.*')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where({
        'pipelines.id': id,
        'projects.user_id': req.user!.id
      })
      .first();

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const steps = await db('pipeline_steps')
      .where('pipeline_id', id)
      .orderBy('step_number', 'asc')
      .select('name', 'status', 'logs', 'started_at', 'completed_at');

    res.json({ 
      logs: {
        pipeline_logs: pipeline.logs,
        steps: steps
      }
    });
  } catch (error) {
    console.error('Get pipeline logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel pipeline
pipelineRoutes.patch('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const pipeline = await db('pipelines')
      .select('pipelines.*')
      .join('projects', 'pipelines.project_id', 'projects.id')
      .where({
        'pipelines.id': id,
        'projects.user_id': req.user!.id
      })
      .first();

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    if (!['pending', 'running'].includes(pipeline.status)) {
      return res.status(400).json({ error: 'Pipeline cannot be cancelled' });
    }

    await db('pipelines')
      .where('id', id)
      .update({
        status: 'cancelled',
        completed_at: new Date(),
        updated_at: new Date()
      });

    res.json({ message: 'Pipeline cancelled successfully' });
  } catch (error) {
    console.error('Cancel pipeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
