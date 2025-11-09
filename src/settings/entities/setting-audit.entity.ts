import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

@Entity('setting_audit')
export class SettingAudit extends BaseEntity {
  @Column()
  key: string;

  @Column('text', { nullable: true })
  oldValue?: string;

  @Column('text')
  newValue: string;

  @Column({ nullable: true })
  updatedBy?: string;
}
