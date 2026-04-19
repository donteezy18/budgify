import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Transaction } from '../../types';

const mockTransactions: Transaction[] = [
  { id: '1', userId: 'u1', description: 'Walmart Groceries', amount: 67.42, category: 'food', date: '2026-04-18', isPlaidImport: false, categorized: true },
  { id: '2', userId: 'u1', description: 'Shell Gas Station', amount: 52.00, category: 'transport', date: '2026-04-17', isPlaidImport: false, categorized: true },
  { id: '3', userId: 'u1', description: 'Netflix', amount: 15.99, category: 'entertainment', date: '2026-04-15', isPlaidImport: false, categorized: true },
  { id: '4', userId: 'u1', description: 'Electric Bill', amount: 110.00, category: 'utilities', date: '2026-04-14', isPlaidImport: false, categorized: true },
  { id: '5', userId: 'u1', description: 'Chipotle', amount: 14.75, category: 'food', date: '2026-04-13', isPlaidImport: false, categorized: true },
];

const categoryColors: Record<string, string> = {
  food: '#10B981',
  transport: '#3B82F6',
  entertainment: '#8B5CF6',
  utilities: '#F59E0B',
  housing: '#EF4444',
  health: '#EC4899',
  savings: '#14B8A6',
  debt: '#F97316',
  other: '#6B7280',
};

function TransactionRow({ item }: { item: Transaction }) {
  const color = categoryColors[item.category] ?? '#6B7280';
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{item.description}</Text>
        <Text style={styles.rowDate}>{item.date}</Text>
      </View>
      <Text style={styles.rowAmount}>-${item.amount.toFixed(2)}</Text>
    </View>
  );
}

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSub}>April 2026</Text>
      </View>
      <FlatList
        data={mockTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow item={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: '#C7D2FE', fontSize: 14, marginTop: 2 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  rowDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
