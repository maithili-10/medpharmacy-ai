import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';
import { ThreadsModule } from './threads/threads.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    MessagesModule, // Provides MessagesService
    ThreadsModule,  // Provides ThreadService
  ],
  controllers: [OpenaiController],
  providers: [OpenaiService], // Only provide what is defined in this module
  exports: [OpenaiService],   // Export if other modules need to use it
})
export class OpenaiModule {}
