import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Transaction } from '../../types';
import { useTheme } from '../../store/ThemeContext';

const mockTransactions: Transaction[] = [
  { id: '1', userId: 'u1', description: 'Walmart Groceries', amount: 67.42, category: 'food',          date: '2026-04-18', isPlaidImport: false, categorized: true },
  { id: '2', userId: 'u1', description: 'Shell Gas Station', amount: 52.00, category: 'transport',     date: '2026-04-17', isPlaidImport: false, categorized: true },
  { id: '3', userId: 'u1', description: 'Netflix',           amount: 15.99, category: 'entertainment', date: '2026-04-15', isPlaidImport: false, categorized: true },
  { id: '4', userId: 'u1', description: 'Electric Bill',     amount: 110.00,category: 'utilities',     date: '2026-04-14', isPlaidImport: false, categorized: true },
  { id: '5', userId: 'u1', description: 'Chipotle',          amount: 14.75, category: 'food',          date: '2026-04-13', isPlaidImport: false, categorized: true },
];

function TransactionRow({ item, categoryColors }: { item: Transaction; categoryColors: Record<string, string> }) {
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
  const { primaryColor, categoryColors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSub}>April 2026</Text>
      </View>
      <FlatList
        data={mockTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow item={item} categoryColors={categoryColors} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },
  list: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  rowDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
