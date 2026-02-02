import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/config/env';

const ACCESS_TOKEN_KEY = '@alsax_access_token';
const REFRESH_TOKEN_KEY = '@alsax_refresh_token';

export const apiClient: AxiosInstance = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers = config.headers ?? {};
    config.headers.Accept = 'application/json';
    return config;
});

// --- Refresh handling (simple + safe) ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
};

async function refreshAccessToken() {
    const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) throw new Error('No refresh token');

    const res = await axios.post(
        `${ENV.API_BASE_URL}/api/accounts/auth/refresh/`,
        { refresh },
        { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
    );

    const newAccess = res.data?.access ?? res.data?.access_token ?? res.data?.token;
    const newRefresh = res.data?.refresh;

    if (!newAccess) throw new Error('Invalid refresh response');

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
    if (newRefresh) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);

    return newAccess as string;
}

apiClient.interceptors.response.use(
    (r) => r,
    async (error: AxiosError<any>) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (e) {
                processQueue(e, null);
                // Optionnel : clear storage + redirect auth
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export async function saveTokens(access: string, refresh: string) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export async function clearTokens() {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}
