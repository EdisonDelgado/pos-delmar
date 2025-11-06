import apiClient from './api';
import type { Setting, CreateSettingRequest, UpdateSettingRequest } from '@/types';

export const settingsService = {
  async getSettings(): Promise<Setting[]> {
    const response = await apiClient.get<Setting[]>('/settings');
    return response.data;
  },

  async getSettingById(id: number): Promise<Setting> {
    const response = await apiClient.get<Setting>(`/settings/${id}`);
    return response.data;
  },

  async getSettingByKey(key: string): Promise<Setting> {
    const response = await apiClient.get<Setting>(`/settings/key/${key}`);
    return response.data;
  },

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    const response = await apiClient.get<Setting[]>(`/settings/category/${category}`);
    return response.data;
  },

  async createSetting(setting: CreateSettingRequest): Promise<Setting> {
    const response = await apiClient.post<Setting>('/settings', setting);
    return response.data;
  },

  async updateSetting(id: number, setting: UpdateSettingRequest): Promise<Setting> {
    const response = await apiClient.patch<Setting>(`/settings/${id}`, setting);
    return response.data;
  },

  async deleteSetting(id: number): Promise<void> {
    await apiClient.delete(`/settings/${id}`);
  },
};
