import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Thread } from './thread.entity';


@Injectable()
export class ThreadService {
  constructor(
    @InjectRepository(Thread)
    private  threadsRepository: Repository<Thread>, 
  ) {}

async getThreadById(threadId: number): Promise<Thread | null> {
  // Ensure threadId is a number
  const id = Number(threadId);

  const thread = await this.threadsRepository.findOne({
    where: { id }, // Just fetch the thread itself
  });

  console.log('Fetched thread:', thread); // Will be null if not found
  return thread;
}



  async createThread(title:string): Promise<Thread> {
    const thread = this.threadsRepository.create({title});
    return this.threadsRepository.save(thread);
  }
   async deleteThread(id: number): Promise<void> {
    await this.threadsRepository.delete(id);
  }
}
