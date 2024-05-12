import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schema/review.schema';
import { ReviewService } from '../mongodb/service/review.service';
import { ReviewRepository } from './repository/review.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class MongodbModule {}
