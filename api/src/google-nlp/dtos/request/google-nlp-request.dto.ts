import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GoogleNlpRequestDto {
  @IsString()
  @IsNotEmpty()
  reviewId: string;

  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  reviewText: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;
}
