import { Injectable, Logger } from '@nestjs/common';
import { EventName, ProbationApiClient, ReportsQuery, ReportsResponse } from '@probation-app/probation-api-client';
import { DateTime } from 'luxon';
import { catchError, EMPTY, expand, from, map, mergeMap, Observable, retry, throwError } from 'rxjs';
import { PaginationQuery } from '../../core/resources/pagination.query';
import { csvParser } from '../../core/utils/csv-parser.util';
import { CampaignReportRepository } from './campaign-report.repository';
import { CampaignRecordCsvItem } from './types/campaign-record-csv-item.interface';

type HourWindow = Pick<ReportsQuery, 'from_date' | 'to_date'>;
type AggregatedReportItem = { adId: string; date: Date; eventCount: number };

@Injectable()
export class CampaignReportsService {
  private readonly logger = new Logger(CampaignReportsService.name);

  private readonly take = 50;
  private readonly fetchRetries = 3;
  private readonly insertRetries = 3;
  private readonly concurrentInserts = 5;

  public constructor(
    private readonly probationClient: ProbationApiClient,
    private readonly repository: CampaignReportRepository,
  ) {}

  public fetchAndSave(fromDate: DateTime = null, toDate: DateTime = null) {
    return this.fetchAllTypes(fromDate, toDate).pipe(
      // instantiate CampaignReportEntities from plain csv
      map((value) => {
        const plainObjects = csvParser<CampaignRecordCsvItem>(value.data.csv);
        return this.repository.createFromCsv(plainObjects);
      }),

      // concurrently insert in db
      mergeMap(
        (reportEntities) =>
          from(this.repository.insertIgnore(reportEntities)).pipe(
            retry(this.insertRetries),
            catchError((err) => {
              this.logger.error({ msg: 'Failed to process batch after retries' }, err);

              return throwError(() => err);
            }),
          ),
        this.concurrentInserts,
      ),
    );
  }

  public getAggregatedData(
    fromDate: Date,
    toDate: Date,
    eventName: EventName,
    pagination: PaginationQuery,
  ): Observable<{ total: number; items: AggregatedReportItem[] }> {
    const $result = from(this.repository.aggregateByAdId(fromDate, toDate, eventName, pagination));

    return $result.pipe(map((value) => ({ items: value[0], total: value[1] })));
  }

  private getDateWindow(fromDate: DateTime = null, toDate: DateTime = null): HourWindow {
    if (!fromDate || !toDate) {
      toDate = DateTime.now().endOf('day');
      fromDate = DateTime.now().startOf('day');
    }

    return { from_date: fromDate.toJSDate(), to_date: toDate.toJSDate() };
  }

  private fetchAllTypes(fromDate: DateTime = null, toDate: DateTime = null): Observable<ReportsResponse> {
    const dateWindow = this.getDateWindow(fromDate, toDate);

    this.logger.log({ msg: `Date window - from: ${dateWindow.from_date}, to: ${dateWindow.to_date}` });

    const requests$ = from([
      { ...dateWindow, event_name: EventName.Install, take: this.take },
      { ...dateWindow, event_name: EventName.Purchase, take: this.take },
    ]);

    return requests$.pipe(
      mergeMap((params) =>
        this.probationClient.getReports(params).pipe(
          retry(this.fetchRetries),

          expand((response) => {
            if (response.data.pagination?.next) {
              this.logger.debug({ msg: 'Fetching next page', next: response.data.pagination.next });

              return this.probationClient
                .getByUrl<ReportsResponse>(response.data.pagination.next)
                .pipe(retry(this.fetchRetries));
            }

            this.logger.debug('No more pages to fetch, stream will complete');
            return EMPTY;
          }),

          catchError((error) => {
            this.logger.error({ msg: 'Failed to fetch reports after retries' }, error);

            return throwError(() => error);
          }),
        ),
      ),
    );
  }
}
