import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FacialAnalysisService } from './facial-analysis.service';

@Controller('facial-analysis')
export class FacialAnalysisController {
  constructor(private readonly facialService: FacialAnalysisService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const base64 = file.buffer.toString('base64');
    return this.facialService.analyzeFace(base64);
  }
}
