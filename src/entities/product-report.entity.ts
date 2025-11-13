import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('product_reports')
@Index(['reportedUserId', 'productId'], { unique: true })
export class ProductReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportedUserId: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser: User;

  @Column()
  productId: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

