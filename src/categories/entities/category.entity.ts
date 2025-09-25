import { Entity, Column } from 'typeorm';
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
  iconId: string;

  @Column('jsonb', { default: [] })
  fields: CategoryField[];
}
