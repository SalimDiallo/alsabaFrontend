import { apiClient } from './apiClient';

export const walletService = {
    // 12) GET /api/wallet/
    getWallet: async () => (await apiClient.get('/api/wallet/')).data,

    // 13) POST /api/wallet/deposit/
    deposit: async (payload: any) => (await apiClient.post('/api/wallet/deposit/', payload)).data,

    // 14) POST /api/wallet/deposit/:id/confirm/
    confirmDeposit: async (transactionId: string, payload?: any) =>
        (await apiClient.post(`/api/wallet/deposit/${transactionId}/confirm/`, payload ?? {})).data,

    // 15) POST /api/wallet/deposit/:id/cancel/
    cancelDeposit: async (transactionId: string, payload?: any) =>
        (await apiClient.post(`/api/wallet/deposit/${transactionId}/cancel/`, payload ?? {})).data,

    // 16) POST /api/wallet/withdraw/
    withdraw: async (payload: any) => (await apiClient.post('/api/wallet/withdraw/', payload)).data,

    // 17) POST /api/wallet/withdraw/:id/confirm/
    confirmWithdraw: async (transactionId: string) =>
        (await apiClient.post(`/api/wallet/withdraw/${transactionId}/confirm/`)).data,

    // 18) POST /api/wallet/withdraw/:id/cancel/
    cancelWithdraw: async (transactionId: string) =>
        (await apiClient.post(`/api/wallet/withdraw/${transactionId}/cancel/`)).data,

    // 19) GET /api/wallet/transactions/
    listTransactions: async () => (await apiClient.get('/api/wallet/transactions/')).data,

    // 20) GET /api/wallet/transactions/:id/
    transactionDetail: async (id: string) => (await apiClient.get(`/api/wallet/transactions/${id}/`)).data,

    // 21) GET /api/wallet/transactions/:id/status/
    transactionStatus: async (id: string) => (await apiClient.get(`/api/wallet/transactions/${id}/status/`)).data,

    // 22) POST /api/wallet/transactions/:id/retry/
    retryTransaction: async (id: string) => (await apiClient.post(`/api/wallet/transactions/${id}/retry/`)).data,

    // 23) POST /api/wallet/fees/estimate/
    estimateFees: async (payload: any) => (await apiClient.post('/api/wallet/fees/estimate/', payload)).data,

    // 24) GET /api/wallet/payment-methods/
    listPaymentMethods: async () => (await apiClient.get('/api/wallet/payment-methods/')).data,

    // 25) POST /api/wallet/payment-methods/
    createPaymentMethod: async (payload: any) =>
        (await apiClient.post('/api/wallet/payment-methods/', payload)).data,

    // 26) GET /api/wallet/payment-methods/:id/
    paymentMethodDetail: async (id: string) =>
        (await apiClient.get(`/api/wallet/payment-methods/${id}/`)).data,

    // 27) DELETE /api/wallet/payment-methods/:id/
    deletePaymentMethod: async (id: string) =>
        (await apiClient.delete(`/api/wallet/payment-methods/${id}/`)).data,

    // 28) POST /api/wallet/payment-methods/:id/set-default/
    setDefaultPaymentMethod: async (id: string) =>
        (await apiClient.post(`/api/wallet/payment-methods/${id}/set-default/`)).data,
};
