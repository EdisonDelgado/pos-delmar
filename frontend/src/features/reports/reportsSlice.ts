import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsService } from '@/services/reportsService';
import type {
  ReportsState,
  SalesReport,
  DailySalesReport,
  MonthlySalesReport,
  YearlySalesReport,
  UserSalesReport,
  ApiError,
} from '@/types';

const initialState: ReportsState = {
  salesReport: null,
  dailyReport: [],
  monthlyReport: [],
  yearlyReport: [],
  userReport: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSalesReport = createAsyncThunk<
  SalesReport,
  { startDate?: string; endDate?: string } | void,
  { rejectValue: ApiError }
>('reports/fetchSalesReport', async (params, { rejectWithValue }) => {
  try {
    return await reportsService.getSalesReport(params?.startDate, params?.endDate);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchDailySalesReport = createAsyncThunk<
  DailySalesReport[],
  { startDate?: string; endDate?: string } | void,
  { rejectValue: ApiError }
>('reports/fetchDailySalesReport', async (params, { rejectWithValue }) => {
  try {
    return await reportsService.getDailySalesReport(params?.startDate, params?.endDate);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchMonthlySalesReport = createAsyncThunk<
  MonthlySalesReport[],
  { year?: number } | void,
  { rejectValue: ApiError }
>('reports/fetchMonthlySalesReport', async (params, { rejectWithValue }) => {
  try {
    return await reportsService.getMonthlySalesReport(params?.year);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchYearlySalesReport = createAsyncThunk<
  YearlySalesReport[],
  void,
  { rejectValue: ApiError }
>('reports/fetchYearlySalesReport', async (_, { rejectWithValue }) => {
  try {
    return await reportsService.getYearlySalesReport();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchSalesByUser = createAsyncThunk<
  UserSalesReport[],
  { startDate?: string; endDate?: string } | void,
  { rejectValue: ApiError }
>('reports/fetchSalesByUser', async (params, { rejectWithValue }) => {
  try {
    return await reportsService.getSalesByUser(params?.startDate, params?.endDate);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.salesReport = null;
      state.dailyReport = [];
      state.monthlyReport = [];
      state.yearlyReport = [];
      state.userReport = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sales report
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesReport = action.payload;
        state.error = null;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch sales report';
      });

    // Fetch daily sales report
    builder
      .addCase(fetchDailySalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailySalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchDailySalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch daily report';
      });

    // Fetch monthly sales report
    builder
      .addCase(fetchMonthlySalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlySalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchMonthlySalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch monthly report';
      });

    // Fetch yearly sales report
    builder
      .addCase(fetchYearlySalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchYearlySalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.yearlyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchYearlySalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch yearly report';
      });

    // Fetch sales by user
    builder
      .addCase(fetchSalesByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userReport = action.payload;
        state.error = null;
      })
      .addCase(fetchSalesByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch user sales report';
      });
  },
});

export const { clearError, clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
