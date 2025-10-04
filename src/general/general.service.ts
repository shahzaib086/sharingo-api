import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatus, Gender, RelationshipStatus, NewSelfStory, OnboardingStep, OldSelfStory } from '@common/enums';
import { Faq } from '../entities/faq.entity';
import { Question } from '../entities/question.entity';

@Injectable()
export class GeneralService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  getMetadata() {
    return {
      enums: {
        userStatus: UserStatus,
        gender: Object.values(Gender),
        relationshipStatus: Object.values(RelationshipStatus),
        onboardingStep: {
          "account_creation": OnboardingStep.ACCOUNT_CREATION,
          "otp_verification": OnboardingStep.OTP_VERIFICATION,
          "self_story_creation": OnboardingStep.SELF_STORY_CREATION,
          "profile_completion": OnboardingStep.PROFILE_COMPLETION,
        },
        oldSelfStory: Object.values(OldSelfStory),
        newSelfStory: Object.values(NewSelfStory),
      },
      customer_support: {
        title: 'GodLove Support',
        description: 'We are here to help you with any issues or questions you may have.',
        email: 'support@godlove.com',
        phone: '+1234567890',
        whatsapp: '+1234567890',
      },
      constants: {
        appName: 'GodLove API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }

  async getFaqs() {
    return await this.faqRepository.find({
      where: { isActive: true },
      order: { sequence: 'ASC' },
    });
  }

  async getQuestionsByGroup() {
    const questions = await this.questionRepository.find({
      where: { isActive: true },
    });

    const grouped = questions.reduce((acc, question) => {
      const groupKey = question.group; // could be string like "Group 1"
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(question);
      return acc;
    }, {} as Record<string, Question[]>);

    return {
      questions: grouped,
      oldSelfStory: Object.values(OldSelfStory),
      newSelfStory: Object.values(NewSelfStory),
    };
  }

}
