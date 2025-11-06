import { describe, it, expect, beforeEach, vi } from 'vitest';
import reportsReducer, {
  fetchSalesReport,
  fetchDailySalesReport,
  fetchMonthlySalesReport,
  fetchYearlySalesReport,
  fetchSalesByUser,
  clearError,
  clearReports,
} from '../reportsSlice';
import type {
  ReportsState,
  SalesReport,
  DailySalesReport,
  MonthlySalesReport,
  UserSalesReport,
} from '@/types';

// Mock reportsService
vi.mock('@/services/reportsService');

describe('reportsSlice', () => {
  let initialState: ReportsState;

  const mockSalesReport: SalesReport = {
    totalSales: 100,
    totalAmount: 1000000,
    netAmount: 840000,
    vatAmount: 160000,
    averageSale: 10000,
    topProducts: [
      {
        productId: 1,
        productName: 'Test Product',
        totalQuantity: 50,
        totalRevenue: 500000,
      },
    ],
  };

  const mockDailyReport: DailySalesReport[] = [
    {
      date: '2025-01-01',
      sales: 10,
      amount: 100000,
    },
  ];

  const mockMonthlyReport: MonthlySalesReport[] = [
    {
      month: 1,
      year: 2025,
      sales: 100,
      amount: 1000000,
    },
  ];

  const mockUserReport: UserSalesReport[] = [
    {
      userId: 1,
      userName: 'Test User',
      totalSales: 50,
      totalAmount: 500000,
    },
  ];

  beforeEach(() => {
    initialState = {
      salesReport: null,
      dailyReport: [],
      monthlyReport: [],
      yearlyReport: [],
      userReport: [],
      isLoading: false,
      error: null,
    };
    vi.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const stateWithError: ReportsState = {
        ...initialState,
        error: 'Test error',
      };

      const state = reportsReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it('should handle clearReports', () => {
      const stateWithData: ReportsState = {
        ...initialState,
        salesReport: mockSalesReport,
        dailyReport: mockDailyReport,
        monthlyReport: mockMonthlyReport,
        userReport: mockUserReport,
        error: 'Test error',
      };

      const state = reportsReducer(stateWithData, clearReports());

      expect(state.salesReport).toBeNull();
      expect(state.dailyReport).toEqual([]);
      expect(state.monthlyReport).toEqual([]);
      expect(state.yearlyReport).toEqual([]);
      expect(state.userReport).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSalesReport async thunk', () => {
    it('should handle fetchSalesReport.pending', () => {
      const action = { type: fetchSalesReport.pending.type };
      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSalesReport.fulfilled', () => {
      const action = {
        type: fetchSalesReport.fulfilled.type,
        payload: mockSalesReport,
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.salesReport).toEqual(mockSalesReport);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSalesReport.rejected', () => {
      const action = {
        type: fetchSalesReport.rejected.type,
        payload: { message: 'Failed to fetch sales report' },
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch sales report');
    });
  });

  describe('fetchDailySalesReport async thunk', () => {
    it('should handle fetchDailySalesReport.pending', () => {
      const action = { type: fetchDailySalesReport.pending.type };
      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchDailySalesReport.fulfilled', () => {
      const action = {
        type: fetchDailySalesReport.fulfilled.type,
        payload: mockDailyReport,
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.dailyReport).toEqual(mockDailyReport);
      expect(state.error).toBeNull();
    });

    it('should handle fetchDailySalesReport.rejected', () => {
      const action = {
        type: fetchDailySalesReport.rejected.type,
        payload: { message: 'Failed to fetch daily report' },
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch daily report');
    });
  });

  describe('fetchMonthlySalesReport async thunk', () => {
    it('should handle fetchMonthlySalesReport.pending', () => {
      const action = { type: fetchMonthlySalesReport.pending.type };
      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchMonthlySalesReport.fulfilled', () => {
      const action = {
        type: fetchMonthlySalesReport.fulfilled.type,
        payload: mockMonthlyReport,
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.monthlyReport).toEqual(mockMonthlyReport);
      expect(state.error).toBeNull();
    });

    it('should handle fetchMonthlySalesReport.rejected', () => {
      const action = {
        type: fetchMonthlySalesReport.rejected.type,
        payload: { message: 'Failed to fetch monthly report' },
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch monthly report');
    });
  });

  describe('fetchYearlySalesReport async thunk', () => {
    it('should handle fetchYearlySalesReport.pending', () => {
      const action = { type: fetchYearlySalesReport.pending.type };
      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchYearlySalesReport.fulfilled', () => {
      const mockYearlyReport = [
        {
          year: 2025,
          totalSales: 1000,
          totalAmount: 10000000,
        },
      ];

      const action = {
        type: fetchYearlySalesReport.fulfilled.type,
        payload: mockYearlyReport,
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.yearlyReport).toEqual(mockYearlyReport);
      expect(state.error).toBeNull();
    });

    it('should handle fetchYearlySalesReport.rejected', () => {
      const action = {
        type: fetchYearlySalesReport.rejected.type,
        payload: { message: 'Failed to fetch yearly report' },
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch yearly report');
    });
  });

  describe('fetchSalesByUser async thunk', () => {
    it('should handle fetchSalesByUser.pending', () => {
      const action = { type: fetchSalesByUser.pending.type };
      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSalesByUser.fulfilled', () => {
      const action = {
        type: fetchSalesByUser.fulfilled.type,
        payload: mockUserReport,
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.userReport).toEqual(mockUserReport);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSalesByUser.rejected', () => {
      const action = {
        type: fetchSalesByUser.rejected.type,
        payload: { message: 'Failed to fetch user sales report' },
      };

      const state = reportsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch user sales report');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple daily reports', () => {
      const multipleDailyReports: DailySalesReport[] = [
        { date: '2025-01-01', sales: 10, amount: 100000 },
        { date: '2025-01-02', sales: 15, amount: 150000 },
        { date: '2025-01-03', sales: 20, amount: 200000 },
      ];

      const action = {
        type: fetchDailySalesReport.fulfilled.type,
        payload: multipleDailyReports,
      };

      const state = reportsReducer(initialState, action);

      expect(state.dailyReport).toHaveLength(3);
      expect(state.dailyReport).toEqual(multipleDailyReports);
    });

    it('should handle empty reports', () => {
      const action = {
        type: fetchDailySalesReport.fulfilled.type,
        payload: [],
      };

      const state = reportsReducer(initialState, action);

      expect(state.dailyReport).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    it('should handle multiple users in user report', () => {
      const multipleUsers: UserSalesReport[] = [
        { userId: 1, userName: 'User 1', totalSales: 50, totalAmount: 500000 },
        { userId: 2, userName: 'User 2', totalSales: 30, totalAmount: 300000 },
        { userId: 3, userName: 'User 3', totalSales: 20, totalAmount: 200000 },
      ];

      const action = {
        type: fetchSalesByUser.fulfilled.type,
        payload: multipleUsers,
      };

      const state = reportsReducer(initialState, action);

      expect(state.userReport).toHaveLength(3);
      expect(state.userReport).toEqual(multipleUsers);
    });

    it('should handle sales report with multiple top products', () => {
      const reportWithMultipleProducts: SalesReport = {
        ...mockSalesReport,
        topProducts: [
          { productId: 1, productName: 'Product 1', totalQuantity: 100, totalRevenue: 1000000 },
          { productId: 2, productName: 'Product 2', totalQuantity: 80, totalRevenue: 800000 },
          { productId: 3, productName: 'Product 3', totalQuantity: 60, totalRevenue: 600000 },
        ],
      };

      const action = {
        type: fetchSalesReport.fulfilled.type,
        payload: reportWithMultipleProducts,
      };

      const state = reportsReducer(initialState, action);

      expect(state.salesReport?.topProducts).toHaveLength(3);
    });
  });
});
