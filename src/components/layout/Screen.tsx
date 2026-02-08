import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
  RefreshControl,
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@/constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  padding?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  scrollable = false,
  keyboardAvoiding = false,
  padding = false,
  refreshControl,
}) => {
  // Base content passes children
  const Content = scrollable ? (
    <ScrollView
      style={[styles.scrollContent, style]}
      contentContainerStyle={[
        styles.scrollContainer,
        padding && { padding: SPACING.md },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.viewContent,
        padding && { padding: SPACING.md },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {Content}
        </KeyboardAvoidingView>
      ) : (
        Content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  viewContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24, // Safety padding for bottom
  },
});
