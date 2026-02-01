import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { legalTexts } from '@/content/legalTexts';

type R = RouteProp<{ Content: { docId: string } }, 'Content'>;

const StaticContentScreen = () => {
  const route = useRoute<R>();
  const doc = legalTexts[route.params.docId];

  if (!doc) {
    return (
      <Screen>
        <View style={{ padding: SPACING.md }}>
          <Text style={{ color: COLORS.error }}>Document introuvable.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding={false} scrollable>
      <Header title={doc.title} />
      <View style={styles.content}>
        {doc.sections.map((s, idx) => (
          <Card key={idx} style={styles.card}>
            <Text style={styles.heading}>{s.heading}</Text>
            {s.body.map((p, i) => (
              <Text key={i} style={styles.paragraph}>{p}</Text>
            ))}
          </Card>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md, marginBottom: SPACING.md },
  heading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
});

export default StaticContentScreen;
