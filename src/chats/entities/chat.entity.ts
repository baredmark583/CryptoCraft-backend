import { Entity, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat extends BaseEntity {
  @ManyToMany(() => User, (user) => user.chats, { eager: true })
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];
}
