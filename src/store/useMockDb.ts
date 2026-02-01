import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Offer, OfferStatus } from '@/types/offer.types';

export type Currency = 'MAD' | 'GNF';

export type TxType = 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE' | 'OFFER_CREATED' | 'OFFER_ACCEPTED';
export type Transaction = {
    id: string;
    type: TxType;
    description: string;
    amount: number;
    currency: Currency;
    createdAt: string;
    status: 'pending' | 'success' | 'failed';
};

export type Wallet = {
    balance: number;
    availableBalance: number;
    pendingBalance: number;
    currency: Currency;
};

export type PaymentMethodType = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type PaymentMethod = {
    id: string;
    type: PaymentMethodType;
    label: string;
    createdAt: string;
    isDefault: boolean;
};

export type NotificationItem = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
};

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const now = () => new Date().toISOString();

type MockDbState = {
    wallet: Wallet;
    offers: Offer[];
    transactions: Transaction[];
    paymentMethods: PaymentMethod[];
    notifications: NotificationItem[];

    // Wallet
    fundWallet: (amount: number, method: PaymentMethodType) => void;

    // Offers
    createOffer: (payload: {
        userName?: string;
        sendAmount: number;
        sendCurrency: Currency;
        receiveCurrency: Currency;
        exchangeRate: number;
    }) => Offer;

    acceptOffer: (offerId: string) => void;
    closeOffer: (offerId: string) => void;

    // Payment
    addPaymentMethod: (type: PaymentMethodType) => PaymentMethod;
    setDefaultPaymentMethod: (id: string) => void;
    removePaymentMethod: (id: string) => void;

    // Notifications
    pushNotification: (title: string, body: string) => void;
    markNotificationRead: (id: string) => void;

    resetMock: () => void;
};

const initialState: Omit<
    MockDbState,
    | 'fundWallet'
    | 'createOffer'
    | 'acceptOffer'
    | 'closeOffer'
    | 'addPaymentMethod'
    | 'setDefaultPaymentMethod'
    | 'removePaymentMethod'
    | 'pushNotification'
    | 'markNotificationRead'
    | 'resetMock'
> = {
    wallet: {
        balance: 1250,
        availableBalance: 1250,
        pendingBalance: 0,
        currency: 'MAD',
    },
    offers: [
        // Petite data de base pour tester UI
        {
            id: uid(),
            userName: 'Marcellin',
            sendAmount: 500,
            sendCurrency: 'MAD',
            receiveAmount: 500 * 1050,
            receiveCurrency: 'GNF',
            exchangeRate: 1050,
            status: 'ACTIVE',
            createdAt: now(),
        },
    ],
    transactions: [
        {
            id: uid(),
            type: 'DEPOSIT',
            description: 'Dépôt initial (mock)',
            amount: 1250,
            currency: 'MAD',
            createdAt: now(),
            status: 'success',
        },
    ],
    paymentMethods: [
        {
            id: uid(),
            type: 'CARD',
            label: 'Carte Bancaire (mock)',
            createdAt: now(),
            isDefault: true,
        },
    ],
    notifications: [
        {
            id: uid(),
            title: 'Bienvenue 👋',
            body: "Mode fictif actif : tu peux finir tous les parcours sans backend.",
            createdAt: now(),
            read: false,
        },
    ],
};

export const useMockDb = create<MockDbState>()(
    persist(
        (set, get) => ({
            ...initialState,

            pushNotification: (title, body) => {
                const item: NotificationItem = { id: uid(), title, body, createdAt: now(), read: false };
                set({ notifications: [item, ...get().notifications] });
            },

            markNotificationRead: (id) => {
                set({
                    notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
                });
            },

            fundWallet: (amount, method) => {
                const w = get().wallet;

                const tx: Transaction = {
                    id: uid(),
                    type: 'DEPOSIT',
                    description: `Alimentation wallet via ${method} (mock)`,
                    amount,
                    currency: w.currency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    wallet: {
                        ...w,
                        balance: w.balance + amount,
                        availableBalance: w.availableBalance + amount,
                    },
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification('Wallet alimenté', `+${amount} ${w.currency} (mock)`);
            },

            createOffer: ({ userName = 'Moi', sendAmount, sendCurrency, receiveCurrency, exchangeRate }) => {
                const receiveAmount = Math.round(sendAmount * exchangeRate);

                const offer: Offer = {
                    id: uid(),
                    userName,
                    sendAmount,
                    sendCurrency,
                    receiveAmount,
                    receiveCurrency,
                    exchangeRate,
                    status: 'ACTIVE',
                    createdAt: now(),
                };

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_CREATED',
                    description: `Offre créée ${sendCurrency} → ${receiveCurrency} (mock)`,
                    amount: sendAmount,
                    currency: sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: [offer, ...get().offers],
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification(
                    'Offre créée',
                    `${sendAmount} ${sendCurrency} à ${exchangeRate} ${receiveCurrency}/1 ${sendCurrency} (mock)`
                );

                return offer;
            },

            acceptOffer: (offerId) => {
                const offer = get().offers.find((o) => o.id === offerId);
                if (!offer) return;

                // On simule que l’offre est “acceptée” et donc fermée côté liste
                const nextOffers = get().offers.map((o) =>
                    o.id === offerId ? { ...o, status: 'CLOSED' as OfferStatus } : o
                );

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_ACCEPTED',
                    description: `Offre acceptée (${offer.sendCurrency} → ${offer.receiveCurrency}) (mock)`,
                    amount: offer.sendAmount,
                    currency: offer.sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: nextOffers,
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification('Offre acceptée', `Offre de ${offer.userName} acceptée (mock)`);
            },

            closeOffer: (offerId) => {
                set({
                    offers: get().offers.map((o) => (o.id === offerId ? { ...o, status: 'CLOSED' as OfferStatus } : o)),
                });
            },

            addPaymentMethod: (type) => {
                const mapLabel: Record<PaymentMethodType, string> = {
                    CARD: 'Carte Bancaire',
                    MOBILE_MONEY: 'Mobile Money',
                    BANK_TRANSFER: 'Virement Bancaire',
                };

                const list = get().paymentMethods;
                const hasDefault = list.some((m) => m.isDefault);

                const method: PaymentMethod = {
                    id: uid(),
                    type,
                    label: `${mapLabel[type]} (mock)`,
                    createdAt: now(),
                    isDefault: !hasDefault,
                };

                set({ paymentMethods: [method, ...list] });
                get().pushNotification('Moyen de paiement ajouté', `${method.label}`);
                return method;
            },

            setDefaultPaymentMethod: (id) => {
                set({
                    paymentMethods: get().paymentMethods.map((m) => ({ ...m, isDefault: m.id === id })),
                });
                get().pushNotification('Moyen de paiement', 'Défaut mis à jour (mock)');
            },

            removePaymentMethod: (id) => {
                const list = get().paymentMethods.filter((m) => m.id !== id);

                const hasDefault = list.some((m) => m.isDefault);
                const normalized = hasDefault ? list : list.map((m, i) => (i === 0 ? { ...m, isDefault: true } : m));

                set({ paymentMethods: normalized });
                get().pushNotification('Moyen de paiement supprimé', 'Suppression effectuée (mock)');
            },

            resetMock: () => set({ ...initialState }),
        }),
        {
            name: '@alsaba_mock_db',
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
        }
    )
);
