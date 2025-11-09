import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare class Chat extends BaseEntity {
    participants: User[];
    messages: Message[];
}
