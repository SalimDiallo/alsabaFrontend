import { create } from 'zustand';
import { Wallet } from '@/types/wallet.types';

interface WalletState {
    wallet: Wallet | null;
    isLoading: boolean;
    error: string | null;
}

interface WalletStore extends WalletState {
    setWallet: (wallet: Wallet) => void;
    updateBalance: (balance: number, availableBalance: number, pendingBalance: number) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearWallet: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    wallet: null,
    isLoading: false,
    error: null,

    setWallet: (wallet) => {
        set({ wallet, error: null });
    },

    updateBalance: (balance, availableBalance, pendingBalance) => {
        set((state) => ({
            wallet: state.wallet
                ? { ...state.wallet, balance, availableBalance, pendingBalance }
                : null,
        }));
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error, isLoading: false });
    },

    clearWallet: () => {
        set({ wallet: null, error: null, isLoading: false });
    },
}));
