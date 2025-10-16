import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '@common/dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
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

} 