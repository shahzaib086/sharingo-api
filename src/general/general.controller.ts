import { Controller, Get } from '@nestjs/common';
import { GeneralService } from './general.service';
import { DefaultResponseDto } from '@common/dto';

@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get('metadata')
  getMetadata() {
    const response = this.generalService.getMetadata();
    return new DefaultResponseDto(
      'Metadata fetched successfully',
      true,
      response,
    );
  }

  @Get('faqs')
  async getFaqs() {
    const response = await this.generalService.getFaqs();
    return new DefaultResponseDto('FAQs fetched successfully', true, response);
  }

  @Get('questions')
  async getQuestions() {
    const response = await this.generalService.getQuestionsByGroup()
    return new DefaultResponseDto('Questions by group fetched successfully', true, response);
  }

}
