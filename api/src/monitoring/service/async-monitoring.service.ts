import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createHook } from 'async_hooks';
import { LogRotatorService } from './log-rotator.service';

@Injectable()
export class AsyncMonitoringService implements OnModuleInit, OnModuleDestroy {
  private asyncResourceMap: Map<number, string> = new Map();
  private activeHandles: number = 0;
  private pendingCallbacks: number = 0;
  private resolvedPromises: number = 0;
  private rejectedPromises: number = 0;
  private logInterval: NodeJS.Timeout;
  private readonly LOG_HEADER =
    'Timestamp,Active Handles,Pending Callbacks,Resolved Promises,Rejected Promises\n';
  private readonly MAX_TRACKED_RESOURCES = 10000; // Limit tracked resources
  private readonly LOG_THRESHOLD = 100; // Log only when changes exceed this threshold

  constructor(private readonly logRotatorService: LogRotatorService) {}

  private asyncHook = createHook({
    init: (asyncId, type) => {
      if (this.asyncResourceMap.size >= this.MAX_TRACKED_RESOURCES) {
        return; // Do not track new asyncId if limit reached
      }
      this.asyncResourceMap.set(asyncId, type);
      if (type === 'PROMISE') {
        this.pendingCallbacks++;
      }
      this.activeHandles++;
    },
    destroy: (asyncId) => {
      const type = this.asyncResourceMap.get(asyncId);
      if (type === 'PROMISE') {
        this.pendingCallbacks--;
      }
      this.activeHandles--;
      this.asyncResourceMap.delete(asyncId);
    },
    promiseResolve: () => {
      this.resolvedPromises++;
    },
  });

  onModuleInit() {
    this.asyncHook.enable();
    this.logInterval = setInterval(() => this.logMetrics(), 15000); // Adjusted interval
  }

  onModuleDestroy() {
    this.asyncHook.disable();
    clearInterval(this.logInterval);
  }

  logMetrics() {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp},${this.activeHandles},${this.pendingCallbacks},${this.resolvedPromises},${this.rejectedPromises}\n`;

    // Only log if significant changes
    if (
      this.activeHandles > this.LOG_THRESHOLD ||
      this.pendingCallbacks > this.LOG_THRESHOLD ||
      this.resolvedPromises > this.LOG_THRESHOLD ||
      this.rejectedPromises > this.LOG_THRESHOLD
    ) {
      this.logRotatorService.appendToFile(
        'async-metrics',
        logMessage,
        this.LOG_HEADER,
      );
    }

    // Reset counts after logging
    this.resolvedPromises = 0;
    this.rejectedPromises = 0;
  }
}
