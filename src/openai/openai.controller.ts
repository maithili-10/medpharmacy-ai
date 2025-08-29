import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { OpenaiService } from './openai.service';
class SendMessageDto {
  message!: string;
  threadId?: number;
}

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendMessage(@Body() body: { query?: string; threadId?: number }) {
    // accept your current client payload { "query": "..." }
    if (typeof body?.query !== 'string' || !body.query.trim()) {
      throw new Error('`query` must be a non-empty string');
    }
    return this.openaiService.handleUserMessage(body.query, body.threadId);
  }
}
