export const legalTexts: Record<string, { title: string; sections: { heading: string; body: string[] }[] }> = {
    terms: {
        title: "Conditions d’utilisation",
        sections: [
            { heading: '1. Objet', body: ["Ceci est un texte placeholder.", "Il sera remplacé par la version légale officielle."] },
            { heading: '2. Comptes & KYC', body: ["KYC requis selon votre niveau.", "Limites applicables selon statut."] },
            { heading: '3. Échanges P2P', body: ["Les échanges utilisent un escrow interne (placeholder)."] },
        ],
    },
    privacy: {
        title: "Politique de confidentialité",
        sections: [
            { heading: 'Données collectées', body: ["Téléphone, identité (KYC), transactions (placeholder)."] },
            { heading: 'Finalités', body: ["Sécurité, AML/CFT, exécution des échanges (placeholder)."] },
        ],
    },
    fees: {
        title: "Frais & tarification",
        sections: [
            { heading: 'Commission', body: ["0.5% par transaction (placeholder)."] },
            { heading: 'Limites', body: ["Limite quotidienne standard (placeholder)."] },
        ],
    },
    faq: {
        title: 'FAQ',
        sections: [
            { heading: 'Pourquoi mon KYC est “pending” ?', body: ["Vérification en cours (placeholder)."] },
            { heading: 'Combien de temps pour un échange ?', body: ["En général 2 à 5 minutes (placeholder)."] },
        ],
    },
    guide: {
        title: "Guide d’utilisation",
        sections: [
            { heading: 'Créer une offre', body: ["Choisir devise, montant, bénéficiaire, durée (placeholder)."] },
            { heading: 'Accepter une offre', body: ["Choisir bénéficiaire, confirmer montant (placeholder)."] },
        ],
    },
};
