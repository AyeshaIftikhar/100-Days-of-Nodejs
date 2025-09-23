import * as si from 'systeminformation';
import cron from 'node-cron';
import { Metric } from '../models/Metric';
import { Server } from '../models/Server';
import { logger } from '../utils/logger';
import { WebSocketService } from './WebSocketService';

export class MetricsCollector {
  private isCollecting: boolean = false;
  private cronJob: cron.ScheduledTask | null = null;
  private webSocketService: WebSocketService;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  public startCollection(): void {
    if (this.isCollecting) {
      logger.warn('Metrics collection is already running');
      return;
    }

    const interval = process.env.METRICS_COLLECTION_INTERVAL || '5000';
    const cronPattern = this.convertIntervalToCron(parseInt(interval));

    this.cronJob = cron.schedule(cronPattern, async () => {
      await this.collectMetrics();
    });

    this.isCollecting = true;
    logger.info(`🔄 Started metrics collection with interval: ${interval}ms`);
  }

  public stopCollection(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isCollecting = false;
    logger.info('⏹️ Stopped metrics collection');
  }

  private convertIntervalToCron(intervalMs: number): string {
    const seconds = Math.floor(intervalMs / 1000);
    if (seconds < 60) {
      return `*/${seconds} * * * * *`;
    }
    const minutes = Math.floor(seconds / 60);
    return `*/${minutes} * * * *`;
  }

  private async collectMetrics(): Promise<void> {
    try {
      const servers = await Server.find({ isActive: true });
      
      for (const server of servers) {
        await this.collectServerMetrics(server._id);
      }
    } catch (error) {
      logger.error('Error in metrics collection:', error);
    }
  }

  private async collectServerMetrics(serverId: string): Promise<void> {
    try {
      // Get system information
      const [cpu, memory, diskLayout, fsSize, networkStats, processes, time] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.diskLayout(),
        si.fsSize(),
        si.networkStats(),
        si.processes(),
        si.time(),
      ]);

      // Calculate CPU usage
      const cpuUsage = cpu.currentLoad || 0;
      const cpuCores = cpu.cpus?.length || 1;
      const loadAverage = cpu.avgLoad ? [cpu.avgLoad] : [0];

      // Calculate memory metrics
      const memoryUsed = memory.used || 0;
      const memoryTotal = memory.total || 1;
      const memoryAvailable = memory.available || 0;
      const memoryPercentage = (memoryUsed / memoryTotal) * 100;

      // Calculate disk metrics
      let diskUsed = 0;
      let diskTotal = 0;
      let diskAvailable = 0;
      const diskDevices: any[] = [];

      fsSize.forEach((disk) => {
        diskUsed += disk.used || 0;
        diskTotal += disk.size || 0;
        diskAvailable += disk.available || 0;
        
        if (disk.fs) {
          diskDevices.push({
            device: disk.fs,
            mountpoint: disk.mount,
            used: disk.used || 0,
            total: disk.size || 0,
            percentage: disk.use || 0,
          });
        }
      });

      const diskPercentage = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

      // Calculate network metrics
      let networkBytesIn = 0;
      let networkBytesOut = 0;
      let networkPacketsIn = 0;
      let networkPacketsOut = 0;
      const networkInterfaces: any[] = [];

      networkStats.forEach((net) => {
        networkBytesIn += net.rx_bytes || 0;
        networkBytesOut += net.tx_bytes || 0;
        networkPacketsIn += net.rx_packets || 0;
        networkPacketsOut += net.tx_packets || 0;

        if (net.iface) {
          networkInterfaces.push({
            name: net.iface,
            bytesIn: net.rx_bytes || 0,
            bytesOut: net.tx_bytes || 0,
          });
        }
      });

      // Process information
      const processStats = {
        total: processes.all || 0,
        running: processes.running || 0,
        sleeping: processes.sleeping || 0,
        zombie: processes.zombie || 0,
      };

      // Create metric document
      const metric = new Metric({
        serverId,
        timestamp: new Date(),
        cpu: {
          usage: Math.round(cpuUsage * 100) / 100,
          cores: cpuCores,
          loadAverage,
        },
        memory: {
          used: memoryUsed,
          total: memoryTotal,
          available: memoryAvailable,
          percentage: Math.round(memoryPercentage * 100) / 100,
        },
        disk: {
          used: diskUsed,
          total: diskTotal,
          available: diskAvailable,
          percentage: Math.round(diskPercentage * 100) / 100,
          devices: diskDevices,
        },
        network: {
          bytesIn: networkBytesIn,
          bytesOut: networkBytesOut,
          packetsIn: networkPacketsIn,
          packetsOut: networkPacketsOut,
          interfaces: networkInterfaces,
        },
        processes: processStats,
        uptime: time.uptime || 0,
      });

      // Save to database
      await metric.save();

      // Update server last seen
      await Server.findByIdAndUpdate(serverId, { lastSeen: new Date() });

      // Emit real-time data via WebSocket
      this.webSocketService.emitMetrics(serverId, metric.toObject());

      logger.debug(`Collected metrics for server ${serverId}`);
    } catch (error) {
      logger.error(`Error collecting metrics for server ${serverId}:`, error);
    }
  }

  public async collectSingleServerMetrics(serverId: string): Promise<any> {
    try {
      const server = await Server.findById(serverId);
      if (!server) {
        throw new Error('Server not found');
      }

      await this.collectServerMetrics(serverId);
      
      // Return latest metric
      const latestMetric = await Metric.findOne({ serverId })
        .sort({ timestamp: -1 })
        .lean();

      return latestMetric;
    } catch (error) {
      logger.error(`Error collecting single server metrics for ${serverId}:`, error);
      throw error;
    }
  }

  public getCollectionStatus(): { isCollecting: boolean; interval?: string } {
    return {
      isCollecting: this.isCollecting,
      interval: this.isCollecting ? process.env.METRICS_COLLECTION_INTERVAL : undefined,
    };
  }
}
