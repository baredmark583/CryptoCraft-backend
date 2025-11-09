export interface CategoryField {
    id?: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    required?: boolean;
    options?: string[];
}
export interface CategoryFieldWithMeta extends CategoryField {
    inherited?: boolean;
    sourceCategoryId?: string | null;
    sourceCategoryName?: string;
}
export interface CategorySchema {
    id?: string;
    name: string;
    fields: CategoryField[];
    iconUrl?: string | null;
    parentId?: string | null;
    subcategories?: CategorySchema[];
    resolvedFields?: CategoryFieldWithMeta[];
}
export declare const CATEGORIES_FOR_AI: CategorySchema[];
export declare const getCategoryNames: () => string[];
