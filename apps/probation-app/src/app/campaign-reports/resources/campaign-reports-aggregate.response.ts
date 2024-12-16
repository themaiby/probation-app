import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsNumber, IsUUID } from 'class-validator';
import { CampaignReportEntity } from '../campaign-report.entity';

export class CampaignReportsAggregateResponse {
  @IsUUID()
  @Expose()
  @ApiProperty({ type: 'string', format: 'uuid' })
  public adId: CampaignReportEntity['adId'];

  @IsDate()
  @Type(() => Date)
  @Expose()
  @ApiProperty({ type: 'string', format: 'date-time' })
  public date: Date;

  @IsNumber()
  @Expose()
  @ApiProperty({ type: 'number' })
  public eventCount: number;
}
