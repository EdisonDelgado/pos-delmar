import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from '../LoginPage';
import authReducer from '@/features/auth/authSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  const createStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('POS Delmar')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should allow user to type email and password', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should show loading state when submitting', async () => {
    const store = createStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Iniciando sesión...');
  });

  it('should display error message when login fails', () => {
    const store = createStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Credenciales inválidas',
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('should navigate to dashboard when authenticated', () => {
    const store = createStore({
      auth: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@test.com',
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
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should have link to register page', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const registerLink = screen.getByRole('link', { name: /regístrate aquí/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
