import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

@Entity('icons')
export class Icon extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column('text')
  svgContent: string;
}
