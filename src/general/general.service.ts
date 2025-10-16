import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatus, Gender, OnboardingStep } from '@common/enums';
import { Faq } from '../entities/faq.entity';

@Injectable()
export class GeneralService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  getMetadata() {
    return {
      enums: {
        userStatus: UserStatus,
        gender: Object.values(Gender),
        onboardingStep: {
          "account_creation": OnboardingStep.ACCOUNT_CREATION,
          "otp_verification": OnboardingStep.OTP_VERIFICATION,
          "profile_completion": OnboardingStep.PROFILE_COMPLETION,
        },
      },
      customer_support: {
        title: 'Sharingo Support',
        description: 'We are here to help you with any issues or questions you may have.',
        email: 'support@sharingo.com',
        phone: '+1234567890',
        whatsapp: '+1234567890',
      },
      constants: {
        appName: 'Sharingo API',
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

}
