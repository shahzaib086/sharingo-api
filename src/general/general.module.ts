import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralController } from './general.controller';
import { GeneralService } from './general.service';
import { Faq } from '../entities/faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [GeneralController],
  providers: [GeneralService],
  exports: [GeneralService],
})
export class GeneralModule {}
