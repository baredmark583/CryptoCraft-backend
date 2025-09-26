import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

export interface CategoryField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options: string[];
}

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column('jsonb', { default: [] })
  fields: CategoryField[];

  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => Category, category => category.subcategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  subcategories: Category[];
}