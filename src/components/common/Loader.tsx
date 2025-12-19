import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';

interface LoaderProps {
    fullScreen?: boolean;
    message?: string;
    size?: 'small' | 'large';
    color?: string;
    style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({
    fullScreen = false,
    message,
    size = 'large',
    color = COLORS.primary,
    style,
}) => {
    if (fullScreen) {
        return (
            <View style={[styles.container, styles.fullScreen, style]}>
                <ActivityIndicator size={size} color={color} />
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.md,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: SPACING.md,
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.medium,
        textAlign: 'center',
    },
});
