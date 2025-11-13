import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReportProductDto {
  @ApiProperty({ 
    description: 'Product ID to report',
    example: 1,
    type: Number 
  })
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({ 
    description: 'Optional message describing the reason for report',
    example: 'This product contains inappropriate content',
    type: String 
  })
  @IsOptional()
  @IsString()
  message?: string;
}

