import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { settingsService } from '@/services/settingsService';
import type { SettingsState, Setting, CreateSettingRequest, UpdateSettingRequest, ApiError } from '@/types';

const initialState: SettingsState = {
  settings: [],
  currentSetting: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSettings = createAsyncThunk<
  Setting[],
  void,
  { rejectValue: ApiError }
>('settings/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    return await settingsService.getSettings();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchSettingById = createAsyncThunk<
  Setting,
  number,
  { rejectValue: ApiError }
>('settings/fetchSettingById', async (id, { rejectWithValue }) => {
  try {
    return await settingsService.getSettingById(id);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchSettingByKey = createAsyncThunk<
  Setting,
  string,
  { rejectValue: ApiError }
>('settings/fetchSettingByKey', async (key, { rejectWithValue }) => {
  try {
    return await settingsService.getSettingByKey(key);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchSettingsByCategory = createAsyncThunk<
  Setting[],
  string,
  { rejectValue: ApiError }
>('settings/fetchSettingsByCategory', async (category, { rejectWithValue }) => {
  try {
    return await settingsService.getSettingsByCategory(category);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const createSetting = createAsyncThunk<
  Setting,
  CreateSettingRequest,
  { rejectValue: ApiError }
>('settings/createSetting', async (data, { rejectWithValue }) => {
  try {
    return await settingsService.createSetting(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const updateSetting = createAsyncThunk<
  Setting,
  { id: number; data: UpdateSettingRequest },
  { rejectValue: ApiError }
>('settings/updateSetting', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await settingsService.updateSetting(id, data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const deleteSetting = createAsyncThunk<
  number,
  number,
  { rejectValue: ApiError }
>('settings/deleteSetting', async (id, { rejectWithValue }) => {
  try {
    await settingsService.deleteSetting(id);
    return id;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// Slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearCurrentSetting: (state) => {
      state.currentSetting = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSetting: (state, action: PayloadAction<Setting>) => {
      state.currentSetting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all settings
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch settings';
      })
      // Fetch setting by ID
      .addCase(fetchSettingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSetting = action.payload;
      })
      .addCase(fetchSettingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch setting';
      })
      // Fetch setting by key
      .addCase(fetchSettingByKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettingByKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSetting = action.payload;
      })
      .addCase(fetchSettingByKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch setting by key';
      })
      // Fetch settings by category
      .addCase(fetchSettingsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettingsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettingsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch settings by category';
      })
      // Create setting
      .addCase(createSetting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings.push(action.payload);
        state.currentSetting = action.payload;
      })
      .addCase(createSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create setting';
      })
      // Update setting
      .addCase(updateSetting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.settings.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.settings[index] = action.payload;
        }
        state.currentSetting = action.payload;
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update setting';
      })
      // Delete setting
      .addCase(deleteSetting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = state.settings.filter((s) => s.id !== action.payload);
        if (state.currentSetting?.id === action.payload) {
          state.currentSetting = null;
        }
      })
      .addCase(deleteSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete setting';
      });
  },
});

export const { clearCurrentSetting, clearError, setCurrentSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
