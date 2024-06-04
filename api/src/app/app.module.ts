import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GoogleNlpModule } from '../google-nlp/google-nlp.module';
import { AwsComprehendModule } from '../aws-comprehend/aws-comprehend.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from 'src/mongodb/mongodb.module';
import { MonitoringModule } from 'src/monitoring/monitoring.module';
import { HttpMonitoringMiddleware } from 'src/monitoring/service/http-monitoring.middleware';
import { NetworkMonitoringMiddleware } from 'src/monitoring/service/network-monitoring.middleware';

@Module({
  imports: [
    GoogleNlpModule,
    AwsComprehendModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongodbModule,
    MonitoringModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpMonitoringMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(NetworkMonitoringMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
