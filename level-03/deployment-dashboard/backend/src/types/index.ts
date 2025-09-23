import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  name: string;
  repository_url: string;
  branch: string;
  status: 'active' | 'inactive' | 'archived';
  description?: string;
  user_id: number;
  environment_variables?: Record<string, string>;
  webhook_secret?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Pipeline {
  id: number;
  name: string;
  project_id: number;
  trigger_type: 'push' | 'pull_request' | 'manual';
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  commit_sha?: string;
  commit_message?: string;
  author_name?: string;
  author_email?: string;
  started_at?: Date;
  completed_at?: Date;
  duration?: number;
  logs?: string;
  workflow_run_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Deployment {
  id: number;
  pipeline_id: number;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rollback';
  deployment_url?: string;
  deployed_at?: Date;
  deployment_logs?: string;
  version?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface PipelineStep {
  id: number;
  pipeline_id: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  step_number: number;
  started_at?: Date;
  completed_at?: Date;
  logs?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'deployment_success' | 'deployment_failed' | 'pipeline_failed' | 'pipeline_success';
  title: string;
  message?: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface WebhookPayload {
  action: string;
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  head_commit?: {
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  };
  workflow_run?: {
    id: number;
    status: string;
    conclusion: string;
    workflow_id: number;
    created_at: string;
    updated_at: string;
  };
}
