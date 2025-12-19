import { create } from 'zustand';
import { Transaction } from '@/types/transaction.types';

interface TransactionState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
}

interface TransactionStore extends TransactionState {
    setTransactions: (transactions: Transaction[]) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
    transactions: [],
    isLoading: false,
    error: null,

    setTransactions: (transactions) => {
        set({ transactions, error: null });
    },

    addTransaction: (transaction) => {
        set((state) => ({
            transactions: [transaction, ...state.transactions],
        }));
    },

    updateTransaction: (transactionId, updates) => {
        set((state) => ({
            transactions: state.transactions.map((tx) =>
                tx.id === transactionId ? { ...tx, ...updates } : tx
            ),
        }));
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error, isLoading: false });
    },

    clearTransactions: () => {
        set({ transactions: [], error: null });
    },
}));