import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { DefaultResponseDto } from '@common/dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('legal')
  async getLegalContent() {
    try {
      const termsAndConditions = await this.contentService.findByKey('terms_and_conditions');
      const privacyPolicy = await this.contentService.findByKey('privacy_policy');
      return new DefaultResponseDto(
        'Legal content fetched successfully',
        true,
        { termsAndConditions, privacyPolicy },
      );
    } catch {
      return new DefaultResponseDto(
        'Legal content not found',
        false,
        { termsAndConditions: null, privacyPolicy: null },
      );
    }
  }

  @Get('terms-and-conditions')
  async getTermsAndConditions() {
    try {
      const termsAndConditions = await this.contentService.findByKey('terms_and_conditions');
      return new DefaultResponseDto(
        'Terms and conditions fetched successfully',
        true,
        termsAndConditions,
      );
    } catch {
      return new DefaultResponseDto(
        'Terms and conditions not found',
        false,
        null,
      );
    }
  }

  @Get('privacy-policy')
  async getPrivacyPolicy() {
    try {
      const privacyPolicy = await this.contentService.findByKey('privacy_policy');
      return new DefaultResponseDto(
        'Privacy policy fetched successfully',
        true,
        privacyPolicy,
      );
    } catch {
      return new DefaultResponseDto(
        'Privacy policy not found',
        false,
        null,
      );
    }
  }

} 