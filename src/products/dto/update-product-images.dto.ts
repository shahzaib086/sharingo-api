import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../../entities/product-media.entity';

export class UpdateProductImagesDto {
  @ApiProperty({ description: 'Media URL' })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ 
    description: 'Media type', 
    enum: MediaType,
    default: MediaType.IMAGE 
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ description: 'Sequence/order of the media' })
  @IsNotEmpty()
  sequence: number;
}
