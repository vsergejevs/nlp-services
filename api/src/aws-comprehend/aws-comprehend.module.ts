import { Module } from '@nestjs/common';
import { AwsComprehendService } from './aws-comprehend.service';
import { AwsComprehendController } from './aws-comprehend.controller';

@Module({
  providers: [AwsComprehendService],
  controllers: [AwsComprehendController]
})
export class AwsComprehendModule {}
