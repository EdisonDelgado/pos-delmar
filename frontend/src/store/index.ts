import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import productsReducer from '@/features/products/productsSlice';
import salesReducer from '@/features/sales/salesSlice';
import reportsReducer from '@/features/reports/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    sales: salesReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
