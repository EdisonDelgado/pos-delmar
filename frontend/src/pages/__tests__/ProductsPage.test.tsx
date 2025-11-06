import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProductsPage } from '../ProductsPage';
import productsReducer from '@/features/products/productsSlice';
import authReducer from '@/features/auth/authSlice';
import { productService } from '@/services/productService';
import type { Product } from '@/types';

// Mock the product service
vi.mock('@/services/productService');

const mockProductService = productService as any;

describe('ProductsPage', () => {
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

  const lowStockProduct: Product = {
    id: 2,
    barcode: '7501234567891',
    name: 'Sprite 2L',
    stock: 5,
    costPrice: 1400,
    salePrice: 1900,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const createStore = (preloadedState = {}) => {
    const defaultState = {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      products: {
        products: [],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 0, limit: 10, offset: 0 },
      },
    };

    return configureStore({
      reducer: {
        auth: authReducer,
        products: productsReducer,
      },
      preloadedState: {
        ...defaultState,
        ...preloadedState,
        products: {
          ...defaultState.products,
          ...(preloadedState as any).products,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: return empty products
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [],
      total: 0,
    });
  });

  it('should render products page header', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tu inventario de productos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument();
  });

  it('should render empty state when no products', async () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    // Wait for the async fetchProducts to complete and render
    await waitFor(() => {
      expect(screen.getByText('Lista de Productos')).toBeInTheDocument();
    });

    expect(screen.getByText(/0 productos? encontrados?/i)).toBeInTheDocument();
    expect(screen.getByText('No hay productos disponibles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear primer producto/i })).toBeInTheDocument();
  });

  it('should render loading state', () => {
    const store = createStore({
      products: {
        products: [],
        currentProduct: null,
        isLoading: true,
        error: null,
        pagination: { total: 0, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });

  it('should render products list', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [mockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Coca Cola 2L')).toBeInTheDocument();
    });
    expect(screen.getByText('7501234567890')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should format currency correctly', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [mockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    // Chilean peso formatting
    await waitFor(() => {
      expect(screen.getByText(/1\.500/)).toBeInTheDocument();
    });
    expect(screen.getByText(/2\.000/)).toBeInTheDocument();
  });

  it('should highlight low stock products', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [lowStockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [lowStockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const stockCell = screen.getByText('5');
      expect(stockCell.className).toContain('text-destructive');
    });
  });

  it('should display error message', async () => {
    mockProductService.getProducts = vi.fn().mockRejectedValue({
      message: 'Failed to fetch products',
    });

    const store = createStore({
      products: {
        products: [],
        currentProduct: null,
        isLoading: false,
        error: 'Failed to fetch products',
        pagination: { total: 0, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch products')).toBeInTheDocument();
    });
  });

  it('should open create dialog when clicking new product button', () => {
    const store = createStore({
      products: {
        products: [],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 0, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    const newProductButton = screen.getByRole('button', { name: /nuevo producto/i });
    fireEvent.click(newProductButton);

    expect(screen.getByText('Crear Nuevo Producto')).toBeInTheDocument();
    expect(screen.getByText('Completa los datos del nuevo producto')).toBeInTheDocument();
  });

  it('should allow search input', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [mockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(searchInput, { target: { value: 'Coca' } });

    expect(searchInput).toHaveValue('Coca');
  });

  it('should display pagination stats', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct, lowStockProduct],
      total: 10,
    });

    const store = createStore({
      products: {
        products: [mockProduct, lowStockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 10, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('10')).toBeInTheDocument(); // Total products
    expect(screen.getByText('2')).toBeInTheDocument(); // Showing count
  });

  it('should have edit and delete buttons for each product', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [mockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: '' }).filter(
        (button) => button.querySelector('[data-lucide="edit"]') || button.querySelector('svg')
      );

      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  it('should render table headers correctly', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [mockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Código')).toBeInTheDocument();
    });
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('P. Costo')).toBeInTheDocument();
    expect(screen.getByText('P. Venta')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  it('should render multiple products', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct, lowStockProduct],
      total: 2,
    });

    const store = createStore({
      products: {
        products: [mockProduct, lowStockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 2, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Coca Cola 2L')).toBeInTheDocument();
    });
    expect(screen.getByText('Sprite 2L')).toBeInTheDocument();
    expect(screen.getByText('2 productos encontrados')).toBeInTheDocument();
  });

  it('should display search and refresh buttons', () => {
    const store = createStore({
      products: {
        products: [],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 0, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Buscar Productos')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');

    // Should have search button and refresh button
    expect(buttons.length).toBeGreaterThan(2);
  });

  it('should show correct singular/plural text', async () => {
    mockProductService.getProducts = vi.fn().mockResolvedValue({
      products: [mockProduct],
      total: 1,
    });

    const store = createStore({
      products: {
        products: [mockProduct],
        currentProduct: null,
        isLoading: false,
        error: null,
        pagination: { total: 1, limit: 10, offset: 0 },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('1 producto encontrado')).toBeInTheDocument();
    });
  });
});
