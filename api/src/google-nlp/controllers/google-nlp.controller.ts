import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { GoogleNlpRequestDto } from '../dtos/request/google-nlp-request.dto';
import { GoogleNlpService } from '../service/google-nlp.service';
import { Response } from 'express';

@Controller('reviews')
export class GoogleNlpController {
  constructor(private googleNlpService: GoogleNlpService) {}

  @Post()
  async processMessage(
    @Body() googleNlpRequestDto: GoogleNlpRequestDto,
  ): Promise<string> {
    try {
      const result =
        await this.googleNlpService.analyzeText(googleNlpRequestDto);
      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to process message',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('aggregate/types')
  async getAggregatedByTypes() {
    try {
      return await this.googleNlpService.aggregateReviewsByType();
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to process message',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('aggregate/ratings')
  async getAggregatedByRatings() {
    try {
      return await this.googleNlpService.aggregateReviewsByRating();
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to process message',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('json')
  async exportReviewsToJson(@Res() response: Response): Promise<void> {
    try {
      const reviews = await this.googleNlpService.exportDataToJson();
      response.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="reviews.json"',
      });
      response.send(reviews);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to export reviews',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
