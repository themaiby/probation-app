import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import { CampaignReportEntity } from '../campaign-report.entity';

export class CampaignReportsTriggerFetchQuery {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Expose({ name: 'from_date' })
  @ApiProperty({ type: 'string', format: 'date-time' })
  public fromDate: CampaignReportEntity['eventTime'];

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Expose({ name: 'to_date' })
  @ApiProperty({ type: 'string', format: 'date-time' })
  public toDate: CampaignReportEntity['eventTime'];
}
