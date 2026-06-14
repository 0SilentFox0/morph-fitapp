/** Business analytics chart models. */

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface IncomeOverTimeData {
  labels: string[];
  datasets: { data: number[] }[];
}

export interface RevenueBySourceData {
  subscriptions: number;
  trainings: number;
}

export interface AnalyticsData {
  totalEarningsPerMonth: number;
  fromSubscriptions: number;
  fromTrainings: number;
  incomeOverTime: IncomeOverTimeData;
  revenueBySource: RevenueBySourceData;
}
