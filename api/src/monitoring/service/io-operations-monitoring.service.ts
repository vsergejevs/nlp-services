import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createHook } from 'async_hooks';
import { performance } from 'perf_hooks';
import { LogRotatorService } from './log-rotator.service';

@Injectable()
export class IOOperationsMonitoringService
  implements OnModuleInit, OnModuleDestroy
{
  private ioOperationCount: number = 0;
  private ioOperationDuration: number = 0;
  private ioWaitTime: number = 0;
  private logInterval: NodeJS.Timeout;
  private readonly LOG_HEADER =
    'Timestamp,IO Operation Count,Average IO Duration (ms),Total IO Wait Time (ms)\n';

  constructor(private readonly logRotatorService: LogRotatorService) {}

  private asyncHook = createHook({
    init: (asyncId, type) => {
      if (
        type === 'FSREQCALLBACK' ||
        type === 'GETADDRINFOREQWRAP' ||
        type === 'GETNAMEINFOREQWRAP'
      ) {
        performance.mark(`start-${asyncId}`);
      }
    },
    before: (asyncId) => {
      performance.mark(`before-${asyncId}`);
    },
    after: (asyncId) => {
      performance.mark(`after-${asyncId}`);
    },
    destroy: (asyncId) => {
      if (performance.getEntriesByName(`start-${asyncId}`).length > 0) {
        performance.mark(`end-${asyncId}`);
        performance.measure(
          `IO Operation ${asyncId}`,
          `start-${asyncId}`,
          `end-${asyncId}`,
        );
        performance.measure(
          `IO Wait ${asyncId}`,
          `before-${asyncId}`,
          `after-${asyncId}`,
        );

        const duration = performance.getEntriesByName(
          `IO Operation ${asyncId}`,
        )[0].duration;
        const waitTime = performance.getEntriesByName(`IO Wait ${asyncId}`)[0]
          .duration;

        this.ioOperationCount++;
        this.ioOperationDuration += duration;
        this.ioWaitTime += waitTime;

        performance.clearMarks(`start-${asyncId}`);
        performance.clearMarks(`before-${asyncId}`);
        performance.clearMarks(`after-${asyncId}`);
        performance.clearMarks(`end-${asyncId}`);
        performance.clearMeasures(`IO Operation ${asyncId}`);
        performance.clearMeasures(`IO Wait ${asyncId}`);
      }
    },
  });

  onModuleInit() {
    this.asyncHook.enable();
    this.logInterval = setInterval(() => this.logMetrics(), 10000);
  }

  onModuleDestroy() {
    this.asyncHook.disable();
    clearInterval(this.logInterval);
  }

  logMetrics() {
    const timestamp = new Date().toISOString();
    const averageIODuration =
      this.ioOperationCount > 0
        ? (this.ioOperationDuration / this.ioOperationCount).toFixed(2)
        : 0;
    const logMessage = `${timestamp},${this.ioOperationCount},${averageIODuration},${this.ioWaitTime.toFixed(2)}\n`;
    this.logRotatorService.appendToFile(
      'io-operations',
      logMessage,
      this.LOG_HEADER,
    );

    // Reset metrics after logging
    this.ioOperationCount = 0;
    this.ioOperationDuration = 0;
    this.ioWaitTime = 0;
  }
}
