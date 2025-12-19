import { apiClient } from './apiClient';
import { Transaction, CreateTransactionRequest } from '@/types/transaction.types';

export const transactionService = {
    // Créer une transaction
    createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
        return apiClient.post<Transaction>('/transactions', data);
    },

    // Récupérer toutes les transactions
    getTransactions: async (limit = 20, offset = 0): Promise<Transaction[]> => {
        return apiClient.get<Transaction[]>(`/transactions?limit=${limit}&offset=${offset}`);
    },

    // Récupérer une transaction par ID
    getTransactionById: async (transactionId: string): Promise<Transaction> => {
        return apiClient.get<Transaction>(`/transactions/${transactionId}`);
    },

    // Confirmer une transaction
    confirmTransaction: async (transactionId: string): Promise<Transaction> => {
        return apiClient.post<Transaction>(`/transactions/${transactionId}/confirm`);
    },

    // Annuler une transaction
    cancelTransaction: async (transactionId: string): Promise<Transaction> => {
        return apiClient.post<Transaction>(`/transactions/${transactionId}/cancel`);
    },
};
