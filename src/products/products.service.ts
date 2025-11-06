import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductMedia, MediaType } from '../entities/product-media.entity';
import { GetProductsDto } from './dto/get-products.dto';
import { GetPublicProductsDto } from './dto/get-public-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImagesDto } from './dto/update-product-images.dto';
import { ProductStatus } from '@common/enums';
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

  async getProducts(getProductsDto: GetProductsDto, userId?: number): Promise<{ counts: { active: number, completed: number }, products: any[], total: number, page: number, limit: number, totalPages: number }> {
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
      .where('product.status IN (:...status)', { status: [ProductStatus.ACTIVE, ProductStatus.COMPLETED] });

    if (userId) {
      queryBuilder.andWhere('product.userId = :userId', { userId });
    }

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

    const completedCounts = await this.productsRepository.count({ where: { userId, status: ProductStatus.COMPLETED } });
    const activeCounts = await this.productsRepository.count({ where: { userId, status: ProductStatus.ACTIVE } });
    const counts = {
      active: activeCounts,
      completed: completedCounts,
    }
    
    return {
      counts,
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
      .andWhere('product.status IN (:...status)', { status: [ProductStatus.ACTIVE, ProductStatus.COMPLETED] })
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

  async getPublicProducts(
    getPublicProductsDto: GetPublicProductsDto,
  ): Promise<{
    products: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      categoryId,
      searchKeywords,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = getPublicProductsDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.user', 'user')
      .leftJoinAndSelect('product.address', 'address')
      .select([
        'product.id',
        'product.name',
        'product.nameSlug',
        'product.categoryId',
        'product.addressId',
        'product.price',
        'product.description',
        'product.views',
        'product.tags',
        'product.createdAt',
        'product.updatedAt',
        'category.id',
        'category.name',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.image',
        'address.id',
        'address.address1',
        'address.address2',
        'address.city',
        'address.state',
        'address.country',
        'address.zipcode',
      ])
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.createdAt', 'DESC');

    // Apply category filter
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Apply search keywords filter
    if (searchKeywords) {
      queryBuilder.andWhere(
        '(product.name ILIKE :searchKeywords OR product.description ILIKE :searchKeywords OR product.tags ILIKE :searchKeywords)',
        { searchKeywords: `%${searchKeywords}%` },
      );
    }

    // Apply price range filters
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const products = await queryBuilder.getMany();

    // Fetch media for all products in one query
    const productIds = products.map((p) => p.id);
    const allMedia =
      productIds.length > 0
        ? await this.productMediaRepository
            .createQueryBuilder('media')
            .where('media.productId IN (:...productIds)', { productIds })
            .orderBy('media.sequence', 'ASC')
            .getMany()
        : [];

    // Group media by productId
    const mediaByProduct = allMedia.reduce((acc, media) => {
      if (!acc[media.productId]) {
        acc[media.productId] = [];
      }
      acc[media.productId].push(media);
      return acc;
    }, {} as Record<number, ProductMedia[]>);

    // Add media to each product
    const productsWithMedia = products.map((product) => ({
      ...product,
      media: mediaByProduct[product.id] || [],
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      products: productsWithMedia,
      total,
      page,
      limit,
      totalPages,
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
    
    // Check if base slug exists (including soft-deleted), if not return it
    const existingProduct = await this.productsRepository.findOne({ 
      where: { nameSlug: slug },
      withDeleted: true,
    });
    if (!existingProduct) {
      return slug;
    }
    
    // If slug exists, generate a random 6-digit number and append it
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit number (100000-999999)
      slug = `${baseSlug}-${randomNumber}`;
      
      const existing = await this.productsRepository.findOne({ 
        where: { nameSlug: slug },
        withDeleted: true,
      });
      if (!existing) {
        return slug;
      }
      
      attempts++;
    }
    
    // Fallback: use timestamp if all attempts fail (should be very rare)
    slug = `${baseSlug}-${Date.now()}`;
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
      status: createProductDto.status ?? ProductStatus.ACTIVE,
    });

    return await this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number): Promise<Product> {
    // Find product only if it belongs to the logged-in user
    const product = await this.productsRepository.findOne({ 
      where: { id, userId },
      withDeleted: false,
    });

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

  async deleteProductMediaByProductAndMediaId(productId: number, mediaId: number, userId: number): Promise<void> {
    // First verify the product exists and belongs to the user
    const product = await this.productsRepository.findOne({ 
      where: { id: productId, userId },
      withDeleted: false,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify the media exists and belongs to the product
    const media = await this.productMediaRepository.findOne({ 
      where: { id: mediaId, productId },
    });

    if (!media) {
      throw new NotFoundException('Product media not found');
    }

    // Delete the physical file if it exists
    if (media.mediaUrl && media.mediaUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), media.mediaUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          // Log error but continue with database deletion
          console.error(`Failed to delete file: ${filePath}`, error);
        }
      }
    }

    // Delete the media record from database
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

  async softDelete(id: number, userId: number): Promise<void> {
    const product = await this.productsRepository.findOne({ 
      where: { id, userId },
      withDeleted: false,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify ownership before soft delete
    if (product.userId !== userId) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete the product
    await this.productsRepository.softRemove(product);
  }

} 