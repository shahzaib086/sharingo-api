import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ example: 1, description: 'Chat ID to mark messages as read' })
  @IsNotEmpty()
  @IsNumber()
  chatId: number;
}

