import { apiClient } from './apiClient';
import {
    Offer,
    CreateOfferRequest,
    MatchOfferRequest,
} from '@/types/offer.types';

export const offerService = {
    // Créer une offre
    createOffer: async (data: CreateOfferRequest): Promise<Offer> => {
        return apiClient.post<Offer>('/offers', data);
    },

    // Récupérer toutes les offres disponibles
    getOffers: async (currency?: string): Promise<Offer[]> => {
        const url = currency ? `/offers?currency=${currency}` : '/offers';
        return apiClient.get<Offer[]>(url);
    },

    // Récupérer mes offres
    getMyOffers: async (): Promise<Offer[]> => {
        return apiClient.get<Offer[]>('/offers/my-offers');
    },

    // Récupérer une offre par ID
    getOfferById: async (offerId: string): Promise<Offer> => {
        return apiClient.get<Offer>(`/offers/${offerId}`);
    },

    // Accepter une offre (matching)
    matchOffer: async (data: MatchOfferRequest): Promise<any> => {
        return apiClient.post('/offers/match', data);
    },

    // Annuler une offre
    cancelOffer: async (offerId: string): Promise<void> => {
        return apiClient.delete(`/offers/${offerId}`);
    },

    // Calculer le taux d'échange
    calculateRate: async (
        fromCurrency: string,
        toCurrency: string,
        amount: number
    ): Promise<{ rate: number; receiveAmount: number }> => {
        return apiClient.post('/offers/calculate-rate', {
            fromCurrency,
            toCurrency,
            amount,
        });
    },
};
