import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductMedia, MediaType } from '../entities/product-media.entity';
import { Chat } from '../entities/chat.entity';
import { User } from '../entities/user.entity';
import { ProductReport } from '../entities/product-report.entity';
import { GetProductsDto } from './dto/get-products.dto';
import { GetPublicProductsDto } from './dto/get-public-products.dto';
import { GetAuthenticatedProductsDto } from './dto/get-authenticated-products.dto';
import { ReportProductDto } from './dto/report-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImagesDto } from './dto/update-product-images.dto';
import { ProductStatus, ChatStatus, UserRole } from '@common/enums';
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(ProductMedia)
    private readonly productMediaRepository: Repository<ProductMedia>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductReport)
    private readonly productReportRepository: Repository<ProductReport>,
    private readonly notificationsService: NotificationsService,
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

  async getProductBySlugOrId(identifier: string): Promise<Product | null> {
    const queryBuilder = this.productsRepository
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
        'user.createdAt'
      ])
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE });

    // Check if identifier is a number (ID) or string (slug)
    const numericId = parseInt(identifier);
    if (!isNaN(numericId) && numericId.toString() === identifier) {
      // It's a numeric ID
      queryBuilder.where('product.id = :id', { id: numericId });
    } else {
      // It's a slug
      queryBuilder.where('product.nameSlug = :slug', { slug: identifier });
    }

    const product = await queryBuilder.getOne();

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
      location,
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

    if (location) {
      queryBuilder.andWhere('address.city ILIKE :location OR address.state ILIKE :location', { location: `%${location}%` });
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

    const savedProduct = await this.productsRepository.save(product);

    // Send notifications to all active users asynchronously (don't await)
    // Only if the product is ACTIVE
    if (savedProduct.status === ProductStatus.ACTIVE) {
      this.sendNewProductNotifications(savedProduct.id, userId).catch(error => {
        console.error('Error sending new product notifications:', error);
      });
    }

    return savedProduct;
  }

  private async sendNewProductNotifications(productId: number, userId: number): Promise<void> {
    try {
      // Fetch product with full details including category, address
      const product = await this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.address', 'address')
        .where('product.id = :id', { id: productId })
        .getOne();

      if (!product) {
        return;
      }

      // Fetch product owner details
      const productOwner = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'email'],
      });

      if (!productOwner) {
        return;
      }

      // Send notifications to all users
      const result = await this.notificationsService.notifyAllUsersAboutNewProduct(
        product,
        productOwner,
      );

      console.log(`New product notifications sent: ${result.created} created, ${result.failed} failed`);
    } catch (error) {
      console.error('Error in sendNewProductNotifications:', error);
    }
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

    const savedMedia = await this.productMediaRepository.save(productMedia);

    // If sequence is 1, update the product's main image
    if (mediaData.sequence === 1) {
      product.image = mediaData.mediaUrl;
      await this.productsRepository.save(product);
    }

    return savedMedia;
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

    const productId = media.productId;
    const wasSequenceOne = media.sequence === 1;

    await this.productMediaRepository.remove(media);

    // If the deleted media was sequence 1, update product image
    if (wasSequenceOne) {
      const product = await this.productsRepository.findOne({ 
        where: { id: productId },
        withDeleted: false,
      });

      if (product) {
        // Find the next available image (lowest sequence)
        const nextImage = await this.productMediaRepository.findOne({
          where: { productId },
          order: { sequence: 'ASC' },
        });

        // Update product image to the next available image or null
        product.image = nextImage ? nextImage.mediaUrl : null;
        await this.productsRepository.save(product);
      }
    }
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

    const wasSequenceOne = media.sequence === 1;

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

    // If the deleted media was sequence 1, update product image
    if (wasSequenceOne) {
      // Find the next available image (lowest sequence)
      const nextImage = await this.productMediaRepository.findOne({
        where: { productId },
        order: { sequence: 'ASC' },
      });

      // Update product image to the next available image or null
      product.image = nextImage ? nextImage.mediaUrl : null;
      await this.productsRepository.save(product);
    }
  }

  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<ProductMedia> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get the highest sequence number for this product
    const maxSequenceMedia = await this.productMediaRepository.findOne({
      where: { productId },
      order: { sequence: 'DESC' },
    });

    // Set sequence to max + 1, or 1 if no media exists
    const sequence = maxSequenceMedia ? maxSequenceMedia.sequence + 1 : 1;

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

    const savedMedia = await this.productMediaRepository.save(productMedia);

    // If sequence is 1, update the product's main image
    if (sequence === 1) {
      product.image = mediaUrl;
      await this.productsRepository.save(product);
    }

    return savedMedia;
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

  async updateProductStatus(id: number, status: number, requestUserId: number, role: UserRole = UserRole.USER): Promise<Product> {
    // Find product
    const product = await this.productsRepository.findOne({ 
      where: { id },
      withDeleted: false,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log("role", role);
    // Verify the requesting user owns the product or is the user associated with the product
    if (role === UserRole.USER && product.userId !== requestUserId) {
      throw new NotFoundException('Product not found or you do not have permission to update this product');
    }

    // Update the status
    product.status = status;
    const updatedProduct = await this.productsRepository.save(product);

    // If product status is changed to COMPLETED, mark all related chats as INACTIVE
    if (status === ProductStatus.COMPLETED) {
      await this.chatRepository
        .createQueryBuilder()
        .update(Chat)
        .set({ status: ChatStatus.INACTIVE })
        .where('productId = :productId', { productId: id })
        .execute();
    }

    return updatedProduct;
  }

  async incrementProductView(
    identifier: string, 
    viewerUserId?: number
  ): Promise<{ found: boolean; incremented: boolean; productId?: number; views?: number }> {
    // Check if identifier is a number (ID) or string (slug)
    const numericId = Number.parseInt(identifier);
    let product: Product | null = null;

    if (!Number.isNaN(numericId) && numericId.toString() === identifier) {
      // It's a numeric ID
      product = await this.productsRepository.findOne({
        where: { id: numericId, status: ProductStatus.ACTIVE },
        withDeleted: false,
      });
    } else {
      // It's a slug
      product = await this.productsRepository.findOne({
        where: { nameSlug: identifier, status: ProductStatus.ACTIVE },
        withDeleted: false,
      });
    }

    if (!product) {
      return { found: false, incremented: false };
    }

    // Check if the viewer is the product owner
    // If viewerUserId is provided and matches the product owner, don't increment
    if (viewerUserId && product.userId === viewerUserId) {
      return { 
        found: true, 
        incremented: false, 
        productId: product.id, 
        views: product.views 
      };
    }

    // Increment the view count using a direct database update for better performance
    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({ views: () => 'views + 1' })
      .where('id = :id', { id: product.id })
      .execute();

    // Fetch and return the updated product with the new view count
    const updatedProduct = await this.productsRepository.findOne({
      where: { id: product.id },
      withDeleted: false,
    });

    return { 
      found: true, 
      incremented: true, 
      productId: updatedProduct!.id, 
      views: updatedProduct!.views 
    };
  }

  async getAuthenticatedProducts(
    getAuthenticatedProductsDto: GetAuthenticatedProductsDto,
  ): Promise<{
    products: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      categoryId,
      sortBy = 'createdAt',
      order = 'DESC',
      keyword,
      page = 1,
      limit = 20,
    } = getAuthenticatedProductsDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
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
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.image',
      ])
      // .where('product.status = :status', { status: ProductStatus.ACTIVE });

    // Apply category filter
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Apply keyword search on product name
    if (keyword) {
      queryBuilder.andWhere('product.name ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`product.${sortBy}`, order);

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

    // Fetch report counts for all products
    const reportCounts =
      productIds.length > 0
        ? await this.productReportRepository
            .createQueryBuilder('report')
            .select('report.productId', 'productId')
            .addSelect('COUNT(report.id)', 'count')
            .where('report.productId IN (:...productIds)', { productIds })
            .groupBy('report.productId')
            .getRawMany()
        : [];

    // Create a map of productId to report count
    const reportCountByProduct = reportCounts.reduce((acc, item) => {
      acc[item.productId] = parseInt(item.count, 10);
      return acc;
    }, {} as Record<number, number>);

    // Add media and report count to each product
    const productsWithMedia = products.map((product) => ({
      ...product,
      media: mediaByProduct[product.id] || [],
      reportsCount: reportCountByProduct[product.id] || 0,
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

  async reportProduct(
    reportProductDto: ReportProductDto,
    userId: number,
  ): Promise<ProductReport> {
    const { productId, message } = reportProductDto;

    // Check if product exists
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has already reported this product
    const existingReport = await this.productReportRepository.findOne({
      where: {
        reportedUserId: userId,
        productId,
      },
    });

    if (existingReport) {
      throw new BadRequestException('You already reported this product');
    }

    // Create new report
    const report = this.productReportRepository.create({
      reportedUserId: userId,
      productId,
      message,
    });

    return await this.productReportRepository.save(report);
  }

  async getProductReports(
    productId: number,
  ): Promise<{
    reports: ProductReport[];
    total: number;
  }> {
    // Check if product exists
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Build query - get all reports with user details
    const reports = await this.productReportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportedUser', 'user')
      .select([
        'report.id',
        'report.reportedUserId',
        'report.productId',
        'report.message',
        'report.createdAt',
        'report.updatedAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
      ])
      .where('report.productId = :productId', { productId })
      .orderBy('report.createdAt', 'DESC')
      .getMany();

    const total = reports.length;

    return {
      reports,
      total,
    };
  }

} 