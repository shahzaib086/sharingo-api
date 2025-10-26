import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto, userId: number): Promise<Address> {
    // If setting as default, unset other default addresses
    if (createAddressDto.isDefault) {
      await this.addressesRepository.update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = this.addressesRepository.create({
      ...createAddressDto,
      userId,
    });

    return await this.addressesRepository.save(address);
  }

  async findAll(userId: number): Promise<Address[]> {
    return await this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto, userId: number): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If setting as default, unset other default addresses
    if (updateAddressDto.isDefault) {
      await this.addressesRepository
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: false })
        .where('userId = :userId', { userId })
        .andWhere('id != :id', { id })
        .andWhere('isDefault = :isDefault', { isDefault: true })
        .execute();
    }

    // Update the address
    Object.assign(address, updateAddressDto);
    return await this.addressesRepository.save(address);
  }

  async remove(id: number, userId: number): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressesRepository.remove(address);
  }

  async setDefault(id: number, userId: number): Promise<Address> {
    const address = await this.findOne(id, userId);

    // Unset all other default addresses
    await this.addressesRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    return await this.addressesRepository.save(address);
  }
}
