import { create } from 'zustand';

interface DashboardStats {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalKnowledgeBases: number;
  weeklyActiveSessions: number;
  monthlyActiveUsers: number;
}

interface AdminStore {
  selectedMenu: string;
  dashboardStats: DashboardStats | null;
  setSelectedMenu: (menu: string) => void;
  setDashboardStats: (stats: DashboardStats) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  selectedMenu: 'dashboard',
  dashboardStats: null,
  setSelectedMenu: (menu) => set({ selectedMenu: menu }),
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
}));
