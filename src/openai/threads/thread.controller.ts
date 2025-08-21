import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { ThreadService } from './thread.service';

@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  async createThread(@Body('title') title: string) {
    return this.threadService.createThread(title || 'New Conversation');
  }

 

  @Get(':id')
  async getThread(@Param('id') id: number) {
    return this.threadService.getThreadById(id);
  }

  @Delete(':id')
  async deleteThread(@Param('id') id: number) {
    await this.threadService.deleteThread(id);
    return { message: 'Thread deleted' };
  }
}
