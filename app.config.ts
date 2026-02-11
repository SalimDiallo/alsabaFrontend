import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
    return {
        ...config,
        name: config.name || 'alsabaFrontend',
        slug: config.slug || 'alsabaFrontend',
        extra: {
            API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
            USE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API || 'false',
        },
    };
};
