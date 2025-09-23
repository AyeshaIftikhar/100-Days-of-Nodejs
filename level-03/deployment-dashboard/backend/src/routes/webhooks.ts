import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../database/setup';
import { WebhookPayload } from '../types';
import { io } from '../server';

export const webhookRoutes = Router();

// GitHub webhook endpoint
webhookRoutes.post('/github', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature (optional, but recommended)
    if (signature && process.env.GITHUB_WEBHOOK_SECRET) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const webhookPayload: WebhookPayload = req.body;
    const eventType = req.headers['x-github-event'] as string;

    console.log(`Received GitHub webhook: ${eventType}`);

    switch (eventType) {
      case 'push':
        await handlePushEvent(webhookPayload);
        break;
      case 'workflow_run':
        await handleWorkflowRunEvent(webhookPayload);
        break;
      case 'deployment_status':
        await handleDeploymentStatusEvent(webhookPayload);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePushEvent(payload: WebhookPayload): Promise<void> {
  try {
    // Find project by repository URL
    const project = await db('projects')
      .where('repository_url', 'like', `%${payload.repository.name}%`)
      .first();

    if (!project) {
      console.log(`No project found for repository: ${payload.repository.name}`);
      return;
    }

    // Create new pipeline
    const [pipelineId] = await db('pipelines').insert({
      name: `Push to ${payload.repository.name}`,
      project_id: project.id,
      trigger_type: 'push',
      status: 'pending',
      commit_sha: payload.head_commit?.id,
      commit_message: payload.head_commit?.message,
      author_name: payload.head_commit?.author.name,
      author_email: payload.head_commit?.author.email,
      started_at: new Date()
    });

    // Create pipeline steps
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

    // Emit real-time update
    io.emit('pipeline_created', {
      pipeline_id: pipelineId,
      project_id: project.id,
      status: 'pending'
    });

    console.log(`Created pipeline ${pipelineId} for push event`);
  } catch (error) {
    console.error('Error handling push event:', error);
  }
}

async function handleWorkflowRunEvent(payload: WebhookPayload): Promise<void> {
  try {
    if (!payload.workflow_run) return;

    // Find pipeline by workflow run ID
    const pipeline = await db('pipelines')
      .where('workflow_run_id', payload.workflow_run.id)
      .first();

    if (!pipeline) {
      console.log(`No pipeline found for workflow run: ${payload.workflow_run.id}`);
      return;
    }

    // Update pipeline status
    const status = payload.workflow_run.conclusion === 'success' ? 'success' : 
                   payload.workflow_run.conclusion === 'failure' ? 'failed' : 
                   payload.workflow_run.status === 'in_progress' ? 'running' : 'pending';

    await db('pipelines')
      .where('id', pipeline.id)
      .update({
        status,
        completed_at: payload.workflow_run.conclusion ? new Date() : null,
        updated_at: new Date()
      });

    // Create notification for failed pipelines
    if (status === 'failed') {
      const project = await db('projects').where('id', pipeline.project_id).first();
      await db('notifications').insert({
        user_id: project.user_id,
        type: 'pipeline_failed',
        title: 'Pipeline Failed',
        message: `Pipeline "${pipeline.name}" has failed`,
        metadata: {
          pipeline_id: pipeline.id,
          project_id: pipeline.project_id
        }
      });
    }

    // Emit real-time update
    io.emit('pipeline_updated', {
      pipeline_id: pipeline.id,
      project_id: pipeline.project_id,
      status
    });

    console.log(`Updated pipeline ${pipeline.id} status to ${status}`);
  } catch (error) {
    console.error('Error handling workflow run event:', error);
  }
}

async function handleDeploymentStatusEvent(payload: any): Promise<void> {
  try {
    // Handle deployment status updates
    // This would be implemented based on your deployment provider
    console.log('Deployment status event received:', payload);
  } catch (error) {
    console.error('Error handling deployment status event:', error);
  }
}

// Generic webhook endpoint for other CI/CD tools
webhookRoutes.post('/generic', async (req: Request, res: Response) => {
  try {
    const { project_id, status, environment, deployment_url, logs } = req.body;

    // Verify project exists
    const project = await db('projects').where('id', project_id).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create or update deployment
    if (status && environment) {
      const [deploymentId] = await db('deployments').insert({
        pipeline_id: null, // Generic webhook might not have pipeline context
        environment,
        status,
        deployment_url,
        deployment_logs: logs,
        deployed_at: status === 'success' ? new Date() : null
      });

      // Emit real-time update
      io.emit('deployment_updated', {
        deployment_id: deploymentId,
        project_id,
        status,
        environment
      });
    }

    res.status(200).json({ message: 'Generic webhook processed successfully' });
  } catch (error) {
    console.error('Generic webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
