import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  author: string;

  @Column({ type: 'date', nullable: true })
  publishedDate: Date;

  @Column({ length: 100, nullable: true })
  publisher: string;

  @Column({ type: 'int', default: 0 })
  pages: number;

  @Column({ length: 20, nullable: true })
  language: string;

  @Column({ length: 20, nullable: true })
  format: string;

  @Column({ length: 30, nullable: true })
  isbn: string;

  @Column()
  categoryId: number;

  @ManyToOne('ProductCategory', { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'int', default: 0 })
  inventory: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @OneToMany('ProductRating', 'product')
  ratings: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 