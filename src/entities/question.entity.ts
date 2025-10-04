import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionGroup, OldSelfStory } from '../common/enums/user.enum';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionGroup,
  })
  group: QuestionGroup;

  @Column({
    type: 'enum',
    enum: OldSelfStory,
  })
  category: OldSelfStory;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 