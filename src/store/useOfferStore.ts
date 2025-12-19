import { create } from 'zustand';
import { Offer } from '@/types/offer.types';

interface OfferState {
    offers: Offer[];
    myOffers: Offer[];
    selectedOffer: Offer | null;
    isLoading: boolean;
    error: string | null;
}

interface OfferStore extends OfferState {
    setOffers: (offers: Offer[]) => void;
    setMyOffers: (offers: Offer[]) => void;
    addOffer: (offer: Offer) => void;
    updateOffer: (offerId: string, updates: Partial<Offer>) => void;
    removeOffer: (offerId: string) => void;
    setSelectedOffer: (offer: Offer | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearOffers: () => void;
}

export const useOfferStore = create<OfferStore>((set) => ({
    offers: [],
    myOffers: [],
    selectedOffer: null,
    isLoading: false,
    error: null,

    setOffers: (offers) => {
        set({ offers, error: null });
    },

    setMyOffers: (offers) => {
        set({ myOffers: offers });
    },

    addOffer: (offer) => {
        set((state) => ({
            myOffers: [offer, ...state.myOffers],
        }));
    },

    updateOffer: (offerId, updates) => {
        set((state) => ({
            offers: state.offers.map((offer) =>
                offer.id === offerId ? { ...offer, ...updates } : offer
            ),
            myOffers: state.myOffers.map((offer) =>
                offer.id === offerId ? { ...offer, ...updates } : offer
            ),
        }));
    },

    removeOffer: (offerId) => {
        set((state) => ({
            offers: state.offers.filter((offer) => offer.id !== offerId),
            myOffers: state.myOffers.filter((offer) => offer.id !== offerId),
        }));
    },

    setSelectedOffer: (offer) => {
        set({ selectedOffer: offer });
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error, isLoading: false });
    },

    clearOffers: () => {
        set({ offers: [], myOffers: [], selectedOffer: null, error: null });
    },
}));
