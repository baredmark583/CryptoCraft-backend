import { BaseEntity } from '../../database/base.entity';
export declare class Icon extends BaseEntity {
    name: string;
    svgContent: string;
    width: number;
    height: number;
}
