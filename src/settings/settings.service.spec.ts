import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  const settingRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };
  const auditRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SettingsService(settingRepository as any, auditRepository as any);
  });

  it('updates settings in batch and records audit entries only when values change', async () => {
    settingRepository.find.mockResolvedValueOnce([
      { key: 'PLATFORM_COMMISSION_PERCENT', value: '2.5' },
    ]);
    settingRepository.find.mockResolvedValueOnce([
      { key: 'PLATFORM_COMMISSION_PERCENT', value: '3.0' },
      { key: 'SITE_MAINTENANCE_MODE', value: 'false' },
    ]);

    await service.updateBatch(
      [
        { key: 'PLATFORM_COMMISSION_PERCENT', value: '3.0' },
        { key: 'SITE_MAINTENANCE_MODE', value: 'false' },
      ],
      'admin-1',
    );

    expect(settingRepository.save).toHaveBeenCalledTimes(2);
    expect(settingRepository.save).toHaveBeenCalledWith({
      key: 'PLATFORM_COMMISSION_PERCENT',
      value: '3.0',
      updatedBy: 'admin-1',
    });
    expect(settingRepository.save).toHaveBeenCalledWith({
      key: 'SITE_MAINTENANCE_MODE',
      value: 'false',
      updatedBy: 'admin-1',
    });

    expect(auditRepository.save).toHaveBeenCalledTimes(2);
    expect(auditRepository.save).toHaveBeenCalledWith({
      key: 'PLATFORM_COMMISSION_PERCENT',
      newValue: '3.0',
      oldValue: '2.5',
      updatedBy: 'admin-1',
    });
    expect(auditRepository.save).toHaveBeenCalledWith({
      key: 'SITE_MAINTENANCE_MODE',
      newValue: 'false',
      oldValue: null,
      updatedBy: 'admin-1',
    });
  });

  it('returns latest audit trail ordered by creation date', async () => {
    const auditEntries = [
      { id: '1', key: 'A', newValue: '1', createdAt: new Date().toISOString() },
    ];
    auditRepository.find.mockResolvedValue(auditEntries);

    const result = await service.getAuditTrail(10);

    expect(auditRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      take: 10,
    });
    expect(result).toEqual(auditEntries);
  });
});
