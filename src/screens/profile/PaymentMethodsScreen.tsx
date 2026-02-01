import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

import { useMockDb } from '@/store/useMockDb';

const PaymentMethodsScreen = () => {
  const methods = useMockDb((s) => s.paymentMethods);
  const addPaymentMethod = useMockDb((s) => s.addPaymentMethod);
  const removePaymentMethod = useMockDb((s) => s.removePaymentMethod);



  const setDefaultPaymentMethod = useMockDb((s) => s.setDefaultPaymentMethod);

  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    Alert.alert('Ajouter', 'Choisir un type de moyen de paiement (mock)', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Carte',
        onPress: async () => {
          setAdding(true);
          await new Promise((r) => setTimeout(r, 250));
          addPaymentMethod('CARD');
          setAdding(false);
        },
      },
      {
        text: 'Mobile Money',
        onPress: async () => {
          setAdding(true);
          await new Promise((r) => setTimeout(r, 250));
          addPaymentMethod('MOBILE_MONEY');
          setAdding(false);
        },
      },
      {
        text: 'Virement',
        onPress: async () => {
          setAdding(true);
          await new Promise((r) => setTimeout(r, 250));
          addPaymentMethod('BANK_TRANSFER');
          setAdding(false);
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethod(id);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer ce moyen de paiement ? (mock)', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removePaymentMethod(id);
        },
      },
    ]);
  };

  return (
    <Screen padding={false} scrollable>
      <Header title="Moyens de paiement" />
      <View style={styles.content}>
        <TouchableOpacity style={[styles.addBtn, adding && { opacity: 0.6 }]} onPress={handleAdd} disabled={adding}>
          <Icon name="add-circle-outline" size={22} color={COLORS.text.white} />
          <Text style={styles.addText}>{adding ? 'Ajout…' : 'Ajouter'}</Text>
        </TouchableOpacity>

        {methods.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucun moyen de paiement</Text>
            <Text style={styles.emptyText}>Ajoute une carte ou un compte pour faciliter les paiements.</Text>
          </Card>
        ) : (
          methods.map((m) => (
            <Card key={m.id} style={styles.methodCard}>
              <View style={styles.row}>
                <Icon
                  name={
                    m.type === 'CARD'
                      ? 'card-outline'
                      : m.type === 'MOBILE_MONEY'
                      ? 'phone-portrait-outline'
                      : 'business-outline'
                  }
                  size={22}
                  color={COLORS.primary}
                />

                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  {m.isDefault && <Text style={styles.defaultText}>Par défaut</Text>}
                </View>

                {!m.isDefault && (
                  <TouchableOpacity onPress={() => handleSetDefault(m.id)} style={styles.defaultBtn}>
                    <Text style={styles.defaultBtnText}>Défaut</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => handleRemove(m.id)} style={{ marginLeft: SPACING.sm }}>
                  <Icon name="trash-outline" size={22} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  addText: { color: COLORS.text.white, fontWeight: TYPOGRAPHY.weights.semibold },

  emptyCard: { padding: SPACING.lg, alignItems: 'center' },
  emptyTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs },
  emptyText: { color: COLORS.text.secondary, textAlign: 'center' },

  methodCard: { padding: SPACING.md, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  methodLabel: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
  defaultText: { marginTop: 2, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success },

  defaultBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  defaultBtnText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold, fontSize: TYPOGRAPHY.sizes.xs },
});

export default PaymentMethodsScreen;
