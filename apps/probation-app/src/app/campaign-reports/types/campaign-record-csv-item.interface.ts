import { EventName } from '@probation-app/probation-api-client';

export interface CampaignRecordCsvItem {
  ad: string;
  ad_id: string;
  adgroup: string;
  adgroup_id: string;
  campaign: string;
  campaign_id: string;
  client_id: string;
  event_name: EventName;
  event_time: string;
}
