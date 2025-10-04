import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewSelfStory, OnboardingStep } from '../common/enums/user.enum';

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

  @Column({ length: 10 })
  countryCode: string;

  @Column({ length: 20 })
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

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 10, nullable: true })
  postalCode: string;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ length: 20, nullable: true })
  relationshipStatus: string;

  @Column({ length: 255, nullable: true })
  books: string;

  @Column({ type: 'enum', enum: OnboardingStep })
  onboardingStep: OnboardingStep;

  @Column({ default: 1 })
  status: number;

  @Column({ length: 255, nullable: true })
  image: string;

  // Add group_1, group_2, group_3, group_4, group_5, group_6, group_7 questions selection id as an object with key as group and value as question id
  @Column({ type: 'json', nullable: true })
  questionsSelection: { [key: string]: number };

  @Column({ default: 0 })
  worthlessness: number;

  @Column({ default: 0 })
  abandonment: number;

  @Column({ default: 0 })
  rejection: number;

  @Column({ default: 0 })
  abuse: number;

  @Column({ type: 'enum', enum: NewSelfStory, nullable: true })
  newSelfStory: NewSelfStory;

  @Column({ length: 255, nullable: true })
  fcmToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
