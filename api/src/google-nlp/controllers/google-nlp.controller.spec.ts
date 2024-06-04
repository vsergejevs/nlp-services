import { Test, TestingModule } from '@nestjs/testing';
import { GoogleNlpController } from './google-nlp.controller';
import { GoogleNlpService } from '../service/google-nlp.service';
import { GoogleNlpRequestDto } from '../dtos/request/google-nlp-request.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GoogleNlpController', () => {
  let googleNlpController: GoogleNlpController;
  let googleNlpService: GoogleNlpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleNlpController],
      providers: [
        {
          provide: GoogleNlpService,
          useValue: {
            analyzeText: jest.fn(),
            aggregateReviewsByType: jest.fn(),
            aggregateReviewsByRating: jest.fn(),
            exportDataToJson: jest.fn(),
          },
        },
      ],
    }).compile();

    googleNlpController = module.get<GoogleNlpController>(GoogleNlpController);
    googleNlpService = module.get<GoogleNlpService>(GoogleNlpService);
  });

  describe('processMessage', () => {
    it('should return the result of analyzeText', async () => {
      const dto: GoogleNlpRequestDto = {
        reviewId: '1',
        productId: 1,
        username: 'testUser',
        timestamp: '2024-05-22T10:00:00Z',
        reviewText: 'This is a great product!',
        rating: 5,
      };
      const result = 'positive sentiment';
      jest.spyOn(googleNlpService, 'analyzeText').mockResolvedValue(result);

      expect(await googleNlpController.processMessage(dto)).toBe(result);
    });

    it('should throw an HttpException when an error occurs', async () => {
      const dto: GoogleNlpRequestDto = {
        reviewId: '1',
        productId: 1,
        username: 'testUser',
        timestamp: '2024-05-22T10:00:00Z',
        reviewText: 'This is a great product!',
        rating: 5,
      };
      jest
        .spyOn(googleNlpService, 'analyzeText')
        .mockRejectedValue(new Error());

      await expect(googleNlpController.processMessage(dto)).rejects.toThrow(
        new HttpException('Failed to process message', HttpStatus.BAD_GATEWAY),
      );
    });
  });

  describe('getAggregatedByTypes', () => {
    it('should return the result of aggregateReviewsByType', async () => {
      const result = [{ type: 'good', count: 10 }];
      jest
        .spyOn(googleNlpService, 'aggregateReviewsByType')
        .mockResolvedValue(result);

      expect(await googleNlpController.getAggregatedByTypes()).toBe(result);
    });

    it('should throw an HttpException when an error occurs', async () => {
      jest
        .spyOn(googleNlpService, 'aggregateReviewsByType')
        .mockRejectedValue(new Error());

      await expect(googleNlpController.getAggregatedByTypes()).rejects.toThrow(
        new HttpException('Failed to process message', HttpStatus.BAD_GATEWAY),
      );
    });
  });

  describe('getAggregatedByRatings', () => {
    it('should return the result of aggregateReviewsByRating', async () => {
      const result = [{ rating: 5, count: 10 }];
      jest
        .spyOn(googleNlpService, 'aggregateReviewsByRating')
        .mockResolvedValue(result);

      expect(await googleNlpController.getAggregatedByRatings()).toBe(result);
    });

    it('should throw an HttpException when an error occurs', async () => {
      jest
        .spyOn(googleNlpService, 'aggregateReviewsByRating')
        .mockRejectedValue(new Error());

      await expect(
        googleNlpController.getAggregatedByRatings(),
      ).rejects.toThrow(
        new HttpException('Failed to process message', HttpStatus.BAD_GATEWAY),
      );
    });
  });

  describe('exportReviewsToJson', () => {
    it('should return JSON content with reviews', async () => {
      const response = {
        set: jest.fn(),
        send: jest.fn(),
      } as any;
      const reviews = '[{"reviewText":"This is a great product!"}]';
      jest
        .spyOn(googleNlpService, 'exportDataToJson')
        .mockResolvedValue(reviews);

      await googleNlpController.exportReviewsToJson(response);

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="reviews.json"',
      });
      expect(response.send).toHaveBeenCalledWith(reviews);
    });

    it('should throw an HttpException when an error occurs', async () => {
      const response = {
        set: jest.fn(),
        send: jest.fn(),
      } as any;
      jest
        .spyOn(googleNlpService, 'exportDataToJson')
        .mockRejectedValue(new Error());

      await expect(
        googleNlpController.exportReviewsToJson(response),
      ).rejects.toThrow(
        new HttpException(
          'Failed to export reviews',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
