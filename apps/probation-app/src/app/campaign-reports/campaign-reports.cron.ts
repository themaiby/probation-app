import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Duration } from 'luxon';
import { catchError, EMPTY, from, reduce, switchMap, tap } from 'rxjs';
import { probationApiConfig } from '../../core/config/probation-api.config';
import { SimpleLockService } from '../../core/redlock/simple-lock.service';
import { CampaignReportsService } from './campaign-reports.service';
import { CampaignRecordJob } from './types/campaign-record-job.enum';

type CronItem = { name: string; cronJob: CronJob };

@Injectable()
export class CampaignReportsCron implements OnModuleInit {
  private readonly logger = new Logger(CampaignReportsCron.name);

  private readonly jobs: CronItem[] = [
    {
      name: CampaignRecordJob.FetchCampaignReports,
      cronJob: new CronJob(this.probationApiConf.cronTab, () => this.fetchReportsTask()),
    },
  ];

  public constructor(
    @Inject(probationApiConfig.KEY) private readonly probationApiConf: ConfigType<typeof probationApiConfig>,
    private readonly service: CampaignReportsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly simpleLockService: SimpleLockService,
  ) {}

  /**
   * Dynamically registers all cronJobs and allow pass config variables from DI container
   */
  public onModuleInit(): void {
    this.jobs.forEach(({ name, cronJob }) => {
      this.schedulerRegistry.addCronJob(name, cronJob);

      cronJob.addCallback(() => this.logger.log({ msg: `Task executed [${name}]` }));
      cronJob.start();
    });
  }

  public fetchReportsTask(): void {
    const lockKey = `locks:${CampaignRecordJob.FetchCampaignReports}`;
    const ttl = Duration.fromObject({ seconds: 30 }).as('millisecond');

    const acquireLock$ = from(this.simpleLockService.acquireLock(lockKey, ttl));

    const handleLock$ = acquireLock$.pipe(
      // lock and process entities
      switchMap((isLocked) => {
        if (!isLocked) {
          this.logger.warn({ msg: 'Task is already locked. Skipping execution.' });
          return EMPTY;
        }

        // start processing if lock available
        return this.service.fetchAndSave().pipe(
          // count processed entities
          reduce((acc, value) => acc + value.identifiers.length, 0),
          tap((count) => this.logger.log({ msg: `Total processed: ${count}` })),

          // release lock
          switchMap(() =>
            from(this.simpleLockService.releaseLock(lockKey)).pipe(
              tap(() => this.logger.log({ msg: 'Lock released successfully' })),
              catchError((err) => {
                this.logger.error({ msg: 'Failed to release lock' }, err);

                return EMPTY;
              }),
            ),
          ),
        );
      }),

      // log any unhandled error
      catchError((err) => {
        this.logger.error({ msg: 'Unexpected error during task execution' }, err);

        return EMPTY;
      }),
    );

    handleLock$.subscribe({ complete: () => this.logger.log({ msg: 'Task completed successfully' }) });
  }
}
