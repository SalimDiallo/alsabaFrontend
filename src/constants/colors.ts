export const COLORS = {
    // Couleurs principales ALSAX (on garde)
    primary: '#00A86B',   // Vert ALSAX
    secondary: '#00BCD4', // Cyan ALSAX
    //primary: '#1B2A4A', // Navy
    //secondary: '#2ED3B7', // Mint
    //background:'#F6F8FC',
    //text.primary:'#0B1220'

    // Backgrounds / Surfaces (plus premium : pas blanc pur partout)
    background: '#F7F9FC', // fond global doux (au lieu de #FFFFFF)
    surface: '#FFFFFF',    // surfaces principales
    card: '#FFFFFF',       // cartes

    // Neutres (nouveau) : utile pour bordures, placeholders, chips, etc.
    neutral: {
        50: '#F7F9FC',
        100: '#EEF2F6',
        200: '#E3E9F1',
        300: '#D3DAE6',
        400: '#98A2B3',
        500: '#667085',
        600: '#475467',
        700: '#344054',
        800: '#1D2939',
        900: '#101828',
    },

    // Texte
    text: {
        primary: '#101828',    // plus net
        secondary: '#475467',  // meilleur gris
        disabled: '#98A2B3',
        white: '#FFFFFF',
    },

    // États
    success: '#00A86B',
    error: '#F04438',   // plus “clean”
    warning: '#F79009', // warning pro
    info: '#00BCD4',

    // Variantes "soft" (nouveau) : pour badges, backgrounds de sections, etc.
    soft: {
        primary: 'rgba(0, 168, 107, 0.10)',
        secondary: 'rgba(0, 188, 212, 0.10)',
        success: 'rgba(0, 168, 107, 0.12)',
        error: 'rgba(240, 68, 56, 0.10)',
        warning: 'rgba(247, 144, 9, 0.12)',
    },

    // Bordures et diviseurs (plus subtils)
    border: '#E3E9F1',
    divider: '#EEF2F6',

    // Overlays
    overlay: 'rgba(16, 24, 40, 0.35)',

    // Ombres (structurées pour iOS/Android)
    shadow: {
        color: 'rgba(16, 24, 40, 0.08)',
        sm: { shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
        md: { shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
    },
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
        sm: 13, // petit ajustement = +pro
        md: 15,
        lg: 18,
        xl: 22, // 24 -> 22 = plus “finance UI”
        xxl: 30,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const BORDER_RADIUS = {
    sm: 8,   // 4 -> 8 : plus moderne
    md: 12,  // 8 -> 12
    lg: 16,  // 12 -> 16
    xl: 20,  // 16 -> 20
    full: 9999,
};
