import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { salesService } from '@/services/salesService';
import type {
  SalesState,
  SaleNote,
  CreateSaleNoteRequest,
  CheckoutSaleNoteRequest,
  ApiError,
  SaleItem,
} from '@/types';

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  pendingSales: [],
  isLoading: false,
  error: null,
};

// Cart item type for POS
export interface CartItem {
  productId: number;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  salePrice: number;
  totalPrice: number;
}

// Extended state for cart management
export interface ExtendedSalesState extends SalesState {
  cart: CartItem[];
  cartTotal: number;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

const extendedInitialState: ExtendedSalesState = {
  ...initialState,
  cart: [],
  cartTotal: 0,
  pagination: {
    total: 0,
    limit: 10,
    offset: 0,
  },
};

// Async thunks
export const createSaleNote = createAsyncThunk<
  SaleNote,
  CreateSaleNoteRequest,
  { rejectValue: ApiError }
>('sales/createSaleNote', async (data, { rejectWithValue }) => {
  try {
    return await salesService.createSaleNote(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchSales = createAsyncThunk<
  { sales: SaleNote[]; total: number },
  { limit?: number; offset?: number; paid?: boolean; userId?: number } | void,
  { rejectValue: ApiError }
>('sales/fetchSales', async (params, { rejectWithValue }) => {
  try {
    return await salesService.getSales(params);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchSaleById = createAsyncThunk<
  SaleNote,
  number,
  { rejectValue: ApiError }
>('sales/fetchSaleById', async (id, { rejectWithValue }) => {
  try {
    return await salesService.getSaleById(id);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchPendingSales = createAsyncThunk<
  SaleNote[],
  void,
  { rejectValue: ApiError }
>('sales/fetchPendingSales', async (_, { rejectWithValue }) => {
  try {
    return await salesService.getPendingSales();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const checkoutSale = createAsyncThunk<
  SaleNote,
  { id: number; data: CheckoutSaleNoteRequest },
  { rejectValue: ApiError }
>('sales/checkoutSale', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await salesService.checkout(id, data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const deleteSaleNote = createAsyncThunk<
  number,
  number,
  { rejectValue: ApiError }
>('sales/deleteSaleNote', async (id, { rejectWithValue }) => {
  try {
    await salesService.deleteSaleNote(id);
    return id;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// Slice
const salesSlice = createSlice({
  name: 'sales',
  initialState: extendedInitialState,
  reducers: {
    // Cart management
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.salePrice;
      } else {
        state.cart.push(action.payload);
      }

      state.cartTotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const item = state.cart.find((item) => item.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
        item.totalPrice = item.quantity * item.salePrice;
        state.cartTotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.productId !== action.payload);
      state.cartTotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    clearCart: (state) => {
      state.cart = [];
      state.cartTotal = 0;
    },

    // Other reducers
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    setPagination: (state, action: PayloadAction<{ limit?: number; offset?: number }>) => {
      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
      }
      if (action.payload.offset !== undefined) {
        state.pagination.offset = action.payload.offset;
      }
    },
  },
  extraReducers: (builder) => {
    // Create sale note
    builder
      .addCase(createSaleNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSaleNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales.unshift(action.payload);
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(createSaleNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create sale';
      });

    // Fetch sales
    builder
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload.sales;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch sales';
      });

    // Fetch sale by ID
    builder
      .addCase(fetchSaleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch sale';
      });

    // Fetch pending sales
    builder
      .addCase(fetchPendingSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingSales = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch pending sales';
      });

    // Checkout sale
    builder
      .addCase(checkoutSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkoutSale.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in sales list
        const index = state.sales.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        // Remove from pending sales
        state.pendingSales = state.pendingSales.filter((s) => s.id !== action.payload.id);
        // Update current sale if it matches
        if (state.currentSale?.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      .addCase(checkoutSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to checkout sale';
      });

    // Delete sale note
    builder
      .addCase(deleteSaleNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSaleNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = state.sales.filter((s) => s.id !== action.payload);
        state.pendingSales = state.pendingSales.filter((s) => s.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentSale?.id === action.payload) {
          state.currentSale = null;
        }
        state.error = null;
      })
      .addCase(deleteSaleNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete sale';
      });
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  clearCurrentSale,
  clearError,
  setPagination,
} = salesSlice.actions;

export default salesSlice.reducer;
