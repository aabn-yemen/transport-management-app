import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config, storageKeys } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(storageKeys.token);
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to get token', e);
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(storageKeys.refreshToken);
        if (refreshToken) {
          const { data } = await axios.post(`${config.apiUrl}/auth/refresh-token`, { refreshToken });
          await SecureStore.setItemAsync(storageKeys.token, data.data.token);
          await SecureStore.setItemAsync(storageKeys.refreshToken, data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (e) {
        console.warn('Token refresh failed', e);
      }
      await SecureStore.deleteItemAsync(storageKeys.token);
      await SecureStore.deleteItemAsync(storageKeys.refreshToken);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
