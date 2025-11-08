import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Message } from './message.entity';
import { ChatStatus } from '../common/enums';

@Entity('chats')
@Index(['productId', 'userAId', 'userBId'], { unique: true })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne('Product', { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  userAId: number;

  @ManyToOne('User', { eager: true })
  @JoinColumn({ name: 'userAId' })
  userA: User;

  @Column()
  userBId: number;

  @ManyToOne('User', { eager: true })
  @JoinColumn({ name: 'userBId' })
  userB: User;

  @Column({ type: 'text', nullable: true })
  lastMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ default: 0 })
  unreadCountUserA: number;

  @Column({ default: 0 })
  unreadCountUserB: number;

  @Column({ default: ChatStatus.ACTIVE })
  status: number;

  @OneToMany('Message', 'chat')
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

