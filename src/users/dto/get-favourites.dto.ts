import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavouriteType } from '../../entities/favourite.entity';

export class GetFavouritesDto {
  @ApiProperty({ 
    description: 'Type of favourites to retrieve (video or product)', 
    enum: FavouriteType,
    example: FavouriteType.VIDEO 
  })
  @IsEnum(FavouriteType)
  type: FavouriteType;
} 