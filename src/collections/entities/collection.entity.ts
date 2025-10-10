import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('collections')
export class Collection extends BaseEntity {
  @ManyToOne(() => User, (user) => user.collections, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable()
  products: Product[];
}