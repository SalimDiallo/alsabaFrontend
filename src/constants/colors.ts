export const COLORS = {
    // Couleurs principales ALSAX (vert et cyan)
    primary: '#00A86B',
    secondary: '#00BCD4',

    // Couleurs neutres - Design épuré
    background: '#FFFFFF',
    surface: '#FAFAFA',
    card: '#FFFFFF',

    // Texte
    text: {
        primary: '#1A1A1A',
        secondary: '#666666',
        disabled: '#BDBDBD',
        white: '#FFFFFF',
    },

    // États
    success: '#00A86B',
    error: '#DC3545',
    warning: '#FFC107',
    info: '#00BCD4',

    // Bordures et diviseurs
    border: '#E0E0E0',
    divider: '#F5F5F5',

    // Ombres (pour les cartes)
    shadow: 'rgba(0, 0, 0, 0.08)',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};