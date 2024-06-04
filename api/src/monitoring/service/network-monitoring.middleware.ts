import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogRotatorService } from './log-rotator.service';

@Injectable()
export class NetworkMonitoringMiddleware implements NestMiddleware {
  private readonly LOG_HEADER =
    'Timestamp,Method,URL,Status,Request Size,Response Size\n';

  constructor(private readonly logRotatorService: LogRotatorService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    const start = process.hrtime();

    let requestSize = parseInt(req.headers['content-length'] || '0', 10);
    if (isNaN(requestSize)) {
      requestSize = 0;
    }

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1e3 + nanoseconds * 1e-6;

      let responseSize = parseInt(
        (res.getHeader('content-length') as string) || '0',
        10,
      );
      if (isNaN(responseSize)) {
        responseSize = 0;
      }

      const logMessage = `${new Date().toISOString()},${method},${url},${res.statusCode},${requestSize},${responseSize}\n`;
      this.logRotatorService.appendToFile(
        'network-metrics',
        logMessage,
        this.LOG_HEADER,
      );
    });

    next();
  }
}
