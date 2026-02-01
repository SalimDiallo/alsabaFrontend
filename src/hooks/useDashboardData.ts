import { useMemo, useState } from 'react';
import { APP_MODE } from '@/constants/app';
import { useMockDb } from '@/store/useMockDb';
import { useAuthStore } from '@/store/useAuthStore';

export const useDashboardData = () => {
    const user = useAuthStore((s) => s.user);

    const wallet = useMockDb((s) => s.wallet);
    const transactions = useMockDb((s) => s.transactions);

    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const refresh = async () => {
        // mock refresh
        setLoading(true);
        setTimeout(() => setLoading(false), 400);
    };

    const fxRate = useMemo(() => {
        return {
            from: { flag: '🇲🇦', amount: 1, code: 'MAD', label: 'Dirham Marocain' },
            to: { flag: '🇬🇳', amount: 1050, code: 'GNF', label: 'Franc Guinéen' },
        };
    }, []);

    const recentTransactions = useMemo(() => transactions.slice(0, 3), [transactions]);

    if (!APP_MODE.USE_MOCK) {
        // ici plus tard tu mets le vrai fetch API
    }

    return {
        data: user
            ? {
                user,
                wallet,
                fxRate,
            }
            : null,
        recentTransactions,
        loading,
        error,
        refresh,
    };
};
