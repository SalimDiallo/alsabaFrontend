import { APP_MODE } from '@/constants/app';
import { apiClient } from './apiClient';
import { Offer, CreateOfferPayload, AcceptOfferPayload, ValidateOfferPayload, normalizeOffer } from '@/types/offer.types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const now = () => new Date().toISOString();

// Mock data local (fallback si USE_MOCK=true)
let mockOffers: Offer[] = [
    {
        id: uid(),
        user: { id: 'mock-user-id', first_name: 'Marcellin', last_name: '' },
        amount_sell: 500,
        currency_sell: 'MAD',
        amount_buy: 525000,
        currency_buy: 'GNF',
        rate: 1050,
        status: 'OPEN',
        created_at: now(),
        b1_confirmed: false,
        b2_confirmed: false,
    },
];

export const offersService = {
    // GET /api/offers/
    list: async (): Promise<Offer[]> => {
        if (APP_MODE.USE_MOCK) {
            await wait(400);
            return mockOffers.map(normalizeOffer);
        }
        const res = await apiClient.get('/api/offers/');
        const data = res.data?.offers ?? res.data?.results ?? res.data ?? [];
        return (Array.isArray(data) ? data : []).map(normalizeOffer);
    },

    // GET /api/offers/:id/
    detail: async (id: string): Promise<Offer> => {
        if (APP_MODE.USE_MOCK) {
            await wait(250);
            const offer = mockOffers.find((o) => o.id === id);
            if (!offer) throw new Error('Offre introuvable');
            return normalizeOffer(offer);
        }
        const res = await apiClient.get(`/api/offers/${id}/`);
        return normalizeOffer(res.data?.offer ?? res.data);
    },

    // POST /api/offers/create/
    create: async (payload: CreateOfferPayload): Promise<Offer> => {
        if (APP_MODE.USE_MOCK) {
            await wait(500);
            const offer: Offer = {
                id: uid(),
                user: { id: 'mock-user-id', first_name: 'Moi', last_name: '' },
                amount_sell: payload.amount_sell,
                currency_sell: payload.currency_sell,
                amount_buy: payload.amount_buy,
                currency_buy: payload.currency_buy,
                rate: payload.amount_buy / payload.amount_sell,
                status: 'OPEN',
                created_at: now(),
                b1_confirmed: false,
                b2_confirmed: false,
            };
            mockOffers = [offer, ...mockOffers];
            return normalizeOffer(offer);
        }
        const res = await apiClient.post('/api/offers/create/', payload);
        return normalizeOffer(res.data?.offer ?? res.data);
    },

    // POST /api/offers/:id/accept/
    accept: async (id: string, payload: Omit<AcceptOfferPayload, 'offer_id'>): Promise<Offer> => {
        if (APP_MODE.USE_MOCK) {
            await wait(400);
            const idx = mockOffers.findIndex((o) => o.id === id);
            if (idx === -1) throw new Error('Offre introuvable');
            if (mockOffers[idx].status !== 'OPEN') throw new Error('Offre non disponible');
            mockOffers[idx] = { ...mockOffers[idx], status: 'ACCEPTED' };
            return normalizeOffer(mockOffers[idx]);
        }
        const res = await apiClient.post(`/api/offers/${id}/accept/`, { offer_id: id, ...payload });
        return normalizeOffer(res.data?.offer ?? res.data);
    },

    // POST /api/offers/:id/validate/
    validate: async (id: string, payload: Omit<ValidateOfferPayload, 'offer_id'>): Promise<Offer> => {
        if (APP_MODE.USE_MOCK) {
            await wait(400);
            const idx = mockOffers.findIndex((o) => o.id === id);
            if (idx === -1) throw new Error('Offre introuvable');
            if (mockOffers[idx].status !== 'ACCEPTED') throw new Error('Offre non acceptée');
            mockOffers[idx] = { ...mockOffers[idx], status: 'LOCKED' };
            return normalizeOffer(mockOffers[idx]);
        }
        const res = await apiClient.post(`/api/offers/${id}/validate/`, { offer_id: id, ...payload });
        return normalizeOffer(res.data?.offer ?? res.data);
    },

    // POST /api/offers/:id/confirm/
    confirm: async (id: string): Promise<Offer> => {
        if (APP_MODE.USE_MOCK) {
            await wait(400);
            const idx = mockOffers.findIndex((o) => o.id === id);
            if (idx === -1) throw new Error('Offre introuvable');
            mockOffers[idx] = { ...mockOffers[idx], status: 'COMPLETED' };
            return normalizeOffer(mockOffers[idx]);
        }
        const res = await apiClient.post(`/api/offers/${id}/confirm/`);
        return normalizeOffer(res.data?.offer ?? res.data);
    },

    // POST /api/offers/:id/cancel/
    cancel: async (id: string): Promise<Offer> => {
        if (APP_MODE.USE_MOCK) {
            await wait(300);
            const idx = mockOffers.findIndex((o) => o.id === id);
            if (idx === -1) throw new Error('Offre introuvable');
            mockOffers[idx] = { ...mockOffers[idx], status: 'CANCELLED' };
            return normalizeOffer(mockOffers[idx]);
        }
        const res = await apiClient.post(`/api/offers/${id}/cancel/`);
        return normalizeOffer(res.data?.offer ?? res.data);
    },

    // POST /api/offers/:id/disputes/ (nouveau endpoint)
    dispute: async (id: string, payload: { reason: string; evidence?: object }): Promise<any> => {
        if (APP_MODE.USE_MOCK) {
            await wait(300);
            const idx = mockOffers.findIndex((o) => o.id === id);
            if (idx === -1) throw new Error('Offre introuvable');
            mockOffers[idx] = { ...mockOffers[idx], status: 'DISPUTE' };
            return { success: true };
        }
        const res = await apiClient.post(`/api/offers/${id}/disputes/`, payload);
        return res.data;
    },

    // GET /api/offers/exchange-rates/?base=MAD
    // Retourne { [toCurrency]: rate } ex: { GNF: 1050.5, USD: 0.097, ... }
    exchangeRates: async (base: string = 'MAD'): Promise<Record<string, number>> => {
        if (APP_MODE.USE_MOCK) {
            await wait(200);
            if (base === 'MAD') return { GNF: 1050, USD: 0.097 };
            if (base === 'GNF') return { MAD: 0.00095, USD: 0.000093 };
            return {};
        }
        const res = await apiClient.get('/api/offers/exchange-rates/', { params: { base: base.toUpperCase() } });
        return res.data?.rates ?? res.data ?? {};
    },
};
