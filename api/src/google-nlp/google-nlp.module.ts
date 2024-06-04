import { Module } from '@nestjs/common';
import { GoogleNlpService } from './service/google-nlp.service';
import { GoogleNlpController } from './controllers/google-nlp.controller';
import { MongodbModule } from 'src/mongodb/mongodb.module';
import { MonitoringModule } from 'src/monitoring/monitoring.module';

@Module({
  imports: [MongodbModule, MonitoringModule],
  providers: [GoogleNlpService],
  controllers: [GoogleNlpController],
})
export class GoogleNlpModule {}
