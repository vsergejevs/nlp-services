import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { monitorEventLoopDelay } from 'perf_hooks';

// interface EventLoopUtilizationEntry extends PerformanceEntry {
//   utilization: number;
// }

// type CustomEntryType = 'eventLoopUtilization';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Set up and log performance metrics
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
