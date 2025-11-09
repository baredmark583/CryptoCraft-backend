import { BaseEntity } from '../../database/base.entity';
export interface CategoryField {
    id?: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    required?: boolean;
    options?: string[];
}
export declare class Category extends BaseEntity {
    name: string;
    iconUrl: string;
    fields: CategoryField[];
    parentId: string;
    parent: Category;
    subcategories: Category[];
}
