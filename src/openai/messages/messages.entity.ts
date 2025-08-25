// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
// import { Role } from '../enum';
// import { Thread } from '../threads/thread.entity';


// @Entity()
// export class Message {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ type: 'enum', enum: Role })
//   role: Role;

//   @Column('text')
//   content: string;

//   @ManyToOne(() => Thread, (thread) => thread.messages, { onDelete: 'CASCADE' })
//   thread: Thread;

//   @CreateDateColumn()
//   createdAt: Date;
// }



import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Role } from '../enum';
import { Thread } from '../threads/thread.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column('text')
  content: string;

  @ManyToOne(() => Thread, (thread) => thread.messages, { onDelete: 'CASCADE' })
  thread: Thread;

  @CreateDateColumn()
  createdAt: Date;
}
