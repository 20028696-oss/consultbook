export interface WeeklyVolume {
  week: string; // e.g. "Wk 1"
  count: number;
}

export interface ReportsSummary {
  totalThisMonth: number;
  completionRate: number; // percent
  avgResponseHours: number;
  weeklyVolume: WeeklyVolume[];
  statusBreakdown: { status: string; count: number; color: string }[];
}

export async function getReportsSummary(): Promise<ReportsSummary> {
  return {
    totalThisMonth: 38,
    completionRate: 87,
    avgResponseHours: 4.2,
    weeklyVolume: [
      { week: "Wk 1", count: 6 },
      { week: "Wk 2", count: 9 },
      { week: "Wk 3", count: 11 },
      { week: "Wk 4", count: 12 },
    ],
    statusBreakdown: [
      { status: "Confirmed", count: 24, color: "#1B8C3B" },
      { status: "Pending", count: 3, color: "#9B5F0B" },
      { status: "Completed", count: 8, color: "#0D193C" },
      { status: "Cancelled", count: 3, color: "#C23B3B" },
    ],
  };
}
