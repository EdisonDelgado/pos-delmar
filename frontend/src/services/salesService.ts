import apiClient from './api';
import type { SaleNote, CreateSaleNoteRequest, CheckoutSaleNoteRequest } from '@/types';

interface SalesResponse {
  sales: SaleNote[];
  total: number;
}

export const salesService = {
  async createSaleNote(data: CreateSaleNoteRequest): Promise<SaleNote> {
    const response = await apiClient.post<SaleNote>('/sales', data);
    return response.data;
  },

  async getSales(params?: {
    limit?: number;
    offset?: number;
    paid?: boolean;
    userId?: number;
  }): Promise<SalesResponse> {
    const response = await apiClient.get<SalesResponse>('/sales', { params });
    return response.data;
  },

  async getSaleById(id: number): Promise<SaleNote> {
    const response = await apiClient.get<SaleNote>(`/sales/${id}`);
    return response.data;
  },

  async getPendingSales(): Promise<SaleNote[]> {
    const response = await apiClient.get<SaleNote[]>('/sales/pending');
    return response.data;
  },

  async checkout(id: number, data: CheckoutSaleNoteRequest): Promise<SaleNote> {
    const response = await apiClient.patch<SaleNote>(`/sales/${id}/checkout`, data);
    return response.data;
  },

  async deleteSaleNote(id: number): Promise<void> {
    await apiClient.delete(`/sales/${id}`);
  },

  async getSalesCount(paid?: boolean): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/sales/stats/count', {
      params: { paid },
    });
    return response.data;
  },

  async getTotalSalesAmount(params?: {
    paid?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<{ totalAmount: number }> {
    const response = await apiClient.get<{ totalAmount: number }>('/sales/stats/total-amount', {
      params,
    });
    return response.data;
  },
};
