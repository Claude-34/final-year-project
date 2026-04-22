import { create } from 'zustand';

import { listReports } from '@/features/reports/reports.service';

import type { PotholeReport } from '@/types/pothole';

type ReportsState = {
  cached: PotholeReport[];
  refreshLocal: () => Promise<void>;
};

export const useReportsStore = create<ReportsState>((set) => ({
  cached: [],
  refreshLocal: async () => {
    const cached = await listReports();
    set({ cached });
  },
}));
