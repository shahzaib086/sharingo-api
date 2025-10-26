import { ApiProperty } from '@nestjs/swagger';

export class UploadProductImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
