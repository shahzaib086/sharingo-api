import { IsOptional, IsNumber, IsString, Min, IsEnum, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAuthenticatedProductsDto {
  @ApiPropertyOptional({ 
    description: 'Category ID filter',
    type: Number 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ 
    description: 'Sort by field',
    enum: ['createdAt', 'name', 'price'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'name', 'price'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ 
    description: 'Search keywords for product name',
    type: String 
  })
  @IsOptional()
  @IsString()
  keyword?: string;

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

