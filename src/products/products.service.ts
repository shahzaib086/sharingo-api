import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
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
    // if (userId) {
    //   productsWithFav = products;
    // }
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      products: productsWithFav,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getProductById(id: number, userId?: number): Promise<Product | null> {
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

    return product;
  }

  async getProductCategories(): Promise<ProductCategory[]> {
    return this.productCategoriesRepository
      .createQueryBuilder('category')
      .select(['category.id', 'category.name'])
      .where('category.status = :status', { status: 1 })
      .getMany();
  }

} 