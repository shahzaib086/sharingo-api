import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectQuestionsDto {
  @ApiProperty({ 
    example: { "group_1": 2, "group_2": 3, "group_3": 4, "group_4": 5, "group_5": 6, "group_6": 7, "group_7": 8 }, 
    required: true,
    description: 'Object with group names as keys and question IDs as values'
  })
  @IsObject()
  selectedGroups: Record<string, number>;
}
