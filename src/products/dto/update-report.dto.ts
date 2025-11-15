import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateReportDto {
  @ApiPropertyOptional({ 
    description: 'Report status (0: Pending, 1: Completed)',
    example: 1,
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

  @ApiPropertyOptional({ 
    description: 'Admin notes for the report',
    example: 'Report reviewed and action taken',
    type: String
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

