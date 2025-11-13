import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Address } from '../entities/address.entity';
import { OnboardingStep } from '../common/enums/user.enum';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
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

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async updateProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    if (updateUserProfileDto.firstName !== undefined) {
      user.firstName = updateUserProfileDto.firstName;
    }
    if (updateUserProfileDto.lastName !== undefined) {
      user.lastName = updateUserProfileDto.lastName;
    }
    if (updateUserProfileDto.countryCode !== undefined) {
      user.countryCode = updateUserProfileDto.countryCode;
    }
    if (updateUserProfileDto.phoneNumber !== undefined) {
      user.phoneNumber = updateUserProfileDto.phoneNumber;
    }

    return await this.usersRepository.save(user);
  }

  async getUserWithAddress(userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: [
        'id',
        'firstName',
        'lastName',
        'name',
        'email',
        'countryCode',
        'phoneNumber',
        'gender',
        'status',
        'image',
        'onboardingStep',
        'isEmailVerified',
        'isPhoneVerified',
        'role',
        'createdAt',
        'updatedAt',
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get default address or first address
    let address = await this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });

    // If no default address, get the first address
    address ??= await this.addressRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    return {
      user,
      address: address || null,
    };
  }

}
