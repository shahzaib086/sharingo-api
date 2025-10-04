import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { NewSelfStory, OnboardingStep, OldSelfStory } from '../common/enums/user.enum';
import { SelectQuestionsDto } from './dto/select-questions.dto';
import { Question } from '../entities/question.entity';
import { NEW_SELF_STORY_CONFIG, NewSelfStoryType } from '../config/new-self-story.config';
import { Favourite, FavouriteType } from '../entities/favourite.entity';
import { Video } from '../entities/video.entity';
import { Product } from '../entities/product.entity';
import { SaveFavouriteDto, FavouriteAction } from './dto/save-favourite.dto';
import { GetFavouritesDto } from './dto/get-favourites.dto';

// define mapping of old self story to new self story
const OldToNewStoryMap = {
  [OldSelfStory.WORTHLESSNESS]: NewSelfStory.GREATNESS,
  [OldSelfStory.REJECTION]: NewSelfStory.CHOSENNESS,
  [OldSelfStory.ABANDONMENT]: NewSelfStory.ATONEMENT,
  [OldSelfStory.ABUSE]: NewSelfStory.PURPOSE,
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(Favourite)
    private readonly favouritesRepository: Repository<Favourite>,
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async updateUser(id: number, userData: Partial<User>, imageFile?: Express.Multer.File): Promise<User | null> {
    const updateData = { ...userData };

    updateData.onboardingStep = OnboardingStep.PROFILE_COMPLETION;
    
    // Handle image upload
    if (imageFile) {
      // Use the filename that was actually saved by FileInterceptor
      const uploadPath = `uploads/users/${imageFile.filename}`;
      updateData.image = uploadPath;
    }
    
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateFcmToken(userId: number, fcmToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.fcmToken = fcmToken;
    return await this.usersRepository.save(user);
  }

  async updateQuestionsSelection(id: number, selectQuestionsDto: SelectQuestionsDto): Promise<{ user: User | null, newSelfStory: any }> {
    const evaluation = await this.evaluateNewSelfStory(id, selectQuestionsDto.selectedGroups);
    const updateData = {
      questionsSelection: selectQuestionsDto.selectedGroups,
      onboardingStep: OnboardingStep.SELF_STORY_CREATION,
      worthlessness: evaluation.categoryCount[OldSelfStory.WORTHLESSNESS],
      abandonment: evaluation.categoryCount[OldSelfStory.ABANDONMENT],
      rejection: evaluation.categoryCount[OldSelfStory.REJECTION],
      abuse: evaluation.categoryCount[OldSelfStory.ABUSE],
      newSelfStory: evaluation.NewSelfStory,
    };
    await this.usersRepository.update(id, updateData);

    const user = await this.findOne(id);
    return {
      user: user,
      newSelfStory: evaluation.NewSelfStory ? NEW_SELF_STORY_CONFIG[evaluation.NewSelfStory as NewSelfStoryType] : null,
    };
  }
  
  private async evaluateNewSelfStory(id: number, selectedGroups: Record<string, number>) {
    // get questions from the selected ids in groups
    const questions = await this.questionsRepository.find({
      where: {
        id: In(Object.values(selectedGroups)),
      },
    });

    const categoryCount = questions.reduce((acc, question) => {
      acc[question.category] = (acc[question.category] || 0) + 1;
      return acc;
    }, {
      [OldSelfStory.WORTHLESSNESS]: 0,
      [OldSelfStory.REJECTION]: 0,
      [OldSelfStory.ABANDONMENT]: 0,
      [OldSelfStory.ABUSE]: 0,
    } as Record<string, number>);

    // Get the category with highest count
    const highestCount = Math.max(...Object.values(categoryCount));
    const highestCountCategory = Object.keys(categoryCount).find(key => categoryCount[key] === highestCount);

    return {
      categoryCount,
      highestCountCategory,
      NewSelfStory: highestCountCategory ? OldToNewStoryMap[highestCountCategory] : null
    };
    
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async saveFavourite(userId: number, saveFavouriteDto: SaveFavouriteDto): Promise<any> {
    const { action, type, videoId, productId } = saveFavouriteDto;

    this.validateFavouriteRequest(type, videoId, productId);
    await this.validateFavouriteItem(type, videoId, productId);
    
    if (action === FavouriteAction.FAVOURITE) {
      await this.saveOrUpdateFavourite(userId, type, videoId, productId);
    } else {
      await this.removeFavourite(userId, type, videoId, productId);
    }

    // Return the video or product object with favourite status
    if (type === FavouriteType.VIDEO) {
      const video = await this.videosRepository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.category', 'category')
        .select([
          'video.id',
          'video.videoUrl',
          'video.thumbnailUrl',
          'video.title',
          'video.shortDescription',
          'video.description',
          'video.categoryId',
          'video.tags',
          'video.status',
          'video.createdAt',
          'video.updatedAt',
          'category.id',
          'category.name'
        ])
        .where('video.id = :id', { id: videoId })
        .andWhere('video.status = :status', { status: 1 })
        .getOne();

      return {
        ...video,
        is_fav: action === FavouriteAction.FAVOURITE
      };
    } else {
      const product = await this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .select([
          'product.id',
          'product.name',
          'product.author',
          'product.publishedDate',
          'product.categoryId',
          'product.price',
          'product.image',
          'product.inventory',
          'product.description',
          'product.status',
          'product.averageRating',
          'product.createdAt',
          'product.updatedAt',
          'category.id',
          'category.name'
        ])
        .where('product.id = :id', { id: productId })
        .andWhere('product.status = :status', { status: 1 })
        .getOne();

      return {
        ...product,
        is_fav: action === FavouriteAction.FAVOURITE
      };
    }
  }

  private validateFavouriteRequest(type: FavouriteType, videoId?: number, productId?: number): void {
    if (type === FavouriteType.VIDEO && !videoId) {
      throw new BadRequestException('videoId is required when type is video');
    }
    if (type === FavouriteType.PRODUCT && !productId) {
      throw new BadRequestException('productId is required when type is product');
    }
  }

  private async validateFavouriteItem(type: FavouriteType, videoId?: number, productId?: number): Promise<void> {
    if (type === FavouriteType.VIDEO) {
      const video = await this.videosRepository.findOne({
        where: { id: videoId, status: 1 },
      });
      if (!video) {
        throw new NotFoundException('Video not found or inactive');
      }
    } else if (type === FavouriteType.PRODUCT) {
      const product = await this.productsRepository.findOne({
        where: { id: productId, status: 1 },
      });
      if (!product) {
        throw new NotFoundException('Product not found or inactive');
      }
    }
  }

  private async saveOrUpdateFavourite(userId: number, type: FavouriteType, videoId?: number, productId?: number): Promise<void> {
    const existingFavourite = await this.favouritesRepository.findOne({
      where: {
        userId,
        type,
        ...(type === FavouriteType.VIDEO ? { videoId } : { productId }),
      },
    });

    if (existingFavourite) {
      existingFavourite.updatedAt = new Date();
      await this.favouritesRepository.save(existingFavourite);
    } else {
      const insertData: any = {
        userId,
        type,
        videoId: type === FavouriteType.VIDEO ? videoId : null,
        productId: type === FavouriteType.PRODUCT ? productId : null,
      };
      await this.favouritesRepository.insert(insertData);
    }
  }

  private async removeFavourite(userId: number, type: FavouriteType, videoId?: number, productId?: number): Promise<void> {
    const existingFavourite = await this.favouritesRepository.findOne({
      where: {
        userId,
        type,
        ...(type === FavouriteType.VIDEO ? { videoId } : { productId }),
      },
    });

    if (existingFavourite) {
      await this.favouritesRepository.remove(existingFavourite);
    }
  }

  async getFavourites(userId: number, getFavouritesDto: GetFavouritesDto): Promise<any[]> {
    const { type } = getFavouritesDto;

    const queryBuilder = this.favouritesRepository
      .createQueryBuilder('favourite')
      .where('favourite.userId = :userId', { userId })
      .andWhere('favourite.type = :type', { type })
      .orderBy('favourite.updatedAt', 'DESC');

    if (type === FavouriteType.VIDEO) {
      queryBuilder
        .leftJoinAndSelect('favourite.video', 'video')
        .leftJoinAndSelect('video.category', 'category')
        .select([
          'favourite.id',
          'favourite.userId',
          'favourite.type',
          'favourite.videoId',
          'favourite.createdAt',
          'favourite.updatedAt',
          'video.id',
          'video.videoUrl',
          'video.thumbnailUrl',
          'video.title',
          'video.shortDescription',
          'video.description',
          'video.categoryId',
          'video.tags',
          'video.status',
          'video.createdAt',
          'video.updatedAt',
          'category.id',
          'category.name'
        ]);
    } else if (type === FavouriteType.PRODUCT) {
      queryBuilder
        .leftJoinAndSelect('favourite.product', 'product')
        .leftJoinAndSelect('product.category', 'category')
        .select([
          'favourite.id',
          'favourite.userId',
          'favourite.type',
          'favourite.productId',
          'favourite.createdAt',
          'favourite.updatedAt',
          'product.id',
          'product.name',
          'product.author',
          'product.publishedDate',
          'product.categoryId',
          'product.price',
          'product.image',
          'product.inventory',
          'product.description',
          'product.status',
          'product.averageRating',
          'product.createdAt',
          'product.updatedAt',
          'category.id',
          'category.name'
        ]);
    }

    const favourites = await queryBuilder.getMany();
    
    // Add is_fav key to each favourite item
    return favourites.map(favourite => ({
      ...favourite,
      is_fav: true
    }));
  }
}
