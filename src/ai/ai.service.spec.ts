import type { ConfigService } from '@nestjs/config';
import type { CategoriesService } from '../categories/categories.service';
import { AiService } from './ai.service';
import type { SellerAnalytics, ImportedListingData, GeneratedListing } from '../types';
import type { AiProviderResult } from './ai.types';
import type { GeminiProvider } from './providers/gemini.provider';
import type { DeepSeekProvider } from './providers/deepseek.provider';

jest.mock('sharp', () => {
  const factory = jest.fn(() => ({
    rotate: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('resized-image')),
  }));
  return {
    __esModule: true,
    default: factory,
  };
});

type ProviderMock = {
  name: 'gemini' | 'deepseek';
  generateListingDetails: jest.Mock<Promise<AiProviderResult<GeneratedListing>>, any>;
  editImage: jest.Mock<Promise<AiProviderResult<{ base64Image: string }>>, any>;
  analyzeDocumentForVerification: jest.Mock<Promise<AiProviderResult<any>>, any>;
  getAnalyticsInsights: jest.Mock<Promise<AiProviderResult<any>>, any>;
  generateDashboardFocus: jest.Mock<Promise<AiProviderResult<any>>, any>;
  processImportedHtml: jest.Mock<Promise<AiProviderResult<ImportedListingData>>, any>;
  generateCategoryStructure: jest.Mock<Promise<AiProviderResult<any>>, any>;
  generateSubcategories: jest.Mock<Promise<AiProviderResult<any>>, any>;
};

const baseAnalytics: SellerAnalytics = {
  profileVisits: 10,
  totalProductViews: 120,
  totalSales: 4,
  conversionRate: 3.3,
  salesOverTime: [],
  viewsOverTime: [],
  topProducts: [],
  trafficSources: [],
};

const baseListing: GeneratedListing = {
  title: 'AI Draft',
  description: 'desc',
  price: 10,
  category: 'Test',
  dynamicAttributes: {},
};

const baseImportedListing: ImportedListingData = {
  ...baseListing,
  imageUrls: [],
  originalPrice: 100,
  originalCurrency: 'UAH',
  saleType: 'FIXED_PRICE',
  giftWrapAvailable: false,
};

const providerResult = <T>(data: T): AiProviderResult<T> => ({
  data,
  usage: { totalTokens: 42 },
});

const createProviderMock = (name: 'gemini' | 'deepseek'): ProviderMock => ({
  name,
  generateListingDetails: jest.fn().mockResolvedValue(providerResult(baseListing)),
  editImage: jest.fn().mockResolvedValue(providerResult({ base64Image: 'edited' })),
  analyzeDocumentForVerification: jest.fn().mockResolvedValue(providerResult({ isDocument: true })),
  getAnalyticsInsights: jest.fn().mockResolvedValue(providerResult([{ title: 't', recommendation: 'r', type: 'OPTIMIZATION' }])),
  generateDashboardFocus: jest.fn().mockResolvedValue(providerResult({ title: 'Focus', reason: 'Because', ctaText: 'Go', ctaLink: 'sales' })),
  processImportedHtml: jest.fn().mockImplementation(async () => providerResult(baseImportedListing)),
  generateCategoryStructure: jest.fn().mockResolvedValue(providerResult([])),
  generateSubcategories: jest.fn().mockResolvedValue(providerResult([{ name: 'Sub', fields: [], subcategories: [] }])),
});

const createConfigService = (overrides: Record<string, string> = {}): ConfigService => {
  const defaults: Record<string, string> = {
    AI_PROVIDER_TEXT: 'deepseek',
    AI_PROVIDER_VISION: 'gemini',
    AI_PROVIDER_IMAGE_EDIT: 'gemini',
    AI_MAX_IMAGE_MB: '1',
    AI_MAX_IMAGE_DIMENSION: '1024',
    AI_IMAGE_JPEG_QUALITY: '80',
    AI_MAX_HTML_CHARS: '5000',
  };
  return {
    get: jest.fn((key: string) => overrides[key] ?? defaults[key]),
  } as unknown as ConfigService;
};

describe('AiService', () => {
  let categoriesService: CategoriesService;
  let gemini: ProviderMock;
  let deepseek: ProviderMock;

  beforeEach(() => {
    jest.clearAllMocks();
    categoriesService = {
      batchCreateSubcategories: jest.fn(),
    } as unknown as CategoriesService;
    gemini = createProviderMock('gemini');
    deepseek = createProviderMock('deepseek');
  });

  it('routes text scenarios through DeepSeek and returns meta metrics', async () => {
    const config = createConfigService();
    const service = new AiService(
      config,
      categoriesService,
      gemini as unknown as GeminiProvider,
      deepseek as unknown as DeepSeekProvider,
    );

    const response = await service.getAnalyticsInsights(baseAnalytics);

    expect(deepseek.getAnalyticsInsights).toHaveBeenCalledTimes(1);
    expect(response.meta.provider).toBe('deepseek');
    expect(response.meta.scenario).toBe('text');
    expect(response.meta.usage?.totalTokens).toBe(42);
  });

  it('truncates oversized HTML payloads and records warnings', async () => {
    const config = createConfigService({ AI_MAX_HTML_CHARS: '10' });
    const service = new AiService(
      config,
      categoriesService,
      gemini as unknown as GeminiProvider,
      deepseek as unknown as DeepSeekProvider,
    );

    const longHtml = '<div>' + 'x'.repeat(100) + '</div>';
    const response = await service.processImportedHtml(longHtml);

    expect(response.meta.warnings).toContain('HTML_TRUNCATED');
    expect(deepseek.processImportedHtml).toHaveBeenCalledTimes(1);
    const passedPayload = (deepseek.processImportedHtml as jest.Mock).mock.calls[0][0];
    expect(passedPayload.length).toBeLessThanOrEqual(10);
  });

  it('downscales oversized images before generation and surfaces warning meta', async () => {
    const config = createConfigService({ AI_MAX_IMAGE_MB: '0.0001' });
    const service = new AiService(
      config,
      categoriesService,
      gemini as unknown as GeminiProvider,
      deepseek as unknown as DeepSeekProvider,
    );

    const largeBuffer = Buffer.alloc(1024, 1);
    const base64Image = largeBuffer.toString('base64');

    const response = await service.generateListingDetails(base64Image, 'test');

    const mockedSharp = jest.requireMock('sharp').default as jest.Mock;
    expect(mockedSharp).toHaveBeenCalled();
    expect(response.meta.warnings).toContain('IMAGE_RESIZED');
    expect(gemini.generateListingDetails).toHaveBeenCalledTimes(1);
    const passedBase64 = (gemini.generateListingDetails as jest.Mock).mock.calls[0][0];
    expect(passedBase64).toBe(Buffer.from('resized-image').toString('base64'));
  });
});
