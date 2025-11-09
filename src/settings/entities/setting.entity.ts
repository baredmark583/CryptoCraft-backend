import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn()
  key: string;

  @Column('text')
  value: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
