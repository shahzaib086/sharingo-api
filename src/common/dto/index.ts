import { ApiProperty } from '@nestjs/swagger';

export * from './pagination.dto';

export class DefaultResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  data: unknown;
  constructor(message: string, status: boolean, data: unknown) {
    this.message = message;
    this.status = status;
    this.data = data;
  }
}
