import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from './thread.entity';
import { ThreadService } from './thread.service';

@Module({
  imports: [TypeOrmModule.forFeature([Thread])], // Repository becomes injectable
  providers: [ThreadService],
  exports: [ThreadService], // <-- export to be used in other modules
})
export class ThreadsModule {}
