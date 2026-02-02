import { useMemo, useState } from 'react';
import { APP_MODE } from '@/constants/app';
import { useMockDb } from '@/store/useMockDb';
import { useAuthStore } from '@/store/useAuthStore';

// Plus tard (quand API ON)
// import { walletService } from '@/services/api/walletService';
// import { profileService } from '@/services/api/profileService';

export const useDashboardData = () => {
    const user = useAuthStore((s) => s.user);

    const wallet = useMockDb((s) => s.wallet);
    const transactions = useMockDb((s) => s.transactions);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        setError(null);

        try {
            if (APP_MODE.USE_MOCK) {
                // petite latence pour UX
                await new Promise((r) => setTimeout(r, 400));
                return;
            }

            // ---------------------------
            // API MODE (plus tard)
            // const profile = await profileService.getProfile();
            // const wallet = await walletService.getWallet();
            // ...
            // ---------------------------
        } catch (e) {
            setError('Impossible de rafraîchir les données');
        } finally {
            setLoading(false);
        }
    };

    const fxRate = useMemo(() => {
        return {
            from: { flag: '🇲🇦', amount: 1, code: 'MAD', label: 'Dirham Marocain' },
            to: { flag: '🇬🇳', amount: 1050, code: 'GNF', label: 'Franc Guinéen' },
        };
    }, []);

    const recentTransactions = useMemo(() => transactions.slice(0, 3), [transactions]);

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
