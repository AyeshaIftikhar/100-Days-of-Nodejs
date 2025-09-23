import knex, { Knex } from 'knex';
import path from 'path';

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../data/database.sqlite')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, './migrations')
  },
  seeds: {
    directory: path.join(__dirname, './seeds')
  }
};

export const db = knex(config);

export async function setupDatabase(): Promise<void> {
  try {
    // Create tables
    await createTables();
    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  // Users table
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('name').notNullable();
      table.string('role').defaultTo('user');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Projects table
  if (!(await db.schema.hasTable('projects'))) {
    await db.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('repository_url').notNullable();
      table.string('branch').defaultTo('main');
      table.string('status').defaultTo('active');
      table.text('description');
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.json('environment_variables');
      table.string('webhook_secret');
      table.timestamps(true, true);
    });
  }

  // Pipelines table
  if (!(await db.schema.hasTable('pipelines'))) {
    await db.schema.createTable('pipelines', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('project_id').references('id').inTable('projects').onDelete('CASCADE');
      table.string('trigger_type').notNullable(); // push, pull_request, manual
      table.string('status').defaultTo('pending'); // pending, running, success, failed, cancelled
      table.string('commit_sha');
      table.string('commit_message');
      table.string('author_name');
      table.string('author_email');
      table.timestamp('started_at');
      table.timestamp('completed_at');
      table.integer('duration'); // in seconds
      table.text('logs');
      table.string('workflow_run_id');
      table.timestamps(true, true);
    });
  }

  // Deployments table
  if (!(await db.schema.hasTable('deployments'))) {
    await db.schema.createTable('deployments', (table) => {
      table.increments('id').primary();
      table.integer('pipeline_id').references('id').inTable('pipelines').onDelete('CASCADE');
      table.string('environment').notNullable(); // staging, production, development
      table.string('status').defaultTo('pending'); // pending, deploying, success, failed, rollback
      table.string('deployment_url');
      table.timestamp('deployed_at');
      table.text('deployment_logs');
      table.string('version');
      table.json('metadata');
      table.timestamps(true, true);
    });
  }

  // Pipeline steps table
  if (!(await db.schema.hasTable('pipeline_steps'))) {
    await db.schema.createTable('pipeline_steps', (table) => {
      table.increments('id').primary();
      table.integer('pipeline_id').references('id').inTable('pipelines').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('status').defaultTo('pending');
      table.integer('step_number').notNullable();
      table.timestamp('started_at');
      table.timestamp('completed_at');
      table.text('logs');
      table.timestamps(true, true);
    });
  }

  // Notifications table
  if (!(await db.schema.hasTable('notifications'))) {
    await db.schema.createTable('notifications', (table) => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('type').notNullable(); // deployment_success, deployment_failed, pipeline_failed
      table.string('title').notNullable();
      table.text('message');
      table.boolean('is_read').defaultTo(false);
      table.json('metadata');
      table.timestamps(true, true);
    });
  }
}
