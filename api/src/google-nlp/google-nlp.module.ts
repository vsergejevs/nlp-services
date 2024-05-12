import { Module } from '@nestjs/common';
import { GoogleNlpService } from './google-nlp.service';
import { GoogleNlpController } from './google-nlp.controller';
import { MongodbModule } from 'src/mongodb/mongodb.module';

@Module({
  imports: [MongodbModule],
  providers: [GoogleNlpService],
  controllers: [GoogleNlpController],
})
export class GoogleNlpModule {}
