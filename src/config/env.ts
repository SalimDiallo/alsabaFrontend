import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? Constants.manifest2?.extra ?? {}) as any;

export const ENV = {
    API_BASE_URL: String(extra.API_BASE_URL ?? 'http://127.0.0.1:8000'),
    USE_MOCK_API: String(extra.USE_MOCK_API ?? 'true') === 'true',
};
