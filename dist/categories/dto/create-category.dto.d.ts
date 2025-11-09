export declare class CategoryFieldDto {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options: string[];
    required: boolean;
}
export declare class CreateCategoryDto {
    name: string;
    iconUrl: string | null;
    fields: CategoryFieldDto[];
    parentId?: string | null;
}
