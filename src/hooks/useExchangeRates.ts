import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/services/api/apiClient';

// Mapping des devises vers leurs drapeaux
const CURRENCY_FLAGS: Record<string, string> = {
    EUR: '🇪🇺',
    USD: '🇺🇸',
    GBP: '🇬🇧',
    CHF: '🇨🇭',
    GNF: '🇬🇳',
    XOF: '🇨🇮',
    XAF: '🇨🇲',
    MAD: '🇲🇦',
    NGN: '🇳🇬',
    CAD: '🇨🇦',
    DZD: '🇩🇿',
    TND: '🇹🇳',
    EGP: '🇪🇬',
    SLL: '🇸🇱',
    MRU: '🇲🇷',
    GMD: '🇬🇲',
};

// Mapping des codes pays téléphoniques vers leurs devises
const COUNTRY_CODE_TO_CURRENCY: Record<string, string> = {
    '+224': 'GNF',  // Guinée
    '+212': 'MAD',  // Maroc
    '+221': 'XOF',  // Sénégal
    '+225': 'XOF',  // Côte d'Ivoire
    '+226': 'XOF',  // Burkina Faso
    '+227': 'XOF',  // Niger
    '+228': 'XOF',  // Togo
    '+229': 'XOF',  // Bénin
    '+223': 'XOF',  // Mali
    '+234': 'NGN',  // Nigeria
    '+237': 'XAF',  // Cameroun
    '+242': 'XAF',  // Congo
    '+241': 'XAF',  // Gabon
    '+240': 'XAF',  // Guinée équatoriale
    '+235': 'XAF',  // Tchad
    '+236': 'XAF',  // Centrafrique
    '+33': 'EUR',   // France
    '+32': 'EUR',   // Belgique
    '+41': 'CHF',   // Suisse
    '+1': 'USD',    // USA/Canada
    '+44': 'GBP',   // UK
    '+213': 'DZD',  // Algérie
    '+216': 'TND',  // Tunisie
    '+20': 'EGP',   // Égypte
    '+232': 'SLL',  // Sierra Leone
    '+222': 'MRU',  // Mauritanie
    '+220': 'GMD',  // Gambie
};

// Devises cibles pour l'affichage (autres que la devise de base)
const TARGET_CURRENCIES = ['EUR', 'USD', 'GBP', 'GNF', 'XOF', 'MAD', 'CHF'];

export interface ExchangeRateItem {
    from: { flag: string; code: string };
    to: { flag: string; code: string; amount: number };
    trend: string;
    trendUp: boolean;
}

interface UseExchangeRatesResult {
    rates: ExchangeRateItem[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    lastUpdated: Date | null;
    baseCurrency: string;
}

// Données de fallback en cas d'erreur réseau
const getFallbackRates = (baseCurrency: string): ExchangeRateItem[] => {
    const baseFlag = CURRENCY_FLAGS[baseCurrency] || '🏳️';
    
    // Fallback différent selon la devise de base
    if (baseCurrency === 'GNF') {
        return [
            { from: { flag: baseFlag, code: 'GNF' }, to: { flag: '🇪🇺', code: 'EUR', amount: 0.0001 }, trend: '+0.0%', trendUp: true },
            { from: { flag: baseFlag, code: 'GNF' }, to: { flag: '🇺🇸', code: 'USD', amount: 0.00012 }, trend: '+0.0%', trendUp: true },
            { from: { flag: baseFlag, code: 'GNF' }, to: { flag: '🇨🇮', code: 'XOF', amount: 0.064 }, trend: '+0.0%', trendUp: true },
        ];
    } else if (baseCurrency === 'MAD') {
        return [
            { from: { flag: baseFlag, code: 'MAD' }, to: { flag: '🇪🇺', code: 'EUR', amount: 0.092 }, trend: '+0.0%', trendUp: true },
            { from: { flag: baseFlag, code: 'MAD' }, to: { flag: '🇬🇳', code: 'GNF', amount: 1050 }, trend: '+0.0%', trendUp: true },
            { from: { flag: baseFlag, code: 'MAD' }, to: { flag: '🇺🇸', code: 'USD', amount: 0.1 }, trend: '+0.0%', trendUp: true },
        ];
    } else if (baseCurrency === 'XOF') {
        return [
            { from: { flag: baseFlag, code: 'XOF' }, to: { flag: '🇪🇺', code: 'EUR', amount: 0.0015 }, trend: '+0.0%', trendUp: true },
            { from: { flag: baseFlag, code: 'XOF' }, to: { flag: '🇬🇳', code: 'GNF', amount: 15.6 }, trend: '+0.0%', trendUp: true },
            { from: { flag: baseFlag, code: 'XOF' }, to: { flag: '🇺🇸', code: 'USD', amount: 0.0017 }, trend: '+0.0%', trendUp: true },
        ];
    }
    
    // Fallback par défaut (EUR)
    return [
        { from: { flag: '🇪🇺', code: 'EUR' }, to: { flag: '🇬🇳', code: 'GNF', amount: 10250 }, trend: '+0.0%', trendUp: true },
        { from: { flag: '🇪🇺', code: 'EUR' }, to: { flag: '🇺🇸', code: 'USD', amount: 1.08 }, trend: '+0.0%', trendUp: true },
        { from: { flag: '🇪🇺', code: 'EUR' }, to: { flag: '🇨🇮', code: 'XOF', amount: 656 }, trend: '+0.0%', trendUp: true },
    ];
};

interface ExchangeRateApiResponse {
    base: string;
    rates: Record<string, number>;
    provider: string;
    cached: boolean;
}

/**
 * Hook pour récupérer les taux de change depuis le backend.
 * @param countryCode - Le code pays du numéro de téléphone (ex: "+224", "+212")
 */
export function useExchangeRates(countryCode?: string): UseExchangeRatesResult {
    // Déterminer la devise de base à partir du code pays
    const baseCurrency = useMemo(() => {
        if (!countryCode) return 'GNF';
        // Normaliser le code pays (ajouter + si nécessaire)
        const normalizedCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
        return COUNTRY_CODE_TO_CURRENCY[normalizedCode] || 'GNF';
    }, [countryCode]);

    const [apiRates, setApiRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchRates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Appeler l'API avec la devise de base du pays de l'utilisateur
            const response = await apiClient.get<ExchangeRateApiResponse>(
                `/api/offers/exchange-rates/?base=${baseCurrency}`
            );
            const data = response.data;
            
            if (data?.rates && Object.keys(data.rates).length > 0) {
                setApiRates(data.rates);
                setLastUpdated(new Date());
            } else {
                setError('Aucun taux disponible');
            }
        } catch (err: any) {
            console.error('Exchange rates error:', err);
            // Ne pas afficher d'erreur, utiliser le fallback silencieusement
            setError(null);
        } finally {
            setLoading(false);
        }
    }, [baseCurrency]);

    // Fetch initial et quand la devise de base change
    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    // Transformer les taux bruts en format affichable pour le ticker
    const rates = useMemo<ExchangeRateItem[]>(() => {
        if (Object.keys(apiRates).length === 0) {
            return getFallbackRates(baseCurrency);
        }

        const items: ExchangeRateItem[] = [];
        const baseFlag = CURRENCY_FLAGS[baseCurrency] || '🏳️';
        
        // Afficher les taux vers les devises cibles (excluant la devise de base)
        TARGET_CURRENCIES
            .filter(currency => currency !== baseCurrency)
            .forEach(targetCurrency => {
                const rate = apiRates[targetCurrency];
                
                if (rate === undefined || rate === 0) return;

                // Formater le montant selon la taille
                let displayAmount: number;
                if (rate >= 1) {
                    displayAmount = Math.round(rate * 100) / 100; // 2 décimales
                } else if (rate >= 0.01) {
                    displayAmount = Math.round(rate * 10000) / 10000; // 4 décimales
                } else {
                    displayAmount = rate; // Garder la précision complète
                }

                items.push({
                    from: {
                        flag: baseFlag,
                        code: baseCurrency,
                    },
                    to: {
                        flag: CURRENCY_FLAGS[targetCurrency] || '🏳️',
                        code: targetCurrency,
                        amount: displayAmount,
                    },
                    // Trend statique pour l'instant (pourrait être calculé avec historique)
                    trend: '+0.0%',
                    trendUp: true,
                });
            });

        return items.length > 0 ? items : getFallbackRates(baseCurrency);
    }, [apiRates, baseCurrency]);

    return {
        rates,
        loading,
        error,
        refresh: fetchRates,
        lastUpdated,
        baseCurrency,
    };
}

/**
 * Utilitaire pour obtenir la devise à partir d'un code pays
 */
export function getCurrencyFromCountryCode(countryCode: string): string {
    const normalizedCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    return COUNTRY_CODE_TO_CURRENCY[normalizedCode] || 'GNF';
}

/**
 * Utilitaire pour obtenir le drapeau d'une devise
 */
export function getCurrencyFlag(currency: string): string {
    return CURRENCY_FLAGS[currency] || '🏳️';
}
