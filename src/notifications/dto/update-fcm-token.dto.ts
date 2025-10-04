import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging token for push notifications',
    example: 'fcm_token_example_here',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
} 