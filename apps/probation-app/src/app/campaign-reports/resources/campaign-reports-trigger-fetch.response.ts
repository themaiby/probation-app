import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CampaignReportsTriggerFetchResponse {
  @IsNumber()
  @Expose()
  @ApiProperty({ type: 'number', description: 'Count of processed campaign reports (inserted and skipped)' })
  public readonly processed: number;
}
