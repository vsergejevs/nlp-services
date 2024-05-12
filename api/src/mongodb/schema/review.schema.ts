import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema()
export class AdditionalMetrics {
  @Prop()
  confidence: number;

  @Prop()
  language: string;
}

export const AdditionalMetricsSchema =
  SchemaFactory.createForClass(AdditionalMetrics);

@Schema()
export class Review {
  @Prop({ required: true, unique: true })
  reviewId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  reviewText: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  reviewType: 'good' | 'bad';

  @Prop({ required: true })
  sentimentScore: number;

  @Prop({ required: true, type: AdditionalMetricsSchema })
  additionalMetrics: AdditionalMetrics;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
