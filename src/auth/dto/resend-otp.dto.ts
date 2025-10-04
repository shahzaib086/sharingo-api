import { IsInt, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  userId: number;
}
