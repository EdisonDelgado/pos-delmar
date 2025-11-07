import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import type { AuthState, LoginRequest, RegisterRequest, AuthResponse, ApiError } from '@/types';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load state from localStorage
const loadAuthFromStorage = (): Partial<AuthState> => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        token,
        user,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  return {};
};

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: ApiError }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);

    // Save to localStorage
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: ApiError }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.register(data);

    // Save to localStorage
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const getProfile = createAsyncThunk<
  { userId: number; email: string; roles: string[] },
  void,
  { rejectValue: ApiError }
>('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    return await authService.getProfile();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// Slice
const loadedState = loadAuthFromStorage();
console.log('🔄 Cargando estado inicial de auth:', loadedState);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    ...loadedState,
  },
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        console.log('🎉 Login fulfilled:', {
          token: action.payload.access_token.substring(0, 20) + '...',
          user: action.payload.user.email,
          roles: action.payload.user.roles
        });
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('❌ Login rejected:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Registration failed';
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.id = action.payload.userId;
          state.user.email = action.payload.email;
          state.user.roles = action.payload.roles;
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch profile';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
