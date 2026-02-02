import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
    return {
        ...config,
        name: config.name || 'alsabaFrontend',
        slug: config.slug || 'alsabaFrontend',
    };
};
