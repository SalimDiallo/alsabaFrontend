import { APP_MODE } from '@/constants/app';
import { apiClient } from './apiClient';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const now = () => new Date().toISOString();

// --- Types backend ---

export interface WalletData {
    id: string;
    balance: number;
    currency: string;
    currency_display?: string;
    is_active?: boolean;
    updated_at?: string;
}

export interface TransactionData {
    id: string;
    transaction_type: string;   // deposit, withdrawal, refund, p2p_debit, p2p_credit
    transaction_type_display?: string;
    payment_method?: string;
    amount: number;
    fee?: number;
    currency: string;
    status: string;             // pending, processing, completed, failed, cancelled
    status_display?: string;
    flutterwave_reference?: string;
    description?: string;
    created_at: string;
    completed_at?: string;
}

// Mock data local
let mockWallet: WalletData = {
    id: 'mock-wallet-id',
    balance: 1250,
    currency: 'MAD',
    currency_display: 'Dirham Marocain',
    is_active: true,
    updated_at: now(),
};

let mockTransactions: TransactionData[] = [
    {
        id: uid(),
        transaction_type: 'deposit',
        transaction_type_display: 'Dépôt',
        amount: 1250,
        currency: 'MAD',
        status: 'completed',
        status_display: 'Terminée',
        description: 'Dépôt initial (mock)',
        created_at: now(),
    },
];

export const walletService = {
    // GET /api/wallet/
    getWallet: async (): Promise<WalletData> => {
        if (APP_MODE.USE_MOCK) {
            await wait(300);
            return { ...mockWallet };
        }
        const res = await apiClient.get('/api/wallet/');
        return res.data?.wallet ?? res.data;
    },

    // POST /api/wallet/deposit/
    deposit: async (payload: {
        amount: number;
        payment_method: 'card' | 'orange_money';
        redirect_url?: string;
        save_payment_method?: boolean;
        payment_method_label?: string;
    }): Promise<{ success: boolean; transaction: TransactionData; payment_link?: string; reference?: string; amount: number; fee: number; total: number; currency: string }> => {
        if (APP_MODE.USE_MOCK) {
            await wait(600);
            const fee = payload.payment_method === 'card' ? payload.amount * 0.015 : payload.amount * 0.01;
            const tx: TransactionData = {
                id: uid(),
                transaction_type: 'deposit',
                transaction_type_display: 'Dépôt',
                payment_method: payload.payment_method,
                amount: payload.amount,
                fee,
                currency: mockWallet.currency,
                status: 'completed',
                description: `Dépôt via ${payload.payment_method === 'card' ? 'carte' : 'Orange Money'} (mock)`,
                created_at: now(),
                completed_at: now(),
            };
            mockTransactions = [tx, ...mockTransactions];
            mockWallet = { ...mockWallet, balance: mockWallet.balance + payload.amount };
            return { success: true, transaction: tx, amount: payload.amount, fee, total: payload.amount + fee, currency: mockWallet.currency };
        }
        const res = await apiClient.post('/api/wallet/deposit/', payload);
        return res.data;
    },

    // POST /api/wallet/deposit/:id/confirm/
    confirmDeposit: async (transactionId: string): Promise<any> => {
        if (APP_MODE.USE_MOCK) { await wait(300); return { success: true }; }
        const res = await apiClient.post(`/api/wallet/deposit/${transactionId}/confirm/`, {});
        return res.data;
    },

    // POST /api/wallet/deposit/:id/cancel/
    cancelDeposit: async (transactionId: string): Promise<any> => {
        if (APP_MODE.USE_MOCK) { await wait(300); return { success: true }; }
        const res = await apiClient.post(`/api/wallet/deposit/${transactionId}/cancel/`, {});
        return res.data;
    },

    // POST /api/wallet/withdraw/
    withdraw: async (payload: {
        amount: number;
        payment_method: 'card' | 'orange_money';
        orange_money_number?: string;
        account_number?: string;
        bank_code?: string;
        account_name?: string;
    }): Promise<{ success: boolean; transaction: TransactionData; reference?: string; amount: number; fee: number; total_deducted: number; currency: string }> => {
        if (APP_MODE.USE_MOCK) {
            await wait(600);
            const fee = 0;
            const tx: TransactionData = {
                id: uid(),
                transaction_type: 'withdrawal',
                transaction_type_display: 'Retrait',
                payment_method: payload.payment_method,
                amount: payload.amount,
                fee,
                currency: mockWallet.currency,
                status: 'completed',
                description: `Retrait (mock)`,
                created_at: now(),
                completed_at: now(),
            };
            mockTransactions = [tx, ...mockTransactions];
            mockWallet = { ...mockWallet, balance: Math.max(0, mockWallet.balance - payload.amount) };
            return { success: true, transaction: tx, amount: payload.amount, fee, total_deducted: payload.amount + fee, currency: mockWallet.currency };
        }
        const res = await apiClient.post('/api/wallet/withdraw/', payload);
        return res.data;
    },

    // GET /api/wallet/transactions/
    listTransactions: async (params?: { limit?: number; offset?: number; transaction_type?: string; status?: string }): Promise<{ transactions: TransactionData[]; count?: number }> => {
        if (APP_MODE.USE_MOCK) {
            await wait(300);
            const limit = params?.limit ?? 20;
            const offset = params?.offset ?? 0;
            return { transactions: mockTransactions.slice(offset, offset + limit), count: mockTransactions.length };
        }
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        if (params?.transaction_type) query.set('transaction_type', params.transaction_type);
        if (params?.status) query.set('status', params.status);
        const res = await apiClient.get(`/api/wallet/transactions/?${query}`);
        // Normalise selon format backend
        const data = res.data;
        return {
            transactions: data?.transactions ?? data?.results ?? (Array.isArray(data) ? data : []),
            count: data?.count ?? data?.total,
        };
    },

    // GET /api/wallet/transactions/:id/
    transactionDetail: async (id: string): Promise<TransactionData> => {
        if (APP_MODE.USE_MOCK) {
            await wait(200);
            const tx = mockTransactions.find((t) => t.id === id);
            if (!tx) throw new Error('Transaction introuvable');
            return tx;
        }
        const res = await apiClient.get(`/api/wallet/transactions/${id}/`);
        return res.data?.transaction ?? res.data;
    },

    // POST /api/wallet/fees/estimate/
    estimateFees: async (payload: { amount: number; payment_method: string }): Promise<{ fee: number; total: number }> => {
        if (APP_MODE.USE_MOCK) {
            await wait(150);
            const fee = payload.payment_method === 'card' ? payload.amount * 0.015 : payload.payment_method === 'orange_money' ? payload.amount * 0.01 : 0;
            return { fee, total: payload.amount + fee };
        }
        const res = await apiClient.post('/api/wallet/fees/estimate/', payload);
        return res.data;
    },

    // GET /api/wallet/payment-methods/
    listPaymentMethods: async (): Promise<any[]> => {
        if (APP_MODE.USE_MOCK) { await wait(200); return []; }
        const res = await apiClient.get('/api/wallet/payment-methods/');
        return res.data?.payment_methods ?? res.data?.results ?? res.data ?? [];
    },
};
