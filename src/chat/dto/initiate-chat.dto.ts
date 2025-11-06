import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateChatDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'User B ID (the other user in the chat, not the product owner)' })
  @IsNotEmpty()
  @IsNumber()
  userBId: number;
}

