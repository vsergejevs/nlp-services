import * as fs from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogRotatorService {
  private logDirectory: string;

  constructor() {
    this.logDirectory = join(process.cwd(), 'logs');
  }

  getLogFilePath(fileNamePrefix: string): string {
    const currentDate = new Date().toISOString().slice(0, 10);
    return join(this.logDirectory, `${fileNamePrefix}-${currentDate}.log`);
  }

  appendToFile(fileNamePrefix: string, data: string, header?: string) {
    const filePath = this.getLogFilePath(fileNamePrefix);
    if (!fs.existsSync(filePath) && header) {
      fs.writeFileSync(filePath, header);
    }
    fs.appendFileSync(filePath, data);
  }
}
