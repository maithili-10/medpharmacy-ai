import { Controller, Post, Body, Get, Param } from '@nestjs/common';

import { MessagesService } from './messages.service';
import { OpenaiService } from '../openai.service';
import { ThreadService } from '../threads/thread.service';


@Controller('messages')
export class MessagesController {
  constructor(
    private openaiService: OpenaiService,
    private messagesService: MessagesService,
    private threadService: ThreadService,
  ) {}

  @Post()
  async sendMessage(
    @Body('query') query: string,
    @Body('threadId') threadId?: number,
  ) {
    return this.openaiService.handleUserMessage(query, threadId);
  }

// Corrected route for fetching messages by thread
  @Get('thread/:threadId')
  async getMessages(@Param('threadId') threadId: number) {
    console.log('Raw route param:', threadId);

    // Convert string to number
    const id = Number(threadId);
    if (isNaN(id)) {
      return { error: 'Invalid thread ID' };
    }

    console.log('Converted thread ID:', id);

    // Check if the thread exists
    const thread = await this.threadService.getThreadById(id);
    if (!thread) {
      return { error: `Thread with ID ${id} not found` };
    }

    // Fetch messages for this thread
    const messages = await this.messagesService.getMessagesByThread(id);
    console.log(`Fetched ${messages.length} messages for thread ID ${id}`);

    return messages;
  }

  
}
