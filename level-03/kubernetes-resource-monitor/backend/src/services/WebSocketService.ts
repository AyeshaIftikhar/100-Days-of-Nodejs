import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: Server;
  private connectedClients: Map<string, any> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`🔌 Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Handle authentication
      socket.on('authenticate', (data) => {
        // In a real application, verify the JWT token here
        socket.join('authenticated');
        logger.info(`✅ Client authenticated: ${socket.id}`);
      });

      // Handle server subscription
      socket.on('subscribe_server', (serverId: string) => {
        socket.join(`server_${serverId}`);
        logger.info(`📊 Client subscribed to server ${serverId}: ${socket.id}`);
      });

      // Handle unsubscription
      socket.on('unsubscribe_server', (serverId: string) => {
        socket.leave(`server_${serverId}`);
        logger.info(`📴 Client unsubscribed from server ${serverId}: ${socket.id}`);
      });

      // Handle dashboard subscription
      socket.on('subscribe_dashboard', () => {
        socket.join('dashboard');
        logger.info(`📊 Client subscribed to dashboard: ${socket.id}`);
      });

      // Handle alerts subscription
      socket.on('subscribe_alerts', () => {
        socket.join('alerts');
        logger.info(`🚨 Client subscribed to alerts: ${socket.id}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        logger.info(`🔌 Client disconnected: ${socket.id}`);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  // Emit metrics data to clients subscribed to a specific server
  public emitMetrics(serverId: string, metrics: any): void {
    this.io.to(`server_${serverId}`).emit('metrics_update', {
      serverId,
      metrics,
      timestamp: new Date().toISOString(),
    });

    // Also emit to dashboard subscribers
    this.io.to('dashboard').emit('metrics_update', {
      serverId,
      metrics,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit alert to all authenticated clients
  public emitAlert(alert: any): void {
    this.io.to('alerts').emit('alert_triggered', {
      alert,
      timestamp: new Date().toISOString(),
    });

    // Also emit to specific server subscribers
    this.io.to(`server_${alert.serverId}`).emit('alert_triggered', {
      alert,
      timestamp: new Date().toISOString(),
    });

    logger.info(`🚨 Alert emitted: ${alert.title} for server ${alert.serverId}`);
  }

  // Emit alert resolution
  public emitAlertResolution(alert: any): void {
    this.io.to('alerts').emit('alert_resolved', {
      alert,
      timestamp: new Date().toISOString(),
    });

    this.io.to(`server_${alert.serverId}`).emit('alert_resolved', {
      alert,
      timestamp: new Date().toISOString(),
    });

    logger.info(`✅ Alert resolved: ${alert.title} for server ${alert.serverId}`);
  }

  // Emit server status updates
  public emitServerStatus(serverId: string, status: 'online' | 'offline'): void {
    this.io.to(`server_${serverId}`).emit('server_status', {
      serverId,
      status,
      timestamp: new Date().toISOString(),
    });

    this.io.to('dashboard').emit('server_status', {
      serverId,
      status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📡 Server status emitted: ${serverId} is ${status}`);
  }

  // Emit system notifications
  public emitNotification(type: 'info' | 'warning' | 'error' | 'success', message: string, data?: any): void {
    this.io.to('authenticated').emit('notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to all connected clients
  public broadcast(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connection statistics
  public getConnectionStats(): any {
    return {
      totalConnections: this.connectedClients.size,
      connectedClients: Array.from(this.connectedClients.keys()),
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
    };
  }

  // Send heartbeat to all clients
  public sendHeartbeat(): void {
    this.io.emit('heartbeat', {
      timestamp: new Date().toISOString(),
      server: 'healthy',
    });
  }
}
