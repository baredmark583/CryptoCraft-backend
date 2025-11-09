import { BaseEntity } from '../../database/base.entity';
export declare class SettingAudit extends BaseEntity {
    key: string;
    oldValue?: string;
    newValue: string;
    updatedBy?: string;
}
