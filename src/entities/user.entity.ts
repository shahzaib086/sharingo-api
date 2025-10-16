import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OnboardingStep } from '../common/enums/user.enum';

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

  @Column({ length: 255, nullable: true })
  addressLine1: string;

  @Column({ length: 255, nullable: true })
  addressLine2: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 10, nullable: true })
  postalCode: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
