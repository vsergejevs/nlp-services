import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  monitorEventLoopDelay,
  PerformanceObserver,
  PerformanceEntry,
} from 'perf_hooks';
import { LogRotatorService } from './monitoring/service/log-rotator.service';

interface GcPerformanceEntry extends PerformanceEntry {
  detail: {
    kind: number;
    flags: number;
  };
}

// interface EventLoopUtilizationEntry extends PerformanceEntry {
//   utilization: number;
// }

// type CustomEntryType = 'eventLoopUtilization';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const logRotatorService = app.get(LogRotatorService);
    const GC_HEADER = 'Timestamp,GC Type,Duration\n';

    // Set up and log performance metrics for Event Loop Delay
    const eld = monitorEventLoopDelay();
    eld.enable();
    setInterval(() => {
      console.log(
        `Current Event Loop Delay: ${(eld.mean / 1e6).toFixed(2)} ms`,
      );
      console.log(
        `Max Event Loop Delay observed: ${(eld.max / 1e6).toFixed(2)} ms`,
      );
      eld.reset();
    }, 10000);

    // Set up garbage collection monitoring
    const gcObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const gcEntry = entry as GcPerformanceEntry;
        if (entry.entryType === 'gc' && gcEntry.detail) {
          const timestamp = new Date().toISOString();
          const kind = gcEntry.detail.kind;
          const duration = entry.duration.toFixed(2);
          const logMessage = `${timestamp},${kind},${duration}\n`;
          logRotatorService.appendToFile('gc-metrics', logMessage, GC_HEADER);
        }
      });
    });

    gcObserver.observe({ entryTypes: ['gc'] });

    // console.log('Setting up Event Loop Utilization monitoring');

    // const eventLoopUtilizationObserver = new PerformanceObserver((items) => {
    //   console.log('Received entries:', items.getEntries().length);
    //   items.getEntries().forEach((entry) => {
    //     console.log(`Entry type: ${entry.entryType}, Details:`, entry);
    //   });
    // });
    // eventLoopUtilizationObserver.observe({
    //   entryTypes: ['eventLoopUtilization'] as unknown as EntryType[],
    // });

    // console.log('ELU monitoring has been set up');

    // console.log('Supported performance features:', performance.featureNames());

    app.useGlobalPipes(new ValidationPipe());
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error(error);
    console.error('Failed to start the application');
  }
}

bootstrap();
