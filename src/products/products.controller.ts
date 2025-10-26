import { Controller, Get, Post, Param, Query, Body, UseGuards, Request, Patch, Delete, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImagesDto } from './dto/update-product-images.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '../common/dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products with optional filters and pagination' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'searchKeywords', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of products per page (default: 10)' })
  async getProducts(@Query() getProductsDto: GetProductsDto, @Request() req: any) {
    const userId = req.user?.id;
    const products = await this.productsService.getProducts(getProductsDto, userId);
    return new DefaultResponseDto(
      'Products retrieved successfully',
      true,
      products,
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories' })
  async getProductCategories() {
    const categories = await this.productsService.getProductCategories();
    return new DefaultResponseDto(
      'Product categories retrieved successfully',
      true,
      categories,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', type: Number })
  async getProductById(@Param('id') id: string, @Request() req: any) {
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return new DefaultResponseDto(
        'Invalid product ID',
        false,
        null,
      );
    }

    const userId = req.user?.id;
    const product = await this.productsService.getProductById(productId, userId);
    
    if (!product) {
      return new DefaultResponseDto(
        'Product not found',
        false,
        null,
      );
    }

    return new DefaultResponseDto(
      'Product details retrieved successfully',
      true,
      product,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated or user ID missing');
    }
    
    const userId = req.user.id;
    const product = await this.productsService.create(createProductDto, userId);
    return new DefaultResponseDto(
      'Product created successfully',
      true,
      product,
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return new DefaultResponseDto(
        'Invalid product ID',
        false,
        null,
      );
    }

    const userId = req.user.id;
    const product = await this.productsService.update(productId, updateProductDto, userId);
    return new DefaultResponseDto(
      'Product updated successfully',
      true,
      product,
    );
  }

  @Post(':id/upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image/file' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiQuery({ name: 'sequence', required: false, type: Number, description: 'Media sequence/order (default: 0)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image or video file to upload',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('sequence') sequence: string,
    @Request() req: any,
  ) {
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return new DefaultResponseDto(
        'Invalid product ID',
        false,
        null,
      );
    }

    if (!file) {
      return new DefaultResponseDto(
        'No file uploaded',
        false,
        null,
      );
    }

    const userId = req.user.id;
    const seq = sequence ? parseInt(sequence) : 0;
    
    const media = await this.productsService.uploadProductImage(productId, file, seq, userId);
    return new DefaultResponseDto(
      'File uploaded successfully',
      true,
      media,
    );
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Get all media for a product' })
  @ApiParam({ name: 'id', type: Number })
  async getProductMedia(@Param('id') id: string) {
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return new DefaultResponseDto(
        'Invalid product ID',
        false,
        null,
      );
    }

    const media = await this.productsService.getProductMedia(productId);
    return new DefaultResponseDto(
      'Product media retrieved successfully',
      true,
      media,
    );
  }

  @Delete('media/:mediaId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a product media' })
  @ApiParam({ name: 'mediaId', type: Number })
  async deleteProductMedia(@Param('mediaId') mediaId: string, @Request() req: any) {
    const id = parseInt(mediaId);
    
    if (isNaN(id)) {
      return new DefaultResponseDto(
        'Invalid media ID',
        false,
        null,
      );
    }

    const userId = req.user.id;
    await this.productsService.deleteProductMedia(id, userId);
    return new DefaultResponseDto(
      'Product media deleted successfully',
      true,
      null,
    );
  }

} 