// facial-analysis.module.ts
import { Module } from '@nestjs/common';
import { FacialAnalysisController } from './facial-analysis.controller';
import { FacialAnalysisService } from './facial-analysis.service';

@Module({
  controllers: [FacialAnalysisController],
  providers: [FacialAnalysisService],
})
export class FacialAnalysisModule {}
