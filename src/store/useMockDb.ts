import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Offer, OfferStatus, Currency } from '@/types/offer.types';

export type TxType =
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'EXCHANGE'
    | 'OFFER_CREATED'
    | 'OFFER_ACCEPTED'
    | 'OFFER_VALIDATED'
    | 'OFFER_CONFIRMED'
    | 'OFFER_CANCELLED'
    | 'OFFER_DISPUTED';

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

    getOfferById: (id: string) => Offer | undefined;

    acceptOffer: (offerId: string, buyerPhone: string, buyerName?: string) => void;
    validateOffer: (offerId: string, sellerPhone: string, sellerName?: string) => void;
    confirmOffer: (offerId: string) => void;

    cancelOffer: (offerId: string, reason?: string) => void;
    disputeOffer: (offerId: string, reason: string) => void;

    // Payment
    addPaymentMethod: (type: PaymentMethodType, label?: string) => PaymentMethod;
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
    | 'getOfferById'
    | 'acceptOffer'
    | 'validateOffer'
    | 'confirmOffer'
    | 'cancelOffer'
    | 'disputeOffer'
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
        {
            id: uid(),
            userName: 'Marcellin',
            sendAmount: 500,
            sendCurrency: 'MAD',
            receiveAmount: 500 * 1050,
            receiveCurrency: 'GNF',
            exchangeRate: 1050,
            status: 'ACTIVE',
            seller: { name: 'Marcellin' },
            createdAt: now(),
            updatedAt: now(),
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
                    seller: { name: userName },
                    createdAt: now(),
                    updatedAt: now(),
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

            getOfferById: (id) => get().offers.find((o) => o.id === id),

            acceptOffer: (offerId, buyerPhone, buyerName) => {
                const offer = get().offers.find((o) => o.id === offerId);
                if (!offer) return;
                if (offer.status !== 'ACTIVE') return;

                const next: Offer = {
                    ...offer,
                    status: 'ACCEPTED',
                    buyer: { name: buyerName ?? 'Acheteur', phone: buyerPhone },
                    updatedAt: now(),
                };

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_ACCEPTED',
                    description: `Offre acceptée (buyer a saisi son numéro) (mock)`,
                    amount: offer.sendAmount,
                    currency: offer.sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: get().offers.map((o) => (o.id === offerId ? next : o)),
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification(
                    "Offre acceptée",
                    `Acheteur a saisi le numéro: ${buyerPhone} (mock)`
                );
            },

            validateOffer: (offerId, sellerPhone, sellerName) => {
                const offer = get().offers.find((o) => o.id === offerId);
                if (!offer) return;
                if (offer.status !== 'ACCEPTED') return;

                const next: Offer = {
                    ...offer,
                    status: 'VALIDATED',
                    seller: { name: sellerName ?? offer.userName ?? 'Vendeur', phone: sellerPhone },
                    updatedAt: now(),
                };

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_VALIDATED',
                    description: `Offre validée (seller a saisi son numéro) (mock)`,
                    amount: offer.sendAmount,
                    currency: offer.sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: get().offers.map((o) => (o.id === offerId ? next : o)),
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification(
                    "Offre validée",
                    `Vendeur a saisi le numéro: ${sellerPhone} (mock)`
                );
            },

            confirmOffer: (offerId) => {
                const offer = get().offers.find((o) => o.id === offerId);
                if (!offer) return;
                if (offer.status !== 'VALIDATED') return;

                const next: Offer = { ...offer, status: 'COMPLETED', updatedAt: now() };

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_CONFIRMED',
                    description: `Offre confirmée (COMPLETED) (mock)`,
                    amount: offer.sendAmount,
                    currency: offer.sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: get().offers.map((o) => (o.id === offerId ? next : o)),
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification('Offre terminée', `Transaction complétée (mock)`);
            },

            cancelOffer: (offerId, reason) => {
                const offer = get().offers.find((o) => o.id === offerId);
                if (!offer) return;

                const next: Offer = { ...offer, status: 'CANCELLED', updatedAt: now() };

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_CANCELLED',
                    description: `Offre annulée (mock)${reason ? ` - ${reason}` : ''}`,
                    amount: offer.sendAmount,
                    currency: offer.sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: get().offers.map((o) => (o.id === offerId ? next : o)),
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification('Offre annulée', reason ? reason : 'Annulation (mock)');
            },

            disputeOffer: (offerId, reason) => {
                const offer = get().offers.find((o) => o.id === offerId);
                if (!offer) return;

                const next: Offer = { ...offer, status: 'DISPUTED', disputeReason: reason, updatedAt: now() };

                const tx: Transaction = {
                    id: uid(),
                    type: 'OFFER_DISPUTED',
                    description: `Litige ouvert (mock) - ${reason}`,
                    amount: offer.sendAmount,
                    currency: offer.sendCurrency,
                    createdAt: now(),
                    status: 'success',
                };

                set({
                    offers: get().offers.map((o) => (o.id === offerId ? next : o)),
                    transactions: [tx, ...get().transactions],
                });

                get().pushNotification('Litige', reason);
            },

            addPaymentMethod: (type, customLabel) => {
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
                    label: customLabel || `${mapLabel[type]} (mock)`,
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
