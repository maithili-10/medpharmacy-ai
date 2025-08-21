import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { MessagesService } from './messages.service';
import { ThreadsModule } from '../threads/threads.module';
import { MessagesController } from './messages.controller';
import { OpenaiModule } from '../openai.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ThreadsModule,
    forwardRef(() => OpenaiModule), // <-- forwardRef added
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
