import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  label: string; // home/office

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ length: 10 })
  countryCode: string;

  @Column({ length: 100 })
  region: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 