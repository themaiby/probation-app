import { Test, TestingModule } from '@nestjs/testing';
import { EventName } from '@probation-app/probation-api-client';
import { DataSource, InsertResult } from 'typeorm';
import { PaginationQuery } from '../../../core/resources/pagination.query';
import { CampaignReportEntity } from '../campaign-report.entity';
import { CampaignReportRepository } from '../campaign-report.repository';
import { CampaignRecordCsvItem } from '../types/campaign-record-csv-item.interface';

describe('CampaignReportRepository', () => {
  let repository: CampaignReportRepository;
  let dataSource: jest.Mocked<DataSource>;

  let queryBuilder: any;

  beforeEach(async () => {
    const mockMetadata = {
      columns: [],
      relations: [],
      primaryColumns: [],
      target: CampaignReportEntity,
    };

    const mockConnection = {
      getMetadata: jest.fn().mockReturnValue(mockMetadata),
    };

    const mockEntityManager = {
      create: jest.fn((target, entities) => entities),
      connection: mockConnection,
    };

    queryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(),

      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      clone: jest.fn().mockReturnThis(),
      cache: jest.fn().mockReturnThis(),
      create: jest.fn().mockReturnThis(),
    };

    dataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: DataSource, useValue: dataSource }, CampaignReportRepository],
    }).compile();

    repository = module.get<CampaignReportRepository>(CampaignReportRepository);
  });

  describe('createFromCsv', () => {
    it('should create entities from an array of CSV items', () => {
      const csvItems: CampaignRecordCsvItem[] = [
        {
          ad: 'ad',
          ad_id: 'ad-123',
          adgroup: 'adgroup',
          adgroup_id: 'adgroup-123',
          campaign: 'campaign',
          campaign_id: 'campaign-123',
          client_id: 'client-123',
          event_name: EventName.Install,
          event_time: '2024-12-01T12:00:00Z',
        },
        {
          ad: 'ad2',
          ad_id: 'ad-456',
          adgroup: 'adgroup2',
          adgroup_id: 'adgroup-456',
          campaign: 'campaign2',
          campaign_id: 'campaign-456',
          client_id: 'client-456',
          event_name: EventName.Purchase,
          event_time: '2024-12-02T12:00:00Z',
        },
      ];

      const createSpy = jest.spyOn(repository, 'create');
      createSpy.mockImplementation((entities) => entities as any);

      const result = repository.createFromCsv(csvItems);

      expect(result.length).toBe(2);
      expect(result[0]).toMatchObject({
        adId: 'ad-123',
        eventName: EventName.Install,
      });
      expect(result[1]).toMatchObject({
        adId: 'ad-456',
        eventName: EventName.Purchase,
      });
    });

    it('should create a single entity from a single CSV item', () => {
      const csvItem: CampaignRecordCsvItem[] = [
        {
          ad: 'ad',
          ad_id: 'ad-123',
          adgroup: 'adgroup',
          adgroup_id: 'adgroup-123',
          campaign: 'campaign',
          campaign_id: 'campaign-123',
          client_id: 'client-123',
          event_name: EventName.Install,
          event_time: '2024-12-01T12:00:00Z',
        },
      ];

      const result = repository.createFromCsv(csvItem);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({
        adId: 'ad-123',
        eventName: EventName.Install,
      });
    });
  });

  describe('insertIgnore', () => {
    it('should insert entities with OR IGNORE clause', async () => {
      const entities: CampaignReportEntity[] = [
        {
          id: 'test',
          ad: 'ad-1',
        } as any,
      ];

      const mockInsertResult: InsertResult = { identifiers: [{ id: 1 }] } as any;
      queryBuilder.execute.mockResolvedValue(mockInsertResult);

      const result = await repository.insertIgnore(entities);
      expect(dataSource.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.insert).toHaveBeenCalled();
      expect(queryBuilder.into).toHaveBeenCalledWith(CampaignReportEntity);
      expect(queryBuilder.values).toHaveBeenCalledWith(entities);
      expect(queryBuilder.orIgnore).toHaveBeenCalled();
      expect(result).toBe(mockInsertResult);
    });
  });

  describe('aggregateByAdId', () => {
    it('should return aggregated data and total count', async () => {
      const fromDate = new Date('2024-12-16T00:00:00Z');
      const toDate = new Date('2024-12-16T23:59:59Z');
      const pagination = new PaginationQuery();

      const mockItems = [
        { adId: 'ad123', date: new Date('2024-12-16T10:00:00Z'), eventCount: 5 },
        { adId: 'ad456', date: new Date('2024-12-16T11:00:00Z'), eventCount: 3 },
      ];

      queryBuilder.getRawMany
        .mockResolvedValueOnce(mockItems) // call for items
        .mockResolvedValueOnce(mockItems); // call for total (cloned)

      const [items, total] = await repository.aggregateByAdId(fromDate, toDate, EventName.Install, pagination);
      expect(dataSource.createQueryBuilder).toHaveBeenCalledWith(CampaignReportEntity, 'cr');
      expect(queryBuilder.select).toHaveBeenCalledWith('cr.ad_id', 'adId');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('ad_id', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('date', 'ASC');
      expect(queryBuilder.offset).toHaveBeenCalledWith(0);
      expect(queryBuilder.limit).toHaveBeenCalledWith(1);

      expect(items).toEqual(mockItems);
      expect(total).toBe(mockItems.length);
    });

    it('should return empty results and zero total', async () => {
      const fromDate = new Date('2024-12-16T00:00:00Z');
      const toDate = new Date('2024-12-16T23:59:59Z');
      const pagination = new PaginationQuery();

      queryBuilder.getRawMany
        .mockResolvedValueOnce([]) // items
        .mockResolvedValueOnce([]); // total

      const [items, total] = await repository.aggregateByAdId(fromDate, toDate, EventName.Install, pagination);
      expect(items).toEqual([]);
      expect(total).toBe(0);
    });
  });
});
