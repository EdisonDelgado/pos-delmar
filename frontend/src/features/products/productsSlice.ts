import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { productService } from '@/services/productService';
import type { ProductsState, Product, CreateProductRequest, UpdateProductRequest, ApiError } from '@/types';

const initialState: ProductsState = {
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

// Async thunks
export const fetchProducts = createAsyncThunk<
  { products: Product[]; total: number },
  { limit?: number; offset?: number; search?: string } | void,
  { rejectValue: ApiError }
>('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    return await productService.getProducts(params || undefined);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchProductById = createAsyncThunk<
  Product,
  number,
  { rejectValue: ApiError }
>('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    return await productService.getProductById(id);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const createProduct = createAsyncThunk<
  Product,
  CreateProductRequest,
  { rejectValue: ApiError }
>('products/createProduct', async (data, { rejectWithValue }) => {
  try {
    return await productService.createProduct(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: number; data: UpdateProductRequest },
  { rejectValue: ApiError }
>('products/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await productService.updateProduct(id, data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const deleteProduct = createAsyncThunk<
  number,
  number,
  { rejectValue: ApiError }
>('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await productService.deleteProduct(id);
    return id;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const searchProducts = createAsyncThunk<
  Product[],
  { name: string; limit?: number },
  { rejectValue: ApiError }
>('products/searchProducts', async ({ name, limit }, { rejectWithValue }) => {
  try {
    return await productService.searchProducts(name, limit);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
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
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch products';
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch product';
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create product';
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update product';
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete product';
      });

    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to search products';
      });
  },
});

export const { clearCurrentProduct, clearError, setPagination } = productsSlice.actions;
export default productsSlice.reducer;
