// User types
export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roles?: Role[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    roles: string[];
  };
}

export interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Product types
export interface Product {
  id: number;
  barcode: string;
  name: string;
  stock: number;
  costPrice: number;
  salePrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  barcode: string;
  name: string;
  stock: number;
  costPrice: number;
  salePrice: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Sales types
export interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleNoteRequest {
  items: SaleItem[];
}

export interface CheckoutSaleNoteRequest {
  comment?: string;
  document?: string;
}

export interface SaleNoteDetail {
  id: number;
  productId: number;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  product?: Product;
}

export interface SaleNote {
  id: number;
  userId: number;
  paid: boolean;
  amount: number;
  comment?: string;
  document?: string;
  createdAt: string;
  updatedAt: string;
  details?: SaleNoteDetail[];
  user?: User;
}

export interface SalesState {
  sales: SaleNote[];
  currentSale: SaleNote | null;
  pendingSales: SaleNote[];
  isLoading: boolean;
  error: string | null;
}

// Report types
export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SalesReport {
  totalSales: number;
  totalAmount: number;
  netAmount: number;
  vatAmount: number;
  averageSale: number;
  topProducts: TopProduct[];
}

export interface DailySalesReport {
  date: string;
  sales: number;
  amount: number;
}

export interface MonthlySalesReport {
  month: number;
  year: number;
  sales: number;
  amount: number;
}

export interface YearlySalesReport {
  year: number;
  sales: number;
  amount: number;
}

export interface UserSalesReport {
  userId: number;
  userName: string;
  totalSales: number;
  totalAmount: number;
}

export interface ReportsState {
  salesReport: SalesReport | null;
  dailyReport: DailySalesReport[];
  monthlyReport: MonthlySalesReport[];
  yearlyReport: YearlySalesReport[];
  userReport: UserSalesReport[];
  isLoading: boolean;
  error: string | null;
}

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  name: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSettingRequest {
  key: string;
  value: string;
  name: string;
  description?: string;
  category?: string;
}

export interface UpdateSettingRequest extends Partial<CreateSettingRequest> {}

export interface SettingsState {
  settings: Setting[];
  currentSetting: Setting | null;
  isLoading: boolean;
  error: string | null;
}

// API Error type
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
