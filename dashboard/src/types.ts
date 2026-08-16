export type DomainStatus = "pending" | "flagged" | "safe" | "dismissed";

export interface Domain {
  id: number;
  url: string;
  risk_score: number;
  report_count: number;
  first_seen: string;
  last_seen: string;
  status: DomainStatus;
}

export interface DomainListResponse {
  items: Domain[];
  total: number;
  page: number;
  per_page: number;
}

export interface DayStats {
  date: string;
  count: number;
}
