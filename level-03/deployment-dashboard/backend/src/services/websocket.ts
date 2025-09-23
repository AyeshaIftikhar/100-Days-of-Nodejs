import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '../database/setup';

export function setupWebSocket(io: Server): void {
  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
      const user = await db('users').where('id', decoded.userId).first();
      
      if (!user || !user.is_active) {
        return next(new Error('Authentication error'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User ${user.email} connected`);

    // Join user to their own room for targeted notifications
    socket.join(`user_${user.id}`);

    // Join user to their projects' rooms
    socket.on('join_project', async (projectId: string) => {
      try {
        // Verify user owns the project
        const project = await db('projects')
          .where({ id: projectId, user_id: user.id })
          .first();

        if (project) {
          socket.join(`project_${projectId}`);
          console.log(`User ${user.email} joined project ${projectId}`);
        }
      } catch (error) {
        console.error('Error joining project room:', error);
      }
    });

    // Leave project room
    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project_${projectId}`);
      console.log(`User ${user.email} left project ${projectId}`);
    });

    // Request real-time pipeline status
    socket.on('subscribe_pipeline', async (pipelineId: string) => {
      try {
        // Verify user has access to this pipeline
        const pipeline = await db('pipelines')
          .join('projects', 'pipelines.project_id', 'projects.id')
          .where({
            'pipelines.id': pipelineId,
            'projects.user_id': user.id
          })
          .first();

        if (pipeline) {
          socket.join(`pipeline_${pipelineId}`);
          
          // Send current pipeline status
          socket.emit('pipeline_status', {
            pipeline_id: pipelineId,
            status: pipeline.status,
            progress: calculatePipelineProgress(pipeline.status)
          });
        }
      } catch (error) {
        console.error('Error subscribing to pipeline:', error);
      }
    });

    // Unsubscribe from pipeline updates
    socket.on('unsubscribe_pipeline', (pipelineId: string) => {
      socket.leave(`pipeline_${pipelineId}`);
    });

    // Get notifications
    socket.on('get_notifications', async () => {
      try {
        const notifications = await db('notifications')
          .where('user_id', user.id)
          .orderBy('created_at', 'desc')
          .limit(20);

        socket.emit('notifications', notifications);
      } catch (error) {
        console.error('Error getting notifications:', error);
      }
    });

    // Mark notification as read
    socket.on('mark_notification_read', async (notificationId: string) => {
      try {
        await db('notifications')
          .where({ id: notificationId, user_id: user.id })
          .update({ is_read: true });

        socket.emit('notification_updated', { id: notificationId, is_read: true });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${user.email} disconnected`);
    });
  });

  // Helper function to emit notifications to specific users
  global.emitToUser = (userId: number, event: string, data: any) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  // Helper function to emit updates to project subscribers
  global.emitToProject = (projectId: number, event: string, data: any) => {
    io.to(`project_${projectId}`).emit(event, data);
  };

  // Helper function to emit pipeline updates
  global.emitToPipeline = (pipelineId: number, event: string, data: any) => {
    io.to(`pipeline_${pipelineId}`).emit(event, data);
  };
}

function calculatePipelineProgress(status: string): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'running':
      return 50;
    case 'success':
      return 100;
    case 'failed':
    case 'cancelled':
      return 100;
    default:
      return 0;
  }
}

// Declare global functions for use in other modules
declare global {
  var emitToUser: (userId: number, event: string, data: any) => void;
  var emitToProject: (projectId: number, event: string, data: any) => void;
  var emitToPipeline: (pipelineId: number, event: string, data: any) => void;
}
