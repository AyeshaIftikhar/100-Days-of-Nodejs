import { Router, Response } from 'express';
import Joi from 'joi';
import { db } from '../database/setup';
import { AuthRequest, Project } from '../types';

export const projectRoutes = Router();

const projectSchema = Joi.object({
  name: Joi.string().min(2).required(),
  repository_url: Joi.string().uri().required(),
  branch: Joi.string().default('main'),
  description: Joi.string().allow(''),
  environment_variables: Joi.object().pattern(Joi.string(), Joi.string())
});

// Get all projects for user
projectRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await db('projects')
      .where('user_id', req.user!.id)
      .orderBy('created_at', 'desc');

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project by ID
projectRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await db('projects')
      .where({ id, user_id: req.user!.id })
      .first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
projectRoutes.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const projectData = {
      ...value,
      user_id: req.user!.id,
      webhook_secret: generateWebhookSecret()
    };

    const [projectId] = await db('projects').insert(projectData);
    const project = await db('projects').where('id', projectId).first();

    res.status(201).json({ 
      message: 'Project created successfully', 
      project 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
projectRoutes.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingProject = await db('projects')
      .where({ id, user_id: req.user!.id })
      .first();

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db('projects')
      .where({ id, user_id: req.user!.id })
      .update({
        ...value,
        updated_at: new Date()
      });

    const project = await db('projects').where('id', id).first();

    res.json({ 
      message: 'Project updated successfully', 
      project 
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
projectRoutes.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingProject = await db('projects')
      .where({ id, user_id: req.user!.id })
      .first();

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db('projects')
      .where({ id, user_id: req.user!.id })
      .delete();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project statistics
projectRoutes.get('/:id/stats', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await db('projects')
      .where({ id, user_id: req.user!.id })
      .first();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const [totalPipelines] = await db('pipelines')
      .where('project_id', id)
      .count('* as count');

    const [successfulPipelines] = await db('pipelines')
      .where({ project_id: id, status: 'success' })
      .count('* as count');

    const [failedPipelines] = await db('pipelines')
      .where({ project_id: id, status: 'failed' })
      .count('* as count');

    const recentPipelines = await db('pipelines')
      .where('project_id', id)
      .orderBy('created_at', 'desc')
      .limit(10);

    const stats = {
      total_pipelines: totalPipelines.count,
      successful_pipelines: successfulPipelines.count,
      failed_pipelines: failedPipelines.count,
      success_rate: totalPipelines.count > 0 
        ? ((successfulPipelines.count / totalPipelines.count) * 100).toFixed(2)
        : 0,
      recent_pipelines: recentPipelines
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateWebhookSecret(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
