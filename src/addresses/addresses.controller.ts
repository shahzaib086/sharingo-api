import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '../common/dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  async create(@Body() createAddressDto: CreateAddressDto, @Request() req: any) {
    const address = await this.addressesService.create(
      createAddressDto,
      req.user.id,
    );
    return new DefaultResponseDto(
      'Address created successfully',
      true,
      address,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses for logged in user' })
  async findAll(@Request() req: any) {
    const addresses = await this.addressesService.findAll(req.user.id);
    return new DefaultResponseDto(
      'Addresses retrieved successfully',
      true,
      addresses,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address details by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const addressId = parseInt(id);
    
    if (isNaN(addressId)) {
      return new DefaultResponseDto(
        'Invalid address ID',
        false,
        null,
      );
    }

    const address = await this.addressesService.findOne(addressId, req.user.id);
    return new DefaultResponseDto(
      'Address retrieved successfully',
      true,
      address,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: any,
  ) {
    const addressId = parseInt(id);
    
    if (isNaN(addressId)) {
      return new DefaultResponseDto(
        'Invalid address ID',
        false,
        null,
      );
    }

    const address = await this.addressesService.update(
      addressId,
      updateAddressDto,
      req.user.id,
    );
    return new DefaultResponseDto(
      'Address updated successfully',
      true,
      address,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id') id: string, @Request() req: any) {
    const addressId = parseInt(id);
    
    if (isNaN(addressId)) {
      return new DefaultResponseDto(
        'Invalid address ID',
        false,
        null,
      );
    }

    await this.addressesService.remove(addressId, req.user.id);
    return new DefaultResponseDto(
      'Address deleted successfully',
      true,
      null,
    );
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiParam({ name: 'id', type: Number })
  async setDefault(@Param('id') id: string, @Request() req: any) {
    const addressId = parseInt(id);
    
    if (isNaN(addressId)) {
      return new DefaultResponseDto(
        'Invalid address ID',
        false,
        null,
      );
    }

    const address = await this.addressesService.setDefault(addressId, req.user.id);
    return new DefaultResponseDto(
      'Address set as default successfully',
      true,
      address,
    );
  }
}
