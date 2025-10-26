import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'First line of address' })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @ApiProperty({ description: 'Second line of address', required: false })
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiProperty({ description: 'Zip code or postal code' })
  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Set as default address', required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsNumber()
  @IsOptional()
  lng?: number;
}
