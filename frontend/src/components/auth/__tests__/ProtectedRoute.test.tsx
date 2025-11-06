import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '../ProtectedRoute';
import authReducer from '@/features/auth/authSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return <div data-testid="navigate-to">{to}</div>;
    },
  };
});

describe('ProtectedRoute', () => {
  const createStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState,
    });
  };

  it('should redirect to login when not authenticated', () => {
    const store = createStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render children when authenticated', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@test.com',
          isActive: true,
          roles: ['User'],
        },
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to unauthorized when user lacks required role', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@test.com',
          isActive: true,
          roles: ['User'],
        },
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute requiredRoles={['Admin']}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
  });

  it('should render children when user has required role', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@test.com',
          isActive: true,
          roles: ['Admin'],
        },
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute requiredRoles={['Admin']}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should render children when user has one of multiple required roles', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Seller User',
          email: 'seller@test.com',
          isActive: true,
          roles: ['Seller'],
        },
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProtectedRoute requiredRoles={['Admin', 'Seller']}>
            <div>Multi-Role Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
  });
});
