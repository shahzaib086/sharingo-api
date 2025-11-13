import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ 
    example: 'John', 
    description: 'User first name',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ 
    example: 'Doe', 
    description: 'User last name',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ 
    example: '+1', 
    description: 'Country code',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  countryCode?: string;

  @ApiPropertyOptional({ 
    example: '1234567890', 
    description: 'Phone number',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;
}

