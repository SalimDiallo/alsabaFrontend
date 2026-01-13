import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '@/constants/config';
import { getToken } from '@/services/storage/asyncStorage';

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.HEADERS,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            async (config) => {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(this.handleError(error));
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: AxiosError): ApiError {
        // Log en dev pour debug
        if (__DEV__) {
            console.log('🔴 API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
        }

        if (error.response) {
            // Erreur de réponse du serveur
            const data = error.response.data as any;
            
            // Django peut retourner: error, detail, message, ou des erreurs de champs
            let message = 'Une erreur est survenue';
            
            if (data?.error) {
                message = data.error;
            } else if (data?.detail) {
                message = data.detail;
            } else if (data?.message) {
                message = data.message;
            } else if (data?.phone_number) {
                // Erreur de validation Django sur un champ
                message = Array.isArray(data.phone_number) 
                    ? data.phone_number[0] 
                    : data.phone_number;
            } else if (data?.country_code) {
                message = Array.isArray(data.country_code) 
                    ? data.country_code[0] 
                    : data.country_code;
            } else if (data?.non_field_errors) {
                message = Array.isArray(data.non_field_errors) 
                    ? data.non_field_errors[0] 
                    : data.non_field_errors;
            }

            return {
                message,
                code: data?.code || String(error.response.status),
                status: error.response.status,
            };
        } else if (error.request) {
            // Pas de réponse reçue - problème réseau
            return {
                message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
                code: 'NETWORK_ERROR',
            };
        } else {
            // Erreur de configuration
            return {
                message: error.message || 'Une erreur est survenue',
                code: 'REQUEST_ERROR',
            };
        }
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}

export const apiClient = new ApiClient();