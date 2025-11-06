import { describe, it, expect, beforeEach, vi } from 'vitest';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  clearCurrentProduct,
  clearError,
  setPagination,
} from '../productsSlice';
import { productService } from '@/services/productService';
import type { ProductsState, Product } from '@/types';

// Mock productService
vi.mock('@/services/productService');

describe('productsSlice', () => {
  let initialState: ProductsState;

  const mockProduct: Product = {
    id: 1,
    barcode: '7501234567890',
    name: 'Coca Cola 2L',
    stock: 50,
    costPrice: 1500,
    salePrice: 2000,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    initialState = {
      products: [],
      currentProduct: null,
      isLoading: false,
      error: null,
      pagination: {
        total: 0,
        limit: 10,
        offset: 0,
      },
    };
    vi.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle clearCurrentProduct', () => {
      const stateWithProduct: ProductsState = {
        ...initialState,
        currentProduct: mockProduct,
      };

      const state = productsReducer(stateWithProduct, clearCurrentProduct());

      expect(state.currentProduct).toBeNull();
    });

    it('should handle clearError', () => {
      const stateWithError: ProductsState = {
        ...initialState,
        error: 'Test error',
      };

      const state = productsReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it('should handle setPagination', () => {
      const pagination = {
        limit: 20,
        offset: 40,
      };

      const state = productsReducer(initialState, setPagination(pagination));

      expect(state.pagination.limit).toBe(20);
      expect(state.pagination.offset).toBe(40);
      expect(state.pagination.total).toBe(0); // Should remain unchanged
    });
  });

  describe('fetchProducts async thunk', () => {
    it('should handle fetchProducts.pending', () => {
      const action = { type: fetchProducts.pending.type };
      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchProducts.fulfilled', () => {
      const mockResponse = {
        products: [mockProduct],
        total: 1,
      };

      const action = {
        type: fetchProducts.fulfilled.type,
        payload: mockResponse,
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.products).toEqual([mockProduct]);
      expect(state.pagination.total).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should handle fetchProducts.rejected', () => {
      const action = {
        type: fetchProducts.rejected.type,
        payload: { message: 'Failed to fetch products' },
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch products');
    });
  });

  describe('fetchProductById async thunk', () => {
    it('should handle fetchProductById.pending', () => {
      const action = { type: fetchProductById.pending.type };
      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchProductById.fulfilled', () => {
      const action = {
        type: fetchProductById.fulfilled.type,
        payload: mockProduct,
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.currentProduct).toEqual(mockProduct);
      expect(state.error).toBeNull();
    });

    it('should handle fetchProductById.rejected', () => {
      const action = {
        type: fetchProductById.rejected.type,
        payload: { message: 'Product not found' },
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Product not found');
    });
  });

  describe('createProduct async thunk', () => {
    it('should handle createProduct.pending', () => {
      const action = { type: createProduct.pending.type };
      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createProduct.fulfilled', () => {
      const action = {
        type: createProduct.fulfilled.type,
        payload: mockProduct,
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.products).toContainEqual(mockProduct);
      expect(state.products[0]).toEqual(mockProduct); // Added at beginning (unshift)
      expect(state.pagination.total).toBe(1); // Total incremented
      expect(state.error).toBeNull();
    });

    it('should handle createProduct.rejected', () => {
      const action = {
        type: createProduct.rejected.type,
        payload: { message: 'Barcode already exists' },
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Barcode already exists');
    });
  });

  describe('updateProduct async thunk', () => {
    it('should handle updateProduct.pending', () => {
      const action = { type: updateProduct.pending.type };
      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle updateProduct.fulfilled', () => {
      const stateWithProducts: ProductsState = {
        ...initialState,
        products: [mockProduct],
        currentProduct: mockProduct,
      };

      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        stock: 100,
      };

      const action = {
        type: updateProduct.fulfilled.type,
        payload: updatedProduct,
      };

      const state = productsReducer(stateWithProducts, action);

      expect(state.isLoading).toBe(false);
      expect(state.products[0]).toEqual(updatedProduct);
      expect(state.currentProduct).toEqual(updatedProduct); // Updated because IDs match
      expect(state.error).toBeNull();
    });

    it('should handle updateProduct.rejected', () => {
      const action = {
        type: updateProduct.rejected.type,
        payload: { message: 'Update failed' },
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Update failed');
    });
  });

  describe('deleteProduct async thunk', () => {
    it('should handle deleteProduct.pending', () => {
      const action = { type: deleteProduct.pending.type };
      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle deleteProduct.fulfilled', () => {
      const stateWithProducts: ProductsState = {
        ...initialState,
        products: [mockProduct, { ...mockProduct, id: 2 }],
        pagination: { total: 2, limit: 10, offset: 0 },
      };

      const action = {
        type: deleteProduct.fulfilled.type,
        payload: 1, // The ID that was deleted
      };

      const state = productsReducer(stateWithProducts, action);

      expect(state.isLoading).toBe(false);
      expect(state.products).toHaveLength(1);
      expect(state.products.find((p) => p.id === 1)).toBeUndefined();
      expect(state.pagination.total).toBe(1); // Total decremented
      expect(state.error).toBeNull();
    });

    it('should handle deleteProduct.rejected', () => {
      const action = {
        type: deleteProduct.rejected.type,
        payload: { message: 'Delete failed' },
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('searchProducts async thunk', () => {
    it('should handle searchProducts.pending', () => {
      const action = { type: searchProducts.pending.type };
      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle searchProducts.fulfilled', () => {
      const mockResponse = [mockProduct];

      const action = {
        type: searchProducts.fulfilled.type,
        payload: mockResponse,
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.products).toEqual([mockProduct]);
      expect(state.error).toBeNull();
    });

    it('should handle searchProducts.rejected', () => {
      const action = {
        type: searchProducts.rejected.type,
        payload: { message: 'Search failed' },
      };

      const state = productsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Search failed');
    });
  });

  describe('edge cases', () => {
    it('should handle updating a non-existent product', () => {
      const stateWithProducts: ProductsState = {
        ...initialState,
        products: [mockProduct],
      };

      const updatedProduct = {
        ...mockProduct,
        id: 999, // Non-existent ID
        name: 'Updated Product',
      };

      const action = {
        type: updateProduct.fulfilled.type,
        payload: updatedProduct,
      };

      const state = productsReducer(stateWithProducts, action);

      // Should not update the existing product
      expect(state.products[0].id).toBe(1);
      expect(state.products).toHaveLength(1); // No new product added
      expect(state.currentProduct).toBeNull(); // currentProduct not set because it doesn't match
    });

    it('should handle multiple products in list', () => {
      const mockProducts = [
        mockProduct,
        { ...mockProduct, id: 2, name: 'Product 2' },
        { ...mockProduct, id: 3, name: 'Product 3' },
      ];

      const mockResponse = {
        products: mockProducts,
        total: 3,
      };

      const action = {
        type: fetchProducts.fulfilled.type,
        payload: mockResponse,
      };

      const state = productsReducer(initialState, action);

      expect(state.products).toHaveLength(3);
      expect(state.pagination.total).toBe(3);
    });

    it('should handle empty products list', () => {
      const mockResponse = {
        products: [],
        total: 0,
      };

      const action = {
        type: fetchProducts.fulfilled.type,
        payload: mockResponse,
      };

      const state = productsReducer(initialState, action);

      expect(state.products).toHaveLength(0);
      expect(state.pagination.total).toBe(0);
    });
  });
});
