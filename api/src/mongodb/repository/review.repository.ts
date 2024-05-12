import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from '../schema/review.schema';

@Injectable()
export class ReviewRepository {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(review: Review): Promise<Review> {
    const createdReview = new this.reviewModel(review);
    return createdReview.save();
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.find().exec();
  }

  async findOne(id: string): Promise<Review> {
    return this.reviewModel.findById(id).exec();
  }

  async update(id: string, review: Review): Promise<Review> {
    return this.reviewModel.findByIdAndUpdate(id, review, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.reviewModel.findByIdAndDelete(id).exec();
  }

  async aggregate(pipeline: any[]): Promise<any> {
    return this.reviewModel.aggregate(pipeline).exec();
  }
}
