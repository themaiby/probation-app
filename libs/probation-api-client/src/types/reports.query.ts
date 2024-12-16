import { EventName } from './event-name.enum';

export interface ReportsQuery {
  from_date: Date;
  to_date: Date;
  event_name: EventName;
  take?: number;
}
