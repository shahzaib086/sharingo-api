import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID token from the client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiYjM...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
} 