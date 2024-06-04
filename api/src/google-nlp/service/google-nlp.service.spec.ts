import { Test, TestingModule } from '@nestjs/testing';
import { GoogleNlpService } from './google-nlp.service';
import { ReviewService } from '../../mongodb/service/review.service';
import { BenchmarkService } from '../../monitoring/service/benchmark.service';
import { LanguageServiceClient, protos } from '@google-cloud/language';
import { GoogleNlpRequestDto } from '../dtos/request/google-nlp-request.dto';
import { Review } from '../..//mongodb/schema/review.schema';

jest.mock('@google-cloud/language');

describe('GoogleNlpService', () => {
  let googleNlpService: GoogleNlpService;
  let reviewService: ReviewService;
  let benchmarkService: BenchmarkService;
  let languageClientMock: jest.Mocked<LanguageServiceClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleNlpService,
        {
          provide: ReviewService,
          useValue: {
            create: jest.fn(),
            aggregateByReviewType: jest.fn(),
            aggregateByRating: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: BenchmarkService,
          useValue: {
            runBenchmark: jest.fn(),
          },
        },
        {
          provide: LanguageServiceClient,
          useClass: LanguageServiceClient,
        },
      ],
    }).compile();

    googleNlpService = module.get<GoogleNlpService>(GoogleNlpService);
    reviewService = module.get<ReviewService>(ReviewService);
    benchmarkService = module.get<BenchmarkService>(BenchmarkService);
    languageClientMock = module.get(
      LanguageServiceClient,
    ) as jest.Mocked<LanguageServiceClient>;

    (googleNlpService as any).isBenchmarkEnabled = false;
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment of a document', async () => {
      const document: protos.google.cloud.language.v1.IDocument = {
        content: 'This is a great product!',
        type: protos.google.cloud.language.v1.Document.Type.PLAIN_TEXT,
      };

      const sentimentResponse: protos.google.cloud.language.v1.IAnalyzeSentimentResponse =
        {
          documentSentiment: {
            score: 0.9,
            magnitude: 0.9,
          },
          language: 'en',
        };

      (languageClientMock.analyzeSentiment as jest.Mock).mockResolvedValueOnce([
        sentimentResponse,
      ]);

      const result = await googleNlpService.analyzeSentiment(document);

      expect(result).toEqual(sentimentResponse);
    });

    it('should throw an error if sentiment analysis fails', async () => {
      const document: protos.google.cloud.language.v1.IDocument = {
        content: 'This is a great product!',
        type: protos.google.cloud.language.v1.Document.Type.PLAIN_TEXT,
      };

      (languageClientMock.analyzeSentiment as jest.Mock).mockRejectedValue(
        new Error('Analysis failed'),
      );

      await expect(googleNlpService.analyzeSentiment(document)).rejects.toThrow(
        'Analysis failed',
      );
    });
  });

  describe('analyzeText', () => {
    it('should analyze the text and return the sentiment', async () => {
      const dto: GoogleNlpRequestDto = {
        reviewId: '1',
        productId: 1,
        username: 'testUser',
        timestamp: '2024-05-22T10:00:00Z',
        reviewText: 'This is a great product!',
        rating: 5,
      };

      const sentimentResponse: protos.google.cloud.language.v1.IAnalyzeSentimentResponse =
        {
          documentSentiment: {
            score: 0.9,
            magnitude: 0.9,
          },
          language: 'en',
        };

      jest
        .spyOn(googleNlpService, 'analyzeSentiment')
        .mockResolvedValueOnce(sentimentResponse);

      const result = await googleNlpService.analyzeText(dto);

      expect(result).toEqual({
        text: dto.reviewText,
        sentimentScore: sentimentResponse.documentSentiment.score,
      });
      expect(reviewService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewId: dto.reviewId,
          productId: dto.productId.toString(),
          username: dto.username,
          reviewText: dto.reviewText,
          rating: dto.rating,
          sentimentScore: sentimentResponse.documentSentiment.score,
        }),
      );
    });

    it('should throw an error if sentiment analysis fails', async () => {
      const dto: GoogleNlpRequestDto = {
        reviewId: '1',
        productId: 1,
        username: 'testUser',
        timestamp: '2024-05-22T10:00:00Z',
        reviewText: 'This is a great product!',
        rating: 5,
      };

      jest
        .spyOn(googleNlpService, 'analyzeSentiment')
        .mockRejectedValue(new Error('Analysis failed'));

      await expect(googleNlpService.analyzeText(dto)).rejects.toThrow(
        'Analysis failed',
      );
    });
  });

  describe('aggregateReviewsByType', () => {
    it('should return aggregated reviews by type', async () => {
      const aggregatedData = [{ type: 'good', count: 10 }];
      jest
        .spyOn(reviewService, 'aggregateByReviewType')
        .mockResolvedValue(aggregatedData);

      const result = await googleNlpService.aggregateReviewsByType();
      expect(result).toBe(aggregatedData);
    });
  });

  describe('aggregateReviewsByRating', () => {
    it('should return aggregated reviews by rating', async () => {
      const aggregatedData = [{ rating: 5, count: 10 }];
      jest
        .spyOn(reviewService, 'aggregateByRating')
        .mockResolvedValue(aggregatedData);

      const result = await googleNlpService.aggregateReviewsByRating();
      expect(result).toBe(aggregatedData);
    });
  });

  describe('exportDataToJson', () => {
    it('should return reviews in JSON format', async () => {
      const reviews = [
        { reviewText: 'This is a great product!' },
      ] as any as Review[];
      jest.spyOn(reviewService, 'findAll').mockResolvedValue(reviews);

      const result = await googleNlpService.exportDataToJson();
      expect(result).toBe(JSON.stringify(reviews, null, 2));
    });

    it('should throw an error if export fails', async () => {
      jest
        .spyOn(reviewService, 'findAll')
        .mockRejectedValue(new Error('Export failed'));

      await expect(googleNlpService.exportDataToJson()).rejects.toThrow(
        'Export failed',
      );
    });
  });
});
