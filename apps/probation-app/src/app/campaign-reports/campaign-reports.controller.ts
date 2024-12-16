import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { map } from 'rxjs';
import { PaginationQuery } from '../../core/resources/pagination.query';
import { ResponseWrapper } from '../../core/response-wrapper.util';
import { ApiOkObjectResponse, ApiOkPaginationResponse } from '../../core/utils/swagger.decorators';
import { CampaignReportsService } from './campaign-reports.service';
import { CampaignReportsAggregateRequest } from './resources/campaign-reports-aggregate.request';
import { CampaignReportsAggregateResponse } from './resources/campaign-reports-aggregate.response';
import { CampaignReportsTriggerFetchQuery } from './resources/campaign-reports-trigger-fetch.query';
import { CampaignReportsTriggerFetchResponse } from './resources/campaign-reports-trigger-fetch.response';

@Controller({ path: 'campaign-reports' })
@ApiTags('campaign-reports')
export class CampaignReportsController {
  public constructor(private readonly service: CampaignReportsService) {}

  @Get()
  @ApiOkPaginationResponse(CampaignReportsAggregateResponse)
  public getAggregated(@Query() query: CampaignReportsAggregateRequest, @Query() pagination: PaginationQuery) {
    return this.service.getAggregatedData(query.fromDate, query.toDate, query.eventName, pagination).pipe(
      map((result) => {
        return ResponseWrapper.pagination(CampaignReportsAggregateResponse, result.items, result.total, pagination);
      }),
    );
  }

  @Post('actions/trigger-fetch')
  @ApiOkObjectResponse(CampaignReportsTriggerFetchResponse)
  public triggerFetch(@Body() query: CampaignReportsTriggerFetchQuery) {
    return this.service.fetchAndSave(DateTime.fromJSDate(query.fromDate), DateTime.fromJSDate(query.toDate)).pipe(
      map((result) => {
        return ResponseWrapper.object(CampaignReportsTriggerFetchResponse, { processed: result.identifiers.length });
      }),
    );
  }
}
