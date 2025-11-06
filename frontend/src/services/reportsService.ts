import apiClient from './api';
import type {
  SalesReport,
  DailySalesReport,
  MonthlySalesReport,
  YearlySalesReport,
  UserSalesReport,
} from '@/types';

export const reportsService = {
  async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReport> {
    const response = await apiClient.get<SalesReport>('/reports/sales', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getDailySalesReport(startDate?: string, endDate?: string): Promise<DailySalesReport[]> {
    const response = await apiClient.get<DailySalesReport[]>('/reports/sales/daily', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getMonthlySalesReport(year?: number): Promise<MonthlySalesReport[]> {
    const response = await apiClient.get<MonthlySalesReport[]>('/reports/sales/monthly', {
      params: { year },
    });
    return response.data;
  },

  async getYearlySalesReport(): Promise<YearlySalesReport[]> {
    const response = await apiClient.get<YearlySalesReport[]>('/reports/sales/yearly');
    return response.data;
  },

  async getSalesByUser(startDate?: string, endDate?: string): Promise<UserSalesReport[]> {
    const response = await apiClient.get<UserSalesReport[]>('/reports/sales/by-user', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
