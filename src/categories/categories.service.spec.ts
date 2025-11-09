import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  const categoryRepository = {
    find: jest.fn(),
  };
  const dataSource = {} as any;
  let service: CategoriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(categoryRepository as any, dataSource);
  });

  it('resolves inherited fields with metadata for a given category', async () => {
    const parent: Partial<Category> = {
      id: 'parent',
      name: 'Parent',
      fields: [
        { name: 'brand', label: 'Brand', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: false },
      ],
    };
    const child: Partial<Category> = {
      id: 'child',
      name: 'Child',
      parentId: 'parent',
      fields: [{ name: 'condition', label: 'Condition', type: 'select', options: ['New'] }],
    };
    categoryRepository.find.mockResolvedValue([parent, child]);

    const result = await service.getResolvedFieldsById('child');

    expect(result).toHaveLength(3);
    const inheritedBrand = result.find((field) => field.name === 'brand');
    expect(inheritedBrand?.inherited).toBe(true);
    expect(inheritedBrand?.sourceCategoryId).toBe('parent');

    const ownField = result.find((field) => field.name === 'condition');
    expect(ownField?.inherited).toBe(false);
  });

  it('normalizes missing field names using slugified labels', () => {
    const rawFields = [
      { label: 'Материал корпуса', type: 'text', required: true },
      { label: ' Цвет ', type: 'text', options: ['  красный ', ' '] },
    ] as any;

    const normalized = (service as any).normalizeFields(rawFields);

    expect(normalized[0].name).toBe('материал_корпуса');
    expect(normalized[1].options).toEqual(['красный']);
  });
});
