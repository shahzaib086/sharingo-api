import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    description: 'Firebase Cloud Messaging token for push notifications',
    example: 'fcm_token_example_here',
    type: String 
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
