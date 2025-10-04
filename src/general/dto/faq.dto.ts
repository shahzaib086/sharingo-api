import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ example: 'How do I reset my password?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'You can reset your password by clicking on the forgot password link and following the instructions.' })
  @IsString()
  answer: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sequence?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFaqDto {
  @ApiProperty({ example: 'How do I reset my password?', required: false })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({ example: 'You can reset your password by clicking on the forgot password link and following the instructions.', required: false })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sequence?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 