import { ApiProperty } from '@nestjs/swagger';
import { EventName } from '@probation-app/probation-api-client';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { CampaignReportEntity } from '../campaign-report.entity';

export class CampaignReportsAggregateRequest {
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

  @IsEnum(EventName)
  @IsNotEmpty()
  @Expose({ name: 'event_name' })
  @ApiProperty({ enum: () => EventName })
  public eventName: CampaignReportEntity['eventName'];
}
