import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Product category ID' })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ description: 'Product address ID' })
  @IsNumber()
  @IsNotEmpty()
  addressId: number;

  @ApiProperty({ description: 'Product price', default: 0 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Product tags (comma separated)', required: false })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({ description: 'Product status (1 for Active, 0 for Inactive)', default: 1 })
  @IsNumber()
  @IsOptional()
  status?: number;
}
