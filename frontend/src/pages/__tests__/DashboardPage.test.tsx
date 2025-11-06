import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardPage } from '../DashboardPage';
import authReducer from '@/features/auth/authSlice';

describe('DashboardPage', () => {
  const createStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState,
    });
  };

  it('should render dashboard with user name', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@test.com',
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
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido de nuevo, John Doe/i)).toBeInTheDocument();
  });

  it('should render all stat cards', () => {
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
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Ventas del Día')).toBeInTheDocument();
    expect(screen.getByText('Ventas del Mes')).toBeInTheDocument();
    expect(screen.getByText('Usuarios Activos')).toBeInTheDocument();
  });

  it('should render quick actions section', () => {
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
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
    expect(screen.getByText('Ver Productos')).toBeInTheDocument();
    expect(screen.getByText('Nueva Venta')).toBeInTheDocument();
  });

  it('should show reports link for admin users', () => {
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
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Ver Reportes')).toBeInTheDocument();
  });

  it('should not show reports link for non-admin users', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Regular User',
          email: 'user@test.com',
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
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Ver Reportes')).not.toBeInTheDocument();
  });

  it('should render system status section', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@test.com',
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
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Estado del Sistema')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });
});
