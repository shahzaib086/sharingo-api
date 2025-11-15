import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetReportsDto {
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
    description: 'Number of reports per page',
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

  @ApiPropertyOptional({ 
    description: 'Filter by report status (0: Pending, 1: Completed)',
    example: 0,
    type: Number,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Status must be 0 (Pending) or 1 (Completed)' })
  @Max(1, { message: 'Status must be 0 (Pending) or 1 (Completed)' })
  status?: number;
}

