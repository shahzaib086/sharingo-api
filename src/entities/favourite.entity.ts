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
import { Video } from './video.entity';
import { Product } from './product.entity';

export enum FavouriteType {
  VIDEO = 'video',
  PRODUCT = 'product',
}

@Entity('favourites')
export class Favourite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column({
    type: 'enum',
    enum: FavouriteType,
  })
  type: FavouriteType;

  @Column({ nullable: true })
  videoId: number;

  @ManyToOne('Video')
  @JoinColumn({ name: 'videoId' })
  video: any;

  @Column({ nullable: true })
  productId: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'productId' })
  product: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 