import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { TransactionCard } from '@/components/features/TransactionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SPACING } from '@/constants/colors';
import { mockTransactions } from '@/utils/mockData';

const TransactionHistoryScreen = () => {
  const handleTransactionPress = (transactionId: string) => {
    console.log('Voir détails transaction:', transactionId);
  };

  return (
    <Screen>
      <Header title="Historique" />

      <View style={styles.content}>
        {mockTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Aucune transaction"
            message="Vous n'avez pas encore effectué de transactions"
          />
        ) : (
          <FlatList
            data={mockTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionCard
                transaction={item}
                onPress={() => handleTransactionPress(item.id)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  list: {
    paddingVertical: SPACING.md,
  },
});

export default TransactionHistoryScreen;
