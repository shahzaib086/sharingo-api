import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductMedia } from '../entities/product-media.entity';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImagesDto } from './dto/update-product-images.dto';
import { MediaType } from '../entities/product-media.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(ProductMedia)
    private readonly productMediaRepository: Repository<ProductMedia>,
  ) {}

  async getProducts(getProductsDto: GetProductsDto, userId?: number): Promise<{ products: any[], total: number, page: number, limit: number, totalPages: number }> {
    const { categoryId, searchKeywords, page = 1, limit = 10 } = getProductsDto;
    
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.nameSlug',
        'product.categoryId',
        'product.addressId',
        'product.userId',
        'product.price',
        'product.description',
        'product.status',
        'product.views',
        'product.tags',
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
        '(product.name ILIKE :searchKeywords OR product.description ILIKE :searchKeywords)',
        { searchKeywords: `%${searchKeywords}%` }
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();
    
    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    const products = await queryBuilder.getMany();
    
    // Fetch media for all products in one query
    const productIds = products.map(p => p.id);
    const allMedia = productIds.length > 0 ? await this.productMediaRepository
      .createQueryBuilder('media')
      .where('media.productId IN (:...productIds)', { productIds })
      .orderBy('media.sequence', 'ASC')
      .getMany() : [];
    
    // Group media by productId
    const mediaByProduct = allMedia.reduce((acc, media) => {
      if (!acc[media.productId]) {
        acc[media.productId] = [];
      }
      acc[media.productId].push(media);
      return acc;
    }, {} as Record<number, ProductMedia[]>);
    
    // Add media to each product
    const productsWithMedia = products.map(product => ({
      ...product,
      media: mediaByProduct[product.id] || []
    }));
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      products: productsWithMedia,
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
      .leftJoinAndSelect('product.address', 'address')
      .leftJoinAndSelect('product.user', 'user')
      .select([
        'product.id',
        'product.name',
        'product.nameSlug',
        'product.categoryId',
        'product.addressId',
        'product.userId',
        'product.price',
        'product.description',
        'product.status',
        'product.views',
        'product.tags',
        'product.createdAt',
        'product.updatedAt',
        'category.id',
        'category.name',
        'address.id',
        'address.address1',
        'address.address2',
        'address.city',
        'address.state',
        'address.country',
        'address.zipcode',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.image'
      ])
      .where('product.id = :id', { id })
      .andWhere('product.status = :status', { status: 1 })
      .getOne();

    if (!product) {
      return null;
    }

    // Fetch media for the product
    const media = await this.productMediaRepository.find({
      where: { productId: product.id },
      order: { sequence: 'ASC' },
    });

    return {
      ...product,
      media
    };
  }

  async getProductCategories(): Promise<ProductCategory[]> {
    return this.productCategoriesRepository
      .createQueryBuilder('category')
      .select(['category.id', 'category.name'])
      .where('category.status = :status', { status: 1 })
      .getMany();
  }

  // Helper function to generate slug from name
  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return baseSlug;
  }

  // Helper function to generate unique slug
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.productsRepository.findOne({ where: { nameSlug: slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  async create(createProductDto: CreateProductDto, userId: number): Promise<Product> {
    const baseSlug = this.generateSlug(createProductDto.name);
    const uniqueSlug = await this.generateUniqueSlug(baseSlug);

    const product = this.productsRepository.create({
      ...createProductDto,
      userId,
      nameSlug: uniqueSlug,
      price: createProductDto.price ?? 0,
      views: 0,
      status: createProductDto.status ?? 1,
    });

    return await this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If name is being updated, generate new slug
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const baseSlug = this.generateSlug(updateProductDto.name);
      product.nameSlug = await this.generateUniqueSlug(baseSlug);
    }

    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async addProductMedia(
    productId: number,
    mediaData: UpdateProductImagesDto,
    userId: number,
  ): Promise<ProductMedia> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const productMedia = this.productMediaRepository.create({
      productId,
      mediaUrl: mediaData.mediaUrl,
      type: mediaData.type,
      sequence: mediaData.sequence,
    });

    return await this.productMediaRepository.save(productMedia);
  }

  async getProductMedia(productId: number): Promise<ProductMedia[]> {
    return await this.productMediaRepository.find({
      where: { productId },
      order: { sequence: 'ASC' },
    });
  }

  async deleteProductMedia(mediaId: number, userId: number): Promise<void> {
    const media = await this.productMediaRepository.findOne({ 
      where: { id: mediaId },
      relations: ['product'],
    });

    if (!media) {
      throw new NotFoundException('Product media not found');
    }

    await this.productMediaRepository.remove(media);
  }

  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
    sequence: number = 0,
    userId: number,
  ): Promise<ProductMedia> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Create uploads/products directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename: {productId}-{timestamp}-{random}.ext
    const fileExt = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${productId}-${timestamp}-${random}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Determine media type based on file extension
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExts = ['.mp4', '.mov', '.avi', '.webm'];
    const ext = fileExt.toLowerCase();
    
    let mediaType: MediaType = MediaType.IMAGE;
    if (videoExts.includes(ext)) {
      mediaType = MediaType.VIDEO;
    }

    // Create relative URL for the file
    const mediaUrl = `/uploads/products/${fileName}`;

    // Save media record to database
    const productMedia = this.productMediaRepository.create({
      productId,
      mediaUrl,
      type: mediaType,
      sequence,
    });

    return await this.productMediaRepository.save(productMedia);
  }

} 