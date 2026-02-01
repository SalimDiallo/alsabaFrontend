export type SettingsKey = 'security' | 'notifications' | 'support' | 'terms';

export type SettingsRow =
    | {
        type: 'link';
        icon: string;
        title: string;
        description?: string;
        action: { kind: 'alert'; title: string; message: string } | { kind: 'openDoc'; docId: string };
    }
    | {
        type: 'toggle';
        icon: string;
        title: string;
        description?: string;
        stateKey: string; // clé du state local (ex: "pushEnabled")
    };

export type SettingsSection = {
    title: string;
    rows: SettingsRow[];
    hint?: string;
};

export const settingsPlaceholders: Record<SettingsKey, { screenTitle: string; sections: SettingsSection[] }> = {
    security: {
        screenTitle: 'Sécurité',
        sections: [
            {
                title: 'Accès au compte',
                rows: [
                    {
                        type: 'link',
                        icon: 'key-outline',
                        title: 'Changer le code PIN',
                        description: 'Mettre à jour votre code de sécurité',
                        action: { kind: 'alert', title: 'Bientôt disponible', message: 'Changement de PIN (placeholder).' },
                    },
                    {
                        type: 'toggle',
                        icon: 'finger-print-outline',
                        title: 'Connexion biométrique',
                        description: 'Empreinte digitale / Face ID (si disponible)',
                        stateKey: 'biometricEnabled',
                    },
                ],
                hint: "Plus tard: brancher au backend + aux APIs natives (biométrie).",
            },
            {
                title: 'Protection',
                rows: [
                    {
                        type: 'toggle',
                        icon: 'shield-checkmark-outline',
                        title: 'Alertes de connexion',
                        description: 'Recevoir une alerte lors d’une connexion',
                        stateKey: 'loginAlerts',
                    },
                    {
                        type: 'toggle',
                        icon: 'warning-outline',
                        title: 'Alertes de transactions',
                        description: 'Notification lors d’un débit/crédit',
                        stateKey: 'transactionAlerts',
                    },
                ],
            },
            {
                title: 'Session',
                rows: [
                    {
                        type: 'link',
                        icon: 'log-out-outline',
                        title: 'Déconnecter tous les appareils',
                        description: 'Coupe toutes les sessions actives (mock)',
                        action: { kind: 'alert', title: 'Succès', message: 'Toutes les sessions ont été déconnectées (placeholder).' },
                    },
                ],
            },
        ],
    },

    notifications: {
        screenTitle: 'Notifications',
        sections: [
            {
                title: 'Canaux',
                rows: [
                    { type: 'toggle', icon: 'notifications-outline', title: 'Notifications Push', description: 'Dans l’application', stateKey: 'pushEnabled' },
                    { type: 'toggle', icon: 'chatbubble-ellipses-outline', title: 'SMS', description: 'Opérations importantes', stateKey: 'smsEnabled' },
                    { type: 'toggle', icon: 'mail-outline', title: 'Email', description: 'Relevés et alertes', stateKey: 'emailEnabled' },
                ],
                hint: "Plus tard: permissions push + mapping backend (préférences).",
            },
            {
                title: 'Préférences',
                rows: [
                    { type: 'toggle', icon: 'megaphone-outline', title: 'Messages marketing', description: 'Offres, nouveautés, promotions', stateKey: 'marketingEnabled' },
                    {
                        type: 'link',
                        icon: 'time-outline',
                        title: 'Mode silencieux',
                        description: 'Plage horaire (ex: 22:00–08:00)',
                        action: { kind: 'alert', title: 'Bientôt disponible', message: 'Configuration du mode silencieux (placeholder).' },
                    },
                ],
            },
        ],
    },

    support: {
        screenTitle: 'Aide et support',
        sections: [
            {
                title: 'Assistance',
                rows: [
                    { type: 'link', icon: 'chatbubbles-outline', title: 'Chat support', description: 'Discuter avec un agent', action: { kind: 'alert', title: 'Support', message: 'Chat support (placeholder).' } },
                    { type: 'link', icon: 'call-outline', title: 'Appeler le support', description: '+212 6XX XXX XXX', action: { kind: 'alert', title: 'Support', message: "Appel fictif. Plus tard: Linking.openURL('tel:...')." } },
                    { type: 'link', icon: 'mail-outline', title: 'Envoyer un email', description: 'support@alsaba.app', action: { kind: 'alert', title: 'Support', message: "Email fictif. Plus tard: Linking.openURL('mailto:...')." } },
                ],
            },
            {
                title: 'Ressources',
                rows: [
                    { type: 'link', icon: 'help-circle-outline', title: 'FAQ', description: 'Questions fréquentes', action: { kind: 'openDoc', docId: 'faq' } },
                    { type: 'link', icon: 'document-text-outline', title: 'Guide d’utilisation', description: 'Fonctionnement, frais, délais', action: { kind: 'openDoc', docId: 'guide' } },
                ],
            },
        ],
    },

    terms: {
        screenTitle: "Conditions d'utilisation",
        sections: [
            {
                title: 'Documents',
                rows: [
                    { type: 'link', icon: 'document-text-outline', title: "Conditions d’utilisation", description: 'Version 1.0 (brouillon)', action: { kind: 'openDoc', docId: 'terms' } },
                    { type: 'link', icon: 'lock-closed-outline', title: 'Politique de confidentialité', description: 'Données, consentement', action: { kind: 'openDoc', docId: 'privacy' } },
                    { type: 'link', icon: 'cash-outline', title: 'Frais et tarification', description: 'Commissions et limites', action: { kind: 'openDoc', docId: 'fees' } },
                ],
                hint: 'Plus tard: contenu légal réel depuis API / CMS.',
            },
        ],
    },
};

export const resolveSettingsKeyFromTitle = (title: string): SettingsKey => {
    const t = (title || '').toLowerCase();
    if (t.includes('sécurité')) return 'security';
    if (t.includes('notification')) return 'notifications';
    if (t.includes('aide') || t.includes('support')) return 'support';
    if (t.includes('condition')) return 'terms';
    return 'support';
};
