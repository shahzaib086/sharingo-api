import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  videoUrl: string;

  @Column({ length: 255, nullable: true })
  thumbnailUrl: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 100, nullable: true })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  categoryId: number;

  @ManyToOne('VideoCategory', { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: any;

  @Column({ length: 100, nullable: true })
  tags: string;

  @Column({ default: 0 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 