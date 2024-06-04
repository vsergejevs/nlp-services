import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogRotatorService } from './log-rotator.service';

@Injectable()
export class HttpMonitoringMiddleware implements NestMiddleware {
  private concurrentRequests = 0;
  private readonly LOG_HEADER =
    'Timestamp,Method,URL,Status,Duration,ConcurrentRequests\n';

  constructor(private readonly logRotatorService: LogRotatorService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    this.concurrentRequests++;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logMessage = `${new Date().toISOString()},${req.method},${req.originalUrl},${res.statusCode},${duration}ms,${this.concurrentRequests}\n`;
      this.logRotatorService.appendToFile(
        'http-requests',
        logMessage,
        this.LOG_HEADER,
      );
      this.concurrentRequests--;
    });

    next();
  }
}
