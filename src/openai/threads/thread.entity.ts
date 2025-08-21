import { Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, Column } from 'typeorm';
import { Message } from '../messages/messages.entity';


@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Message, message => message.thread)
  messages: Message[];
}

