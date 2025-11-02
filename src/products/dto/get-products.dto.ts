import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetProductsDto {
  @ApiPropertyOptional({ 
    description: 'Category ID filter',
    // example: 1,
    type: Number 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ 
    description: 'Search keywords for name, description, tags',
    // example: '',
    type: String 
  })
  @IsOptional()
  @IsString()
  searchKeywords?: string;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    example: 1,
    type: Number,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of products per page',
    example: 10,
    type: Number,
    default: 10,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
} 