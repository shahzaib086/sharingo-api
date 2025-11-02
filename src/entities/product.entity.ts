import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { ProductMedia } from './product-media.entity';
import { ProductCategory } from './product-category.entity';
import { User } from './user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true, nullable: true })
  nameSlug: string;

  @Column()
  categoryId: number;

  @ManyToOne('ProductCategory', { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;

  @Column({ nullable: true })
  addressId: number;

  @ManyToOne('Address', { eager: true })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Column()
  userId: number;

  @ManyToOne('User', { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1 })
  status: number;
  
  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'varchar', nullable: true })
  tags: string;

  @OneToMany('ProductMedia', 'product')
  media: ProductMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
} 