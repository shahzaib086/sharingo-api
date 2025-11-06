import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetPublicProductsDto {
  @ApiPropertyOptional({ 
    description: 'Category ID filter',
    example: 1,
    type: Number 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ 
    description: 'Search keywords for name, description, tags',
    example: 'laptop',
    type: String 
  })
  @IsOptional()
  @IsString()
  searchKeywords?: string;

  @ApiPropertyOptional({ 
    description: 'Minimum price filter',
    example: 100,
    type: Number 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum price filter',
    example: 1000,
    type: Number 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

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
    example: 20,
    type: Number,
    default: 20,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

