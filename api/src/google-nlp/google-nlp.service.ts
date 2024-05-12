import { Injectable } from '@nestjs/common';
import { ReviewDto } from './interfaces/review.interface';
import { LanguageServiceClient, protos } from '@google-cloud/language';
import { ReviewService } from 'src/mongodb/service/review.service';
import { AdditionalMetrics, Review } from 'src/mongodb/schema/review.schema';

@Injectable()
export class GoogleNlpService {
  private readonly languageClient = new LanguageServiceClient();

  constructor(private readonly reviewService: ReviewService) {}

  async onModuleInit(): Promise<void> {
    await this.languageClient.initialize();
    console.log('Google NLP language client initialized');
  }

  async analyzeText(dto: ReviewDto): Promise<any> {
    console.log(dto);

    const document: protos.google.cloud.language.v1.IDocument = {
      content: dto.reviewText,
      type: protos.google.cloud.language.v1.Document.Type.PLAIN_TEXT,
    };

    try {
      const [result] = await this.languageClient.analyzeSentiment({
        document: document,
      });

      console.log('this is result:');
      console.log(result);

      const additionalMetrics: AdditionalMetrics = {
        confidence: result.documentSentiment.magnitude,
        language: result.language,
      };

      const reviewWithSentiment: Review = {
        reviewId: dto.reviewId,
        productId: dto.productId.toString(),
        username: dto.username,
        timestamp: new Date(dto.timestamp),
        reviewText: dto.reviewText,
        rating: dto.rating,
        reviewType: result.documentSentiment.score >= 0.5 ? 'good' : 'bad',
        sentimentScore: result.documentSentiment.score,
        additionalMetrics,
      };

      await this.reviewService.create(reviewWithSentiment);

      return {
        text: dto.reviewText,
        sentimentScore: result.documentSentiment.score,
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async aggregateReviewsByType(): Promise<any> {
    return this.reviewService.aggregateByReviewType();
  }

  async aggregateReviewsByRating(): Promise<any> {
    return this.reviewService.aggregateByRating();
  }

  async exportDataToJson(): Promise<string> {
    try {
      const reviews = await this.reviewService.findAll();
      return JSON.stringify(reviews, null, 2);
    } catch (error) {
      console.error('Error exporting reviews to JSON:', error);
      throw error;
    }
  }
}
