import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { Thread } from '../threads/thread.entity';
import { Role } from '../enum';


@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(thread: Thread, role: Role, content: string): Promise<Message> {
    const message = this.messageRepository.create({ thread, role, content });
    return this.messageRepository.save(message);
  }

 async getMessagesByThread(threadId: number): Promise<Message[]> {
  console.log(threadId)
  const id = Number(threadId); // ensure it's a number
  console.log('Fetching messages for thread ID:', id);

  // Use QueryBuilder to fetch messages directly using threadId
  const messages = await this.messageRepository
    .createQueryBuilder('message')
    .where('message.threadId = :id', { id })
    .orderBy('message.createdAt', 'ASC')
    .getMany();

  console.log(`Fetched ${messages.length} messages for thread ID ${id}`);
  return messages;
}


}
