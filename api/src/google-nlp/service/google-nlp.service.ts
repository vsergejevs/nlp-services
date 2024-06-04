import { Injectable } from '@nestjs/common';
import { ReviewDto } from '../interfaces/review.interface';
import { LanguageServiceClient, protos } from '@google-cloud/language';
import { ReviewService } from '../../mongodb/service/review.service';
import { AdditionalMetrics, Review } from '../../mongodb/schema/review.schema';
import { BenchmarkService } from '../../monitoring/service/benchmark.service';

@Injectable()
export class GoogleNlpService {
  private readonly languageClient = new LanguageServiceClient();
  private readonly isBenchmarkEnabled = false;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly benchmarkService: BenchmarkService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.languageClient.initialize();
    console.log('Google NLP language client initialized');
  }

  async analyzeSentiment(
    document: protos.google.cloud.language.v1.IDocument,
  ): Promise<protos.google.cloud.language.v1.IAnalyzeSentimentResponse> {
    const [response] = await this.languageClient.analyzeSentiment({ document });
    return response;
  }

  async analyzeText(dto: ReviewDto): Promise<any> {
    console.log(dto);

    const document: protos.google.cloud.language.v1.IDocument = {
      content: dto.reviewText,
      type: protos.google.cloud.language.v1.Document.Type.PLAIN_TEXT,
    };

    try {
      let result: protos.google.cloud.language.v1.IAnalyzeSentimentResponse;

      if (this.isBenchmarkEnabled) {
        result = await this.benchmarkService.runBenchmark(
          'Analyze Sentiment',
          async () => this.analyzeSentiment(document),
        );
      } else {
        result = await this.analyzeSentiment(document);
      }

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
