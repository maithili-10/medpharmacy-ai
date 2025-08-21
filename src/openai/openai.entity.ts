import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  threadId: string;

  @Column()
  role: string; // 'user' or 'assistant'

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
