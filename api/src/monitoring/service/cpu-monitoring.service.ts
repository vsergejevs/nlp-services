import * as os from 'os';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { LogRotatorService } from './log-rotator.service';

@Injectable()
export class CpuMonitoringService implements OnModuleInit, OnModuleDestroy {
  private logInterval: NodeJS.Timeout;
  private readonly LOG_HEADER =
    'Timestamp,User CPU Time,System CPU Time,Idle CPU Time\n';

  constructor(private readonly logRotatorService: LogRotatorService) {}

  onModuleInit() {
    this.logInterval = setInterval(() => this.logMetrics(), 10000);
  }

  onModuleDestroy() {
    clearInterval(this.logInterval);
  }

  private getCpuUsage() {
    const cpus = os.cpus();
    let user = 0;
    let system = 0;
    let idle = 0;

    cpus.forEach((cpu) => {
      user += cpu.times.user;
      system += cpu.times.sys;
      idle += cpu.times.idle;
    });

    return {
      user: user / cpus.length,
      system: system / cpus.length,
      idle: idle / cpus.length,
    };
  }

  logMetrics() {
    const timestamp = new Date().toISOString();
    const cpuUsage = this.getCpuUsage();
    const logMessage = `${timestamp},${cpuUsage.user},${cpuUsage.system},${cpuUsage.idle}\n`;
    this.logRotatorService.appendToFile(
      'cpu-metrics',
      logMessage,
      this.LOG_HEADER,
    );
  }
}
