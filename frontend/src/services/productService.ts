import apiClient from './api';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types';

interface ProductsResponse {
  products: Product[];
  total: number;
}

export const productService = {
  async getProducts(params?: { limit?: number; offset?: number; search?: string }): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getProductByBarcode(barcode: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/barcode/${barcode}`);
    return response.data;
  },

  async searchProducts(name: string, limit?: number): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/search', {
      params: { name, limit },
    });
    return response.data;
  },

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/products', product);
    return response.data;
  },

  async updateProduct(id: number, product: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.patch<Product>(`/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async updateStock(id: number, quantity: number): Promise<Product> {
    const response = await apiClient.patch<Product>(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  async getLowStockProducts(threshold?: number): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/low-stock', {
      params: { threshold },
    });
    return response.data;
  },

  async getProductsCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/products/stats/count');
    return response.data;
  },

  async getTotalInventoryValue(): Promise<{ totalValue: number }> {
    const response = await apiClient.get<{ totalValue: number }>('/products/stats/inventory-value');
    return response.data;
  },
};
