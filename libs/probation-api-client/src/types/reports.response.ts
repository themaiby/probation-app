export interface ReportsResponse {
  timestamp: number;
  data: {
    csv: string;
    pagination?: { next: string };
  };
}
