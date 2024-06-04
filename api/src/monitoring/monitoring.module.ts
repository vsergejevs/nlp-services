import { Module } from '@nestjs/common';
import { MemoryMonitoringService } from './service/memory-monitoring.service';
import { LogRotatorService } from './service/log-rotator.service';
import { AsyncMonitoringService } from './service/async-monitoring.service';
import { CpuMonitoringService } from './service/cpu-monitoring.service';
import { IOOperationsMonitoringService } from './service/io-operations-monitoring.service';
import { HttpMonitoringMiddleware } from './service/http-monitoring.middleware';
import { BenchmarkService } from './service/benchmark.service';

@Module({
  providers: [
    MemoryMonitoringService,
    LogRotatorService,
    AsyncMonitoringService,
    CpuMonitoringService,
    IOOperationsMonitoringService,
    HttpMonitoringMiddleware,
    BenchmarkService,
  ],
  exports: [LogRotatorService, HttpMonitoringMiddleware, BenchmarkService],
})
export class MonitoringModule {}
