import { describe, it, expect, beforeEach, vi } from 'vitest';
import salesReducer, {
  createSaleNote,
  fetchSales,
  fetchSaleById,
  fetchPendingSales,
  checkoutSale,
  deleteSaleNote,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  clearCurrentSale,
  clearError,
  setPagination,
  type CartItem,
  type ExtendedSalesState,
} from '../salesSlice';
import { salesService } from '@/services/salesService';
import type { SaleNote } from '@/types';

// Mock salesService
vi.mock('@/services/salesService');

describe('salesSlice', () => {
  let initialState: ExtendedSalesState;

  const mockSale: SaleNote = {
    id: 1,
    userId: 1,
    paid: false,
    amount: 5000,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockCartItem: CartItem = {
    productId: 1,
    productName: 'Test Product',
    barcode: '123456',
    quantity: 2,
    unitPrice: 1000,
    salePrice: 1500,
    totalPrice: 3000,
  };

  beforeEach(() => {
    initialState = {
      sales: [],
      currentSale: null,
      pendingSales: [],
      isLoading: false,
      error: null,
      cart: [],
      cartTotal: 0,
      pagination: {
        total: 0,
        limit: 10,
        offset: 0,
      },
    };
    vi.clearAllMocks();
  });

  describe('cart management reducers', () => {
    it('should handle addToCart with new item', () => {
      const state = salesReducer(initialState, addToCart(mockCartItem));

      expect(state.cart).toHaveLength(1);
      expect(state.cart[0]).toEqual(mockCartItem);
      expect(state.cartTotal).toBe(3000);
    });

    it('should handle addToCart with existing item', () => {
      const stateWithCart: ExtendedSalesState = {
        ...initialState,
        cart: [mockCartItem],
        cartTotal: 3000,
      };

      const state = salesReducer(stateWithCart, addToCart(mockCartItem));

      expect(state.cart).toHaveLength(1);
      expect(state.cart[0].quantity).toBe(4);
      expect(state.cart[0].totalPrice).toBe(6000);
      expect(state.cartTotal).toBe(6000);
    });

    it('should handle updateCartItemQuantity', () => {
      const stateWithCart: ExtendedSalesState = {
        ...initialState,
        cart: [mockCartItem],
        cartTotal: 3000,
      };

      const state = salesReducer(
        stateWithCart,
        updateCartItemQuantity({ productId: 1, quantity: 5 })
      );

      expect(state.cart[0].quantity).toBe(5);
      expect(state.cart[0].totalPrice).toBe(7500);
      expect(state.cartTotal).toBe(7500);
    });

    it('should handle removeFromCart', () => {
      const stateWithCart: ExtendedSalesState = {
        ...initialState,
        cart: [mockCartItem],
        cartTotal: 3000,
      };

      const state = salesReducer(stateWithCart, removeFromCart(1));

      expect(state.cart).toHaveLength(0);
      expect(state.cartTotal).toBe(0);
    });

    it('should handle clearCart', () => {
      const stateWithCart: ExtendedSalesState = {
        ...initialState,
        cart: [mockCartItem, { ...mockCartItem, productId: 2 }],
        cartTotal: 6000,
      };

      const state = salesReducer(stateWithCart, clearCart());

      expect(state.cart).toHaveLength(0);
      expect(state.cartTotal).toBe(0);
    });

    it('should calculate cartTotal correctly with multiple items', () => {
      const item2: CartItem = {
        ...mockCartItem,
        productId: 2,
        quantity: 3,
        salePrice: 2000,
        totalPrice: 6000,
      };

      let state = salesReducer(initialState, addToCart(mockCartItem));
      state = salesReducer(state, addToCart(item2));

      expect(state.cart).toHaveLength(2);
      expect(state.cartTotal).toBe(9000);
    });
  });

  describe('other reducers', () => {
    it('should handle clearCurrentSale', () => {
      const stateWithSale: ExtendedSalesState = {
        ...initialState,
        currentSale: mockSale,
      };

      const state = salesReducer(stateWithSale, clearCurrentSale());

      expect(state.currentSale).toBeNull();
    });

    it('should handle clearError', () => {
      const stateWithError: ExtendedSalesState = {
        ...initialState,
        error: 'Test error',
      };

      const state = salesReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it('should handle setPagination', () => {
      const pagination = {
        limit: 20,
        offset: 40,
      };

      const state = salesReducer(initialState, setPagination(pagination));

      expect(state.pagination.limit).toBe(20);
      expect(state.pagination.offset).toBe(40);
      expect(state.pagination.total).toBe(0);
    });
  });

  describe('createSaleNote async thunk', () => {
    it('should handle createSaleNote.pending', () => {
      const action = { type: createSaleNote.pending.type };
      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createSaleNote.fulfilled', () => {
      const action = {
        type: createSaleNote.fulfilled.type,
        payload: mockSale,
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.sales).toHaveLength(1);
      expect(state.sales[0]).toEqual(mockSale);
      expect(state.currentSale).toEqual(mockSale);
      expect(state.error).toBeNull();
    });

    it('should handle createSaleNote.rejected', () => {
      const action = {
        type: createSaleNote.rejected.type,
        payload: { message: 'Failed to create sale' },
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to create sale');
    });
  });

  describe('fetchSales async thunk', () => {
    it('should handle fetchSales.pending', () => {
      const action = { type: fetchSales.pending.type };
      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSales.fulfilled', () => {
      const mockResponse = {
        sales: [mockSale],
        total: 1,
      };

      const action = {
        type: fetchSales.fulfilled.type,
        payload: mockResponse,
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.sales).toEqual([mockSale]);
      expect(state.pagination.total).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSales.rejected', () => {
      const action = {
        type: fetchSales.rejected.type,
        payload: { message: 'Failed to fetch sales' },
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch sales');
    });
  });

  describe('fetchSaleById async thunk', () => {
    it('should handle fetchSaleById.pending', () => {
      const action = { type: fetchSaleById.pending.type };
      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSaleById.fulfilled', () => {
      const action = {
        type: fetchSaleById.fulfilled.type,
        payload: mockSale,
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.currentSale).toEqual(mockSale);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSaleById.rejected', () => {
      const action = {
        type: fetchSaleById.rejected.type,
        payload: { message: 'Sale not found' },
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Sale not found');
    });
  });

  describe('fetchPendingSales async thunk', () => {
    it('should handle fetchPendingSales.pending', () => {
      const action = { type: fetchPendingSales.pending.type };
      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchPendingSales.fulfilled', () => {
      const action = {
        type: fetchPendingSales.fulfilled.type,
        payload: [mockSale],
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.pendingSales).toEqual([mockSale]);
      expect(state.error).toBeNull();
    });

    it('should handle fetchPendingSales.rejected', () => {
      const action = {
        type: fetchPendingSales.rejected.type,
        payload: { message: 'Failed to fetch pending sales' },
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch pending sales');
    });
  });

  describe('checkoutSale async thunk', () => {
    it('should handle checkoutSale.pending', () => {
      const action = { type: checkoutSale.pending.type };
      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle checkoutSale.fulfilled', () => {
      const paidSale = { ...mockSale, paid: true };
      const stateWithSales: ExtendedSalesState = {
        ...initialState,
        sales: [mockSale],
        pendingSales: [mockSale],
        currentSale: mockSale,
      };

      const action = {
        type: checkoutSale.fulfilled.type,
        payload: paidSale,
      };

      const state = salesReducer(stateWithSales, action);

      expect(state.isLoading).toBe(false);
      expect(state.sales[0]).toEqual(paidSale);
      expect(state.pendingSales).toHaveLength(0);
      expect(state.currentSale).toEqual(paidSale);
      expect(state.error).toBeNull();
    });

    it('should handle checkoutSale.rejected', () => {
      const action = {
        type: checkoutSale.rejected.type,
        payload: { message: 'Checkout failed' },
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Checkout failed');
    });
  });

  describe('deleteSaleNote async thunk', () => {
    it('should handle deleteSaleNote.pending', () => {
      const action = { type: deleteSaleNote.pending.type };
      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle deleteSaleNote.fulfilled', () => {
      const stateWithSales: ExtendedSalesState = {
        ...initialState,
        sales: [mockSale, { ...mockSale, id: 2 }],
        pendingSales: [mockSale],
        currentSale: mockSale,
        pagination: { total: 2, limit: 10, offset: 0 },
      };

      const action = {
        type: deleteSaleNote.fulfilled.type,
        payload: 1,
      };

      const state = salesReducer(stateWithSales, action);

      expect(state.isLoading).toBe(false);
      expect(state.sales).toHaveLength(1);
      expect(state.sales.find((s) => s.id === 1)).toBeUndefined();
      expect(state.pendingSales).toHaveLength(0);
      expect(state.currentSale).toBeNull();
      expect(state.pagination.total).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should handle deleteSaleNote.rejected', () => {
      const action = {
        type: deleteSaleNote.rejected.type,
        payload: { message: 'Delete failed' },
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('edge cases', () => {
    it('should handle updating quantity of non-existent cart item', () => {
      const state = salesReducer(
        initialState,
        updateCartItemQuantity({ productId: 999, quantity: 5 })
      );

      expect(state.cart).toHaveLength(0);
      expect(state.cartTotal).toBe(0);
    });

    it('should handle removing non-existent cart item', () => {
      const state = salesReducer(initialState, removeFromCart(999));

      expect(state.cart).toHaveLength(0);
      expect(state.cartTotal).toBe(0);
    });

    it('should handle checkoutSale when sale not in lists', () => {
      const paidSale = { ...mockSale, id: 999, paid: true };

      const action = {
        type: checkoutSale.fulfilled.type,
        payload: paidSale,
      };

      const state = salesReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.sales).toHaveLength(0);
      expect(state.pendingSales).toHaveLength(0);
      expect(state.currentSale).toBeNull();
    });

    it('should handle multiple sales in list', () => {
      const mockSales = [
        mockSale,
        { ...mockSale, id: 2 },
        { ...mockSale, id: 3 },
      ];

      const mockResponse = {
        sales: mockSales,
        total: 3,
      };

      const action = {
        type: fetchSales.fulfilled.type,
        payload: mockResponse,
      };

      const state = salesReducer(initialState, action);

      expect(state.sales).toHaveLength(3);
      expect(state.pagination.total).toBe(3);
    });
  });
});
