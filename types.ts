export interface RevenueEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  amount: number;
  note: string;
}

export interface AppState {
  targetAmount: number;
  entries: RevenueEntry[];
}

export interface DayData {
  date: string;
  value: number;
  count: number;
}