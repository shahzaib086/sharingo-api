import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavouriteType } from '../../entities/favourite.entity';

export enum FavouriteAction {
  FAVOURITE = 'favourite',
  UNFAVOURITE = 'unfavourite',
}

export class SaveFavouriteDto {
  @ApiProperty({ 
    description: 'Action to perform (favourite or unfavourite)', 
    enum: FavouriteAction,
    example: FavouriteAction.FAVOURITE 
  })
  @IsEnum(FavouriteAction, { message: 'Action must be either "favourite" or "unfavourite"' })
  action: FavouriteAction;

  @ApiProperty({ 
    description: 'Type of favourite (video or product)', 
    enum: FavouriteType,
    example: FavouriteType.VIDEO 
  })
  @IsEnum(FavouriteType, { message: 'Type must be either "video" or "product"' })
  type: FavouriteType;

  @ApiProperty({ 
    description: 'ID of the video (required if type is video)', 
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'videoId must be a valid number' })
  videoId?: number;

  @ApiProperty({ 
    description: 'ID of the product (required if type is product)', 
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'productId must be a valid number' })
  productId?: number;
} 