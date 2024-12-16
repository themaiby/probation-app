import { Injectable } from '@nestjs/common';
import { EventName } from '@probation-app/probation-api-client';
import { Duration } from 'luxon';
import { DataSource, InsertResult, Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { PaginationQuery } from '../../core/resources/pagination.query';
import { CampaignReportEntity } from './campaign-report.entity';
import { CampaignRecordCsvItem } from './types/campaign-record-csv-item.interface';

type AggregatedReportItem = { adId: string; date: Date; eventCount: number };

@Injectable()
export class CampaignReportRepository extends Repository<CampaignReportEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(CampaignReportEntity, dataSource.createEntityManager());
  }

  public createFromCsv(report: CampaignRecordCsvItem[]): CampaignReportEntity[];
  public createFromCsv(
    report: CampaignRecordCsvItem | CampaignRecordCsvItem[],
  ): CampaignReportEntity | CampaignReportEntity[] {
    const mapItem = (item: CampaignRecordCsvItem): DeepPartial<CampaignReportEntity> => ({
      ad: item.ad,
      adId: item.ad_id,
      adGroup: item.adgroup,
      adGroupId: item.adgroup_id,
      campaign: item.campaign,
      campaignId: item.campaign_id,
      clientId: item.client_id,
      eventName: item.event_name,
      eventTime: item.event_time,
    });

    if (Array.isArray(report)) {
      return super.create(super.create(report.map(mapItem)));
    }

    return super.create([mapItem(report)]);
  }

  public insertIgnore(entities: CampaignReportEntity[]): Promise<InsertResult> {
    return this.dataSource
      .createQueryBuilder()
      .insert()
      .into(CampaignReportEntity)
      .values(entities)
      .orIgnore()
      .execute();
  }

  public aggregateByAdId(
    fromDate: Date,
    toDate: Date,
    eventName: EventName,
    pagination: PaginationQuery,
  ): Promise<[AggregatedReportItem[], number]> {
    const baseQuery = this.dataSource
      .createQueryBuilder(CampaignReportEntity, 'cr')
      .select('cr.ad_id', 'adId')
      .addSelect('cr.event_time', 'date')
      .addSelect('COUNT(*)', 'eventCount')
      .where('cr.event_time BETWEEN :fromDate AND :toDate', { fromDate, toDate })
      .andWhere('cr.event_name = :eventName', { eventName })
      .groupBy('cr.adId')
      .addGroupBy('cr.event_time');

    const total = baseQuery
      .clone()
      .cache(Duration.fromObject({ seconds: 60 }).as('millisecond'))
      .getRawMany()
      .then((rows) => rows.length);

    const items = baseQuery
      .orderBy('ad_id', 'ASC')
      .addOrderBy('date', 'ASC')
      .offset(pagination.getOffset())
      .limit(pagination.limit)
      .getRawMany<AggregatedReportItem>();

    return Promise.all([items, total]);
  }
}
