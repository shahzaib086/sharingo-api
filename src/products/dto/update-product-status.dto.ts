import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@common/enums';

export class UpdateProductStatusDto {
  @ApiProperty({ 
    description: 'Product status (0: Inactive, 1: Active, 2: Completed)', 
    example: 2,
    minimum: 0,
    maximum: 2
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Status is required' })
  @Min(0, { message: 'Status must be 0 (Inactive), 1 (Active), or 2 (Completed)' })
  @Max(2, { message: 'Status must be 0 (Inactive), 1 (Active), or 2 (Completed)' })
  status: number;

  @ApiProperty({ 
    description: 'User ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;
}

