import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 1, description: 'Chat ID' })
  @IsNotEmpty()
  @IsNumber()
  chatId: number;

  @ApiProperty({ example: 'Hello! Is this item still available?', description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;
}

