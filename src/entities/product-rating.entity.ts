import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('product_ratings')
export class ProductRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'productId' })
  product: any;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column()
  userId: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'userId' })
  user: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 