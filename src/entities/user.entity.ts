import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OnboardingStep, UserRole } from '../common/enums/user.enum';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ length: 10, nullable: true })
  countryCode: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 255, select: false, nullable: true })
  password: string;

  @Column({ length: 100, nullable: true })
  otp: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  // Google OAuth fields
  @Column({ length: 255, nullable: true })
  googleId: string;

  @Column({ length: 255, nullable: true })
  googlePicture: string;

  @Column({ default: false })
  isGoogle: boolean;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ type: 'enum', enum: OnboardingStep })
  onboardingStep: OnboardingStep;

  @Column({ default: 1 })
  status: number;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ length: 255, nullable: true })
  fcmToken: string;

  @OneToMany('Address', 'user')
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
