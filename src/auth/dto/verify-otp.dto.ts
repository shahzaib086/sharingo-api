import { IsInt, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: '1122' })
  @IsString()
  @Length(4)
  otp: string;
}
