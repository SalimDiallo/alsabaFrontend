import { apiClient } from './apiClient';

export const offersService = {
    // 31) GET /api/offers/
    list: async () => (await apiClient.get('/api/offers/')).data,

    // 32) POST /api/offers/create/
    create: async (payload: any) => (await apiClient.post('/api/offers/create/', payload)).data,

    // 33) GET /api/offers/:id/
    detail: async (id: string) => (await apiClient.get(`/api/offers/${id}/`)).data,

    // 34) PATCH /api/offers/:id/update/
    update: async (id: string, payload: any) => (await apiClient.patch(`/api/offers/${id}/update/`, payload)).data,

    // 35) POST /api/offers/:id/accept/
    accept: async (id: string, payload: any) => (await apiClient.post(`/api/offers/${id}/accept/`, payload)).data,

    // 36) POST /api/offers/:id/validate/
    validate: async (id: string, payload: any) => (await apiClient.post(`/api/offers/${id}/validate/`, payload)).data,

    // 37) POST /api/offers/:id/confirm/
    confirm: async (id: string) => (await apiClient.post(`/api/offers/${id}/confirm/`)).data,

    // 38) POST /api/offers/:id/cancel/
    cancel: async (id: string) => (await apiClient.post(`/api/offers/${id}/cancel/`)).data,

    // 39) POST /api/offers/:id/dispute/
    dispute: async (id: string, payload: any) => (await apiClient.post(`/api/offers/${id}/dispute/`, payload)).data,
};
