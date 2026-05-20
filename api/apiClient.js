import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://api.tieutrungkien05.id.vn/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request: đính kèm Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: xử lý 401
let _onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  _onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
