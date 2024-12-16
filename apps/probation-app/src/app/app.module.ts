import { Module } from '@nestjs/common';
import { CampaignReportsModule } from './campaign-reports/campaign-reports.module';

@Module({
  imports: [CampaignReportsModule],
})
export class AppModule {}
