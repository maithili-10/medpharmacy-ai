import { Controller, Post, Body } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  /**
   * Send a user query to OpenAI and get assistant response
   * Body: { query: string, threadId?: number }
   */
  @Post('send')
  async sendMessage(
    @Body('query') query: string,
    @Body('threadId') threadId?: number,
  ) {
    return this.openaiService.handleUserMessage(query, threadId);
  }
}
