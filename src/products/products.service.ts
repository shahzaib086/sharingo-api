import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductRating } from '../entities/product-rating.entity';
import { Favourite, FavouriteType } from '../entities/favourite.entity';
import { GetProductsDto } from './dto/get-products.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(ProductRating)
    private readonly productRatingsRepository: Repository<ProductRating>,
    @InjectRepository(Favourite)
    private readonly favouritesRepository: Repository<Favourite>,
  ) {}

  async getProducts(getProductsDto: GetProductsDto, userId?: number): Promise<{ products: any[], total: number, page: number, limit: number, totalPages: number }> {
    const { categoryId, searchKeywords, page = 1, limit = 10 } = getProductsDto;
    
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.author',
        'product.publishedDate',
        'product.publisher',
        'product.pages',
        'product.language',
        'product.format',
        'product.isbn',
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
      .where('product.status = :status', { status: 1 });

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (searchKeywords) {
      queryBuilder.andWhere(
        '(product.name ILIKE :searchKeywords OR product.author ILIKE :searchKeywords OR product.description ILIKE :searchKeywords OR product.publisher ILIKE :searchKeywords OR product.isbn ILIKE :searchKeywords)',
        { searchKeywords: `%${searchKeywords}%` }
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();
    
    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    const products = await queryBuilder.getMany();
    
    // Add is_fav field if userId is provided
    let productsWithFav = products;
    if (userId) {
      const userFavourites = await this.favouritesRepository.find({
        where: { userId, type: FavouriteType.PRODUCT },
        select: ['productId']
      });
      
      const favouritedProductIds = userFavourites.map(fav => fav.productId);
      
      productsWithFav = products.map(product => ({
        ...product,
        is_fav: favouritedProductIds.includes(product.id)
      }));
    }
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      products: productsWithFav,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getProductById(id: number, userId?: number): Promise<any | null> {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.author',
        'product.publishedDate',
        'product.publisher',
        'product.pages',
        'product.language',
        'product.format',
        'product.isbn',
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
      .where('product.id = :id', { id })
      .andWhere('product.status = :status', { status: 1 })
      .getOne();

    if (!product) {
      return null;
    }

    // Add is_fav field if userId is provided
    if (userId) {
      const favourite = await this.favouritesRepository.findOne({
        where: { userId, type: FavouriteType.PRODUCT, productId: id }
      });
      
      return {
        ...product,
        is_fav: !!favourite
      };
    }
    
    return product;
  }

  async submitReview(userId: number, submitReviewDto: SubmitReviewDto): Promise<ProductRating> {
    const { productId, rating, message } = submitReviewDto;

    // Check if product exists and is active
    const product = await this.productsRepository.findOne({
      where: { id: productId, status: 1 },
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    // Check if user has already rated this product
    const existingRating = await this.productRatingsRepository.findOne({
      where: { userId, productId },
    });

    let ratingRecord: ProductRating;

    if (existingRating) {
      throw new ConflictException('You have already rated this product.');
    } else {
      // Create new rating
      const newRating = this.productRatingsRepository.create({
        productId,
        userId,
        rating,
        message,
      });
      ratingRecord = await this.productRatingsRepository.save(newRating);
    }

    // Update product average rating
    await this.updateProductAverageRating(productId);

    return ratingRecord;
  }

  async getProductReviews(productId: number): Promise<{ reviews: ProductRating[], averageRating: number }> {
    // Check if product exists
    const product = await this.productsRepository.findOne({
      where: { id: productId, status: 1 },
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    const reviews = await this.productRatingsRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .select([
        'rating.id',
        'rating.productId',
        'rating.rating',
        'rating.message',
        'rating.userId',
        'rating.createdAt',
        'rating.updatedAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.image'
      ])
      .where('rating.productId = :productId', { productId })
      .orderBy('rating.createdAt', 'DESC')
      .getMany();

    return {
      reviews,
      averageRating: product.averageRating,
    };
  }

  async getProductCategories(): Promise<ProductCategory[]> {
    return this.productCategoriesRepository
      .createQueryBuilder('category')
      .select(['category.id', 'category.name'])
      .where('category.status = :status', { status: 1 })
      .getMany();
  }

  private async updateProductAverageRating(productId: number): Promise<void> {
    const result = await this.productRatingsRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .where('rating.productId = :productId', { productId })
      .getRawOne();

    const averageRating = parseFloat(result.average) || 0;

    await this.productsRepository.update(productId, {
      averageRating,
    });
  }
} 