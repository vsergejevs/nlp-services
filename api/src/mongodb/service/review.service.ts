import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository';
import { Review } from '../schema/review.schema';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async create(review: Review): Promise<Review> {
    return this.reviewRepository.create(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.findAll();
  }

  async findOne(id: string): Promise<Review> {
    return this.reviewRepository.findOne(id);
  }

  async update(id: string, review: Review): Promise<Review> {
    return this.reviewRepository.update(id, review);
  }

  async delete(id: string): Promise<void> {
    return this.reviewRepository.delete(id);
  }

  // Aggregation function for reviewType
  async aggregateByReviewType(): Promise<any> {
    return this.reviewRepository.aggregate([
      {
        $group: {
          _id: '$reviewType',
          count: { $sum: 1 },
          averageSentimentScore: { $avg: '$sentimentScore' },
        },
      },
    ]);
  }

  // Aggregation function for rating
  async aggregateByRating(): Promise<any> {
    return this.reviewRepository.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
          averageSentimentScore: { $avg: '$sentimentScore' },
        },
      },
    ]);
  }
}
