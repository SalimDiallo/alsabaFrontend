import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_MODE } from '@/constants/app';
import { useMockDb } from '@/store/useMockDb';
import { useAuthStore } from '@/store/useAuthStore';
import { walletService, WalletData, TransactionData } from '@/services/api/walletService';
import type { Currency } from '@/constants/currencies';

// Type unifié pour les transactions affichées
export interface DashboardTransaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE' | 'OTHER';
    description: string;
    amount: number;
    currency: Currency;
    createdAt: string;
    status: string;
}

// Normalise les transactions backend vers le format dashboard
const normalizeTransaction = (tx: TransactionData): DashboardTransaction => {
    const typeMap: Record<string, DashboardTransaction['type']> = {
        deposit: 'DEPOSIT',
        withdrawal: 'WITHDRAWAL',
        refund: 'DEPOSIT',
        p2p_debit: 'WITHDRAWAL',
        p2p_credit: 'DEPOSIT',
    };

    return {
        id: tx.id,
        type: typeMap[tx.transaction_type] || 'OTHER',
        description: tx.description || tx.transaction_type_display || tx.transaction_type,
        amount: tx.amount,
        currency: (tx.currency as Currency) || 'MAD',
        createdAt: tx.created_at,
        status: tx.status,
    };
};

// Type pour le wallet normalisé
export interface DashboardWallet {
    balance: number;
    currency: Currency;
    availableBalance: number;
    pendingBalance: number;
}

// Normalise le wallet backend vers le format attendu
const normalizeWallet = (wallet: WalletData): DashboardWallet => ({
    balance: wallet.balance,
    currency: (wallet.currency as Currency) || 'MAD',
    availableBalance: wallet.balance, // TODO: calculer si frozen_balance disponible
    pendingBalance: 0, // TODO: récupérer depuis le backend si disponible
});

export const useDashboardData = () => {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = !!token;

    // États pour les données
    const [wallet, setWallet] = useState<DashboardWallet | null>(null);
    const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mock data (fallback)
    const mockWallet = useMockDb((s) => s.wallet);
    const mockTransactions = useMockDb((s) => s.transactions);

    // Fonction pour charger les données
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (APP_MODE.USE_MOCK || !isAuthenticated) {
                // Mode Mock
                await new Promise((r) => setTimeout(r, 300));
                setWallet({
                    balance: mockWallet.balance,
                    currency: mockWallet.currency,
                    availableBalance: mockWallet.availableBalance,
                    pendingBalance: mockWallet.pendingBalance,
                });
                setTransactions(
                    mockTransactions.slice(0, 5).map((tx) => ({
                        id: tx.id,
                        type: tx.type as DashboardTransaction['type'],
                        description: tx.description,
                        amount: tx.amount,
                        currency: tx.currency,
                        createdAt: tx.createdAt,
                        status: tx.status,
                    }))
                );
            } else {
                // Mode Backend réel - Appels parallèles
                const [walletRes, txRes] = await Promise.all([
                    walletService.getWallet(),
                    walletService.listTransactions({ limit: 5 }),
                ]);

                setWallet(normalizeWallet(walletRes));
                setTransactions(txRes.transactions.map(normalizeTransaction));
            }
        } catch (e: any) {
            console.error('[useDashboardData] Erreur:', e);
            setError(e?.message || 'Impossible de charger les données');

            // Fallback sur mock en cas d'erreur
            setWallet({
                balance: mockWallet.balance,
                currency: mockWallet.currency,
                availableBalance: mockWallet.availableBalance,
                pendingBalance: mockWallet.pendingBalance,
            });
            setTransactions(
                mockTransactions.slice(0, 5).map((tx) => ({
                    id: tx.id,
                    type: tx.type as DashboardTransaction['type'],
                    description: tx.description,
                    amount: tx.amount,
                    currency: tx.currency,
                    createdAt: tx.createdAt,
                    status: tx.status,
                }))
            );
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, mockWallet, mockTransactions]);

    // Charger les données au montage
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Taux de change (statique pour l'instant, TODO: récupérer depuis backend)
    const fxRate = useMemo(() => {
        return {
            from: { flag: '🇲🇦', amount: 1, code: 'MAD', label: 'Dirham Marocain' },
            to: { flag: '🇬🇳', amount: 1050, code: 'GNF', label: 'Franc Guinéen' },
        };
    }, []);

    // Transactions récentes (max 3)
    const recentTransactions = useMemo(() => transactions.slice(0, 3), [transactions]);

    return {
        data: user && wallet
            ? {
                user,
                wallet,
                fxRate,
            }
            : null,
        recentTransactions,
        loading,
        error,
        refresh: fetchData,
    };
};
