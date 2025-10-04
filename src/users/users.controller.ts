import { Controller, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Post, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '@common/dto';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SelectQuestionsDto } from './dto/select-questions.dto';
import { SaveFavouriteDto } from './dto/save-favourite.dto';
import { GetFavouritesDto } from './dto/get-favourites.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: Partial<User>) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @Patch('update')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, cb) => {
          const userId = (req as any).user?.id;
          const timestamp = Date.now();
          const extension = extname(file.originalname);
          const filename = `user_${userId}_${timestamp}${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        country: { type: 'string', example: 'Pakistan' },
        city: { type: 'string', example: 'Karachi' },
        postalCode: { type: 'string', example: '12345' },
        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
        relationshipStatus: { type: 'string', enum: ['single', 'married', 'divorced', 'widowed', 'prefer_not_to_say'], example: 'single' },
        books: { type: 'string', example: 'book1,book2,book3' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [],
    },
  })
  async updateUser(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateUser(userId, updateUserDto, imageFile);
    
    return new DefaultResponseDto(
      'User updated successfully',
      true,
      updatedUser,
    );
  }

  @Patch('update-questions-selection')
  async updateQuestionsSelection(@Request() req: any, @Body() selectQuestionsDto: SelectQuestionsDto) { 
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateQuestionsSelection(userId, selectQuestionsDto);
    return new DefaultResponseDto('Questions selection updated successfully', true, updatedUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('favourites')
  @ApiOperation({ summary: 'Favourite or unfavourite a video/product' })
  async saveFavourite(
    @Request() req: any,
    @Body() saveFavouriteDto: SaveFavouriteDto,
  ) {
    const userId = req.user.id;
    const result = await this.usersService.saveFavourite(userId, saveFavouriteDto);
    
    const action = saveFavouriteDto.action === 'favourite' ? 'favourited' : 'unfavourited';
    return new DefaultResponseDto(
      `Item ${action} successfully`,
      true,
      result,
    );
  }

  @Get('favourites')
  @ApiOperation({ summary: 'Get user favourites by type' })
  @ApiQuery({ name: 'type', required: true, enum: ['video', 'product'], description: 'Type of favourites to retrieve' })
  async getFavourites(
    @Request() req: any,
    @Query() getFavouritesDto: GetFavouritesDto,
  ) {
    const userId = req.user.id;
    const favourites = await this.usersService.getFavourites(userId, getFavouritesDto);
    
    return new DefaultResponseDto(
      'Favourites retrieved successfully',
      true,
      favourites,
    );
  }
}
