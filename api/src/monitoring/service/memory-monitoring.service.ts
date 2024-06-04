import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { LogRotatorService } from './log-rotator.service';

@Injectable()
export class MemoryMonitoringService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MemoryMonitoringService.name);
  private isActive: boolean = true;
  private monitoringSubscription: Subscription;

  constructor(private logRotatorService: LogRotatorService) {}

  onModuleInit() {
    this.startMonitoring();
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  private startMonitoring() {
    const header = 'timestamp,rss,heapTotal,heapUsed,external,arrayBuffers\n';
    // Initial check interval and subscription setup for memory monitoring
    const checkInterval = 10000; // Memory check every 10 seconds

    this.monitoringSubscription = interval(checkInterval)
      .pipe(takeWhile(() => this.isActive))
      .subscribe(() => {
        const memoryUsage = process.memoryUsage();
        const formattedMemoryUsage = {
          timestamp: new Date().toISOString(),
          rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
          heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          external: (memoryUsage.external / 1024 / 1024).toFixed(2),
          arrayBuffers: (memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2),
        };
        const dataToLog = `${formattedMemoryUsage.timestamp},${formattedMemoryUsage.rss},${formattedMemoryUsage.heapTotal},${formattedMemoryUsage.heapUsed},${formattedMemoryUsage.external},${formattedMemoryUsage.arrayBuffers}\n`;
        this.logRotatorService.appendToFile('memory-usage', dataToLog, header);
      });
  }

  private stopMonitoring() {
    this.isActive = false;
    this.monitoringSubscription.unsubscribe();
    this.logger.log('Memory monitoring stopped.');
  }
}
