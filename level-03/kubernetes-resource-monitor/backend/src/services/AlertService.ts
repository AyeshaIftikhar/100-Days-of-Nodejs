import cron from 'node-cron';
import { Alert } from '../models/Alert';
import { Metric } from '../models/Metric';
import { Server } from '../models/Server';
import { logger } from '../utils/logger';
import { WebSocketService } from './WebSocketService';

export class AlertService {
  private isMonitoring: boolean = false;
  private cronJob: cron.ScheduledTask | null = null;
  private webSocketService: WebSocketService;
  private alertRules: AlertRule[] = [];

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
    this.initializeDefaultRules();
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('Alert monitoring is already running');
      return;
    }

    // Check for alerts every 30 seconds
    this.cronJob = cron.schedule('*/30 * * * * *', async () => {
      await this.checkAlerts();
    });

    this.isMonitoring = true;
    logger.info('🚨 Started alert monitoring');
  }

  public stopMonitoring(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isMonitoring = false;
    logger.info('⏹️ Stopped alert monitoring');
  }

  private initializeDefaultRules(): void {
    this.alertRules = [
      {
        id: 'cpu_high',
        type: 'cpu',
        metric: 'cpu.usage',
        operator: 'gte',
        threshold: parseFloat(process.env.ALERT_THRESHOLD_CPU || '80'),
        severity: 'high',
        title: 'High CPU Usage',
        messageTemplate: 'CPU usage is {value}% (threshold: {threshold}%)',
      },
      {
        id: 'memory_high',
        type: 'memory',
        metric: 'memory.percentage',
        operator: 'gte',
        threshold: parseFloat(process.env.ALERT_THRESHOLD_MEMORY || '85'),
        severity: 'high',
        title: 'High Memory Usage',
        messageTemplate: 'Memory usage is {value}% (threshold: {threshold}%)',
      },
      {
        id: 'disk_high',
        type: 'disk',
        metric: 'disk.percentage',
        operator: 'gte',
        threshold: parseFloat(process.env.ALERT_THRESHOLD_DISK || '90'),
        severity: 'critical',
        title: 'High Disk Usage',
        messageTemplate: 'Disk usage is {value}% (threshold: {threshold}%)',
      },
      {
        id: 'cpu_critical',
        type: 'cpu',
        metric: 'cpu.usage',
        operator: 'gte',
        threshold: 95,
        severity: 'critical',
        title: 'Critical CPU Usage',
        messageTemplate: 'CPU usage is critically high at {value}% (threshold: {threshold}%)',
      },
      {
        id: 'memory_critical',
        type: 'memory',
        metric: 'memory.percentage',
        operator: 'gte',
        threshold: 95,
        severity: 'critical',
        title: 'Critical Memory Usage',
        messageTemplate: 'Memory usage is critically high at {value}% (threshold: {threshold}%)',
      },
    ];
  }

  private async checkAlerts(): Promise<void> {
    try {
      const servers = await Server.find({ isActive: true });
      
      for (const server of servers) {
        await this.checkServerAlerts(server._id);
      }
    } catch (error) {
      logger.error('Error checking alerts:', error);
    }
  }

  private async checkServerAlerts(serverId: string): Promise<void> {
    try {
      // Get the latest metric for the server
      const latestMetric = await Metric.findOne({ serverId })
        .sort({ timestamp: -1 })
        .lean();

      if (!latestMetric) {
        return;
      }

      // Check each alert rule
      for (const rule of this.alertRules) {
        await this.evaluateAlertRule(serverId, latestMetric, rule);
      }
    } catch (error) {
      logger.error(`Error checking alerts for server ${serverId}:`, error);
    }
  }

  private async evaluateAlertRule(serverId: string, metric: any, rule: AlertRule): Promise<void> {
    try {
      const value = this.getMetricValue(metric, rule.metric);
      const isTriggered = this.evaluateCondition(value, rule.operator, rule.threshold);

      // Check if there's an existing active alert for this rule
      const existingAlert = await Alert.findOne({
        serverId,
        type: rule.type,
        'threshold.metric': rule.metric,
        status: 'active',
      });

      if (isTriggered && !existingAlert) {
        // Create new alert
        await this.createAlert(serverId, metric, rule, value);
      } else if (!isTriggered && existingAlert) {
        // Resolve existing alert
        await this.resolveAlert(existingAlert);
      } else if (isTriggered && existingAlert) {
        // Update existing alert with new value
        existingAlert.currentValue = value;
        existingAlert.updatedAt = new Date();
        await existingAlert.save();
      }
    } catch (error) {
      logger.error(`Error evaluating alert rule ${rule.id}:`, error);
    }
  }

  private getMetricValue(metric: any, metricPath: string): number {
    const parts = metricPath.split('.');
    let value = metric;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return 0;
      }
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'gte':
        return value >= threshold;
      case 'lt':
        return value < threshold;
      case 'lte':
        return value <= threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  private async createAlert(serverId: string, metric: any, rule: AlertRule, currentValue: number): Promise<void> {
    try {
      const message = rule.messageTemplate
        .replace('{value}', currentValue.toFixed(2))
        .replace('{threshold}', rule.threshold.toString());

      const alert = new Alert({
        serverId,
        type: rule.type,
        severity: rule.severity,
        title: rule.title,
        message,
        threshold: {
          metric: rule.metric,
          value: rule.threshold,
          operator: rule.operator,
        },
        currentValue,
        status: 'active',
        metadata: {
          ruleId: rule.id,
          metricTimestamp: metric.timestamp,
        },
      });

      await alert.save();

      // Emit alert via WebSocket
      this.webSocketService.emitAlert(alert.toObject());

      logger.warn(`🚨 Alert created: ${alert.title} for server ${serverId}`);
    } catch (error) {
      logger.error('Error creating alert:', error);
    }
  }

  private async resolveAlert(alert: any): Promise<void> {
    try {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      await alert.save();

      // Emit alert resolution via WebSocket
      this.webSocketService.emitAlertResolution(alert.toObject());

      logger.info(`✅ Alert resolved: ${alert.title} for server ${alert.serverId}`);
    } catch (error) {
      logger.error('Error resolving alert:', error);
    }
  }

  public async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      alert.status = 'acknowledged';
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      await alert.save();

      logger.info(`👁️ Alert acknowledged: ${alert.title} by user ${userId}`);
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  public async getActiveAlerts(serverId?: string): Promise<any[]> {
    try {
      const query: any = { status: 'active' };
      if (serverId) {
        query.serverId = serverId;
      }

      const alerts = await Alert.find(query)
        .populate('serverId', 'name hostname environment')
        .sort({ createdAt: -1 })
        .lean();

      return alerts;
    } catch (error) {
      logger.error('Error getting active alerts:', error);
      throw error;
    }
  }

  public getMonitoringStatus(): { isMonitoring: boolean; rulesCount: number } {
    return {
      isMonitoring: this.isMonitoring,
      rulesCount: this.alertRules.length,
    };
  }
}

interface AlertRule {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  messageTemplate: string;
}
