import { apiClient } from './apiClient';
import { Wallet, FundWalletRequest } from '@/types/wallet.types';

export const walletService = {
    // Récupérer le wallet
    getWallet: async (): Promise<Wallet> => {
        return apiClient.get<Wallet>('/wallet');
    },

    // Alimenter le wallet
    fundWallet: async (data: FundWalletRequest): Promise<Wallet> => {
        return apiClient.post<Wallet>('/wallet/fund', data);
    },

    // Historique du wallet
    getWalletHistory: async (limit = 20, offset = 0) => {
        return apiClient.get(`/wallet/history?limit=${limit}&offset=${offset}`);
    },
};
