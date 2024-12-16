import { Test, TestingModule } from '@nestjs/testing';
import { EventName, ProbationApiClient, ReportsResponse } from '@probation-app/probation-api-client';
import { DateTime } from 'luxon';
import { of, throwError } from 'rxjs';
import { PaginationQuery } from '../../../core/resources/pagination.query';
import { CampaignReportEntity } from '../campaign-report.entity';
import { CampaignReportRepository } from '../campaign-report.repository';
import { CampaignReportsService } from '../campaign-reports.service';

describe('CampaignReportsService', () => {
  let service: CampaignReportsService;
  let probationApiClient: jest.Mocked<ProbationApiClient>;
  let repository: jest.Mocked<CampaignReportRepository>;

  beforeEach(async () => {
    probationApiClient = {
      getReports: jest.fn(),
      getByUrl: jest.fn(),
    } as any;

    repository = {
      createFromCsv: jest.fn(),
      insertIgnore: jest.fn(),
      aggregateByAdId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignReportsService,
        { provide: ProbationApiClient, useValue: probationApiClient },
        { provide: CampaignReportRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<CampaignReportsService>(CampaignReportsService);
  });

  describe('fetchAndSave', () => {
    it('should fetch reports, parse csv, create entities and insert them', (done) => {
      const mockResponse: ReportsResponse = {
        timestamp: DateTime.now().toMillis(),
        data: {
          csv: 'ad,ad_id,adgroup,adgroup_id,campaign,campaign_id,client_id,event_name,event_time\\nad-3fWHyj,4a58620a-6364-49e9-8a3d-770254f2ba30,ad-group-9XLYNo,d6bfa19b-d545-4cc1-8d8b-1e95e19e69ac,campaign-iFVWZu,839cbecb-7b2f-4ba4-b379-7088b38cea03,18412637-a5d6-447c-8548-569b562fbac4,install,2024-12-01 12:00:00\\nad-pEKcRY,5d941760-25d6-4687-b1af-669ae6a68abe,ad-group-bPVQoa,2204e704-63e1-4d6f-b561-030c2f03bd19,campaign-iFVWZu,839cbecb-7b2f-4ba4-b379-7088b38cea03,21635433-0c34-44f8-8ea5-95a707d8cb07,install,2024-12-01 12:00:00',
        },
      };
      probationApiClient.getReports.mockReturnValue(of(mockResponse));

      const mockEntities: CampaignReportEntity[] = [
        {
          id: 'test-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          ad: 'ad-3fWHyj',
          adId: '4a58620a-6364-49e9-8a3d-770254f2ba30',
          adGroup: 'ad-group-9XLYNo',
          adGroupId: 'd6bfa19b-d545-4cc1-8d8b-1e95e19e69ac',
          campaign: 'campaign-iFVWZu',
          campaignId: '839cbecb-7b2f-4ba4-b379-7088b38cea03',
          clientId: '18412637-a5d6-447c-8548-569b562fbac4',
          eventName: EventName.Install,
          eventTime: new Date('2024-12-01T12:00:00Z'),
        },
        {
          id: 'test-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          ad: 'ad-pEKcRY',
          adId: '5d941760-25d6-4687-b1af-669ae6a68abe',
          adGroup: 'ad-group-bPVQoa',
          adGroupId: '2204e704-63e1-4d6f-b561-030c2f03bd19',
          campaign: 'campaign-iFVWZu',
          campaignId: '839cbecb-7b2f-4ba4-b379-7088b38cea03',
          clientId: '21635433-0c34-44f8-8ea5-95a707d8cb07',
          eventName: EventName.Install,
          eventTime: new Date('2024-12-01T12:00:00Z'),
        },
      ];

      repository.createFromCsv.mockReturnValue(mockEntities);

      repository.insertIgnore.mockResolvedValue({ identifiers: [{ id: 1 }] } as any);

      service.fetchAndSave().subscribe({
        next: (insertResult) => {
          expect(probationApiClient.getReports).toHaveBeenCalled();
          expect(repository.createFromCsv).toHaveBeenCalledWith(expect.any(Array));
          expect(repository.insertIgnore).toHaveBeenCalledWith(mockEntities);
          expect(insertResult.identifiers.length).toBe(1);
        },
        complete: () => {
          done();
        },
      });
    });

    it('should handle fetch errors and throw', (done) => {
      probationApiClient.getReports.mockReturnValue(throwError(() => new Error('API error')));

      service.fetchAndSave().subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('API error');
          done();
        },
      });
    });

    it('should handle insert errors and throw after retries', (done) => {
      const mockResponse: ReportsResponse = {
        timestamp: DateTime.now().toMillis(),
        data: {
          csv: 'ad,ad_id,adgroup,adgroup_id,campaign,campaign_id,client_id,event_name,event_time\\nad-3fWHyj,4a58620a-6364-49e9-8a3d-770254f2ba30,ad-group-9XLYNo,d6bfa19b-d545-4cc1-8d8b-1e95e19e69ac,campaign-iFVWZu,839cbecb-7b2f-4ba4-b379-7088b38cea03,18412637-a5d6-447c-8548-569b562fbac4,install,2024-12-01 12:00:00\\nad-pEKcRY,5d941760-25d6-4687-b1af-669ae6a68abe,ad-group-bPVQoa,2204e704-63e1-4d6f-b561-030c2f03bd19,campaign-iFVWZu,839cbecb-7b2f-4ba4-b379-7088b38cea03,21635433-0c34-44f8-8ea5-95a707d8cb07,install,2024-12-01 12:00:00',
        },
      };
      probationApiClient.getReports.mockReturnValue(of(mockResponse));
      repository.createFromCsv.mockReturnValue([{ adId: 'ad123' } as any]);

      repository.insertIgnore.mockRejectedValue(new Error('DB error'));

      service.fetchAndSave().subscribe({
        error: (err) => {
          expect(err.message).toBe('DB error');
          done();
        },
      });
    });
  });

  describe('getAggregatedData', () => {
    it('should return aggregated data', (done) => {
      const fromDate = new Date('2024-12-16T00:00:00Z');
      const toDate = new Date('2024-12-16T23:59:59Z');
      const pagination: PaginationQuery = new PaginationQuery();

      const mockItems = [
        { adId: 'ad123', date: new Date('2024-12-16T10:00:00Z'), eventCount: 5 },
        { adId: 'ad456', date: new Date('2024-12-16T11:00:00Z'), eventCount: 3 },
      ];
      const mockTotal = 2;
      repository.aggregateByAdId.mockResolvedValue([mockItems, mockTotal]);

      service.getAggregatedData(fromDate, toDate, EventName.Install, pagination).subscribe((result) => {
        expect(repository.aggregateByAdId).toHaveBeenCalledWith(fromDate, toDate, EventName.Install, pagination);
        expect(result.items).toEqual(mockItems);
        expect(result.total).toBe(mockTotal);
        done();
      });
    });

    it('should handle empty results', (done) => {
      const fromDate = new Date('2024-12-16T00:00:00Z');
      const toDate = new Date('2024-12-16T23:59:59Z');
      const pagination: PaginationQuery = new PaginationQuery();

      repository.aggregateByAdId.mockResolvedValue([[], 0]);

      service.getAggregatedData(fromDate, toDate, EventName.Install, pagination).subscribe((result) => {
        expect(result.items).toEqual([]);
        expect(result.total).toBe(0);
        done();
      });
    });
  });
});
