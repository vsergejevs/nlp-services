import { Injectable, Logger } from '@nestjs/common';
import * as Benchmark from 'benchmark';

@Injectable()
export class BenchmarkService {
  private readonly logger = new Logger(BenchmarkService.name);

  async runBenchmark<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const suite = new Benchmark.Suite();
    let result: T;

    const wrappedFn = {
      async fn(deferred) {
        result = await fn();
        deferred.resolve();
      },
      defer: true,
    };

    suite
      .add(name, wrappedFn)
      .on('cycle', (event: Benchmark.Event) => {
        this.logger.log(String(event.target));
      })
      .on('complete', () => {
        this.logger.log(`Fastest is ${suite.filter('fastest').map('name')}`);
      });

    return new Promise<T>((resolve) => {
      suite.run({ async: true });
      suite.on('complete', () => resolve(result));
    });
  }
}
