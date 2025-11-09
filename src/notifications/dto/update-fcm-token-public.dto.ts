import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenPublicDto {
  @ApiProperty({
    description: 'Unique device identifier',
    example: 'device-uuid-12345',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Firebase Cloud Messaging token for push notifications',
    example: 'fcm_token_example_here',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @ApiProperty({
    description: 'Optional user ID to associate with this device token',
    example: 123,
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  userId?: number;
}

