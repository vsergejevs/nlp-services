import { Module } from '@nestjs/common';
import { GoogleNlpModule } from '../google-nlp/google-nlp.module';
import { AwsComprehendModule } from '../aws-comprehend/aws-comprehend.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from 'src/mongodb/mongodb.module';

@Module({
  imports: [
    GoogleNlpModule,
    AwsComprehendModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),

    MongodbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
