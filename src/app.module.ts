import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { FitbitController } from './fitbit/fitbit.controller';
import { FitbitService } from './fitbit/fitbit.service';
import { RecommendationService } from './recommendation/recommendation.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenaiModule } from './openai/openai.module';
import { Message } from './openai/messages/messages.entity';
import { Thread } from './openai/threads/thread.entity';
import { FacialAnalysisModule } from './openai/facial-analysis/facial-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
   TypeOrmModule.forRoot({
      // type: 'mysql',
      // host: 'localhost',
      // port: 3306,
      // username: 'root',
      // password: 'RadhiMaithili7$',
      // database: 'medx_ai',
      // entities: [Message, Thread],
      // synchronize: true,

       type: 'postgres',   // change from 'mysql'
      host: 'localhost',  // or your DB host
      port: 5432,         // default postgres port
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities:  [Message, Thread],
      synchronize: true,
    }),
    OpenaiModule, // imports ThreadsModule and MessagesModule internally
    ChatModule,
      FacialAnalysisModule
  ],
  controllers: [AppController, FitbitController],
  providers: [AppService, FitbitService, RecommendationService],
})
export class AppModule {}
