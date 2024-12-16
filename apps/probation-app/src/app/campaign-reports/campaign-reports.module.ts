import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ProbationApiClientModule } from '@probation-app/probation-api-client';
import { probationApiConfig } from '../../core/config/probation-api.config';
import { SimpleLockModule } from '../../core/redlock/simple-lock.module';
import { CampaignReportRepository } from './campaign-report.repository';
import { CampaignReportsController } from './campaign-reports.controller';
import { CampaignReportsCron } from './campaign-reports.cron';
import { CampaignReportsService } from './campaign-reports.service';

@Module({
  imports: [
    ProbationApiClientModule.forFeatureAsync({
      inject: [probationApiConfig.KEY],
      useFactory: (apiConf: ConfigType<typeof probationApiConfig>) => apiConf,
    }),
    SimpleLockModule,
  ],
  controllers: [CampaignReportsController],
  providers: [CampaignReportsService, CampaignReportsCron, CampaignReportRepository],
})
export class CampaignReportsModule {}
