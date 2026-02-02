import { apiClient } from './apiClient';

export const notificationsService = {
    // 42) GET /api/notifications/
    list: async () => (await apiClient.get('/api/notifications/')).data,

    // 43) POST /api/notifications/:id/read/
    markRead: async (id: string) => (await apiClient.post(`/api/notifications/${id}/read/`)).data,

    // 44) POST /api/notifications/read_all/
    readAll: async () => (await apiClient.post('/api/notifications/read_all/')).data,

    // 45) POST /api/notifications/register-device/
    registerDevice: async (payload: any) => (await apiClient.post('/api/notifications/register-device/', payload)).data,
};
