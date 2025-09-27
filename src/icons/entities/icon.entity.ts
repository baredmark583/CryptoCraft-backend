import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

@Entity('icons')
export class Icon extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column('text')
  svgContent: string;

  @Column({ type: 'int', default: 24 })
  width: number;

  @Column({ type: 'int', default: 24 })
  height: number;
}