import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Budget } from '../../types';

const mockBudgets: Budget[] = [
  { id: '1', userId: 'u1', name: 'Rent', amount: 1500, spent: 1500, category: 'housing', month: 4, year: 2026, createdAt: '' },
  { id: '2', userId: 'u1', name: 'Groceries', amount: 400, spent: 210, category: 'food', month: 4, year: 2026, createdAt: '' },
  { id: '3', userId: 'u1', name: 'Transport', amount: 200, spent: 80, category: 'transport', month: 4, year: 2026, createdAt: '' },
  { id: '4', userId: 'u1', name: 'Entertainment', amount: 150, spent: 95, category: 'entertainment', month: 4, year: 2026, createdAt: '' },
];

function BudgetCard({ budget }: { budget: Budget }) {
  const progress = Math.min(budget.spent / budget.amount, 1);
  const remaining = budget.amount - budget.spent;
  const isOver = remaining < 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{budget.name}</Text>
        <Text style={[styles.cardRemaining, isOver && styles.overBudget]}>
          {isOver ? `-$${Math.abs(remaining)}` : `$${remaining} left`}
        </Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }, isOver && styles.progressOver]} />
      </View>
      <Text style={styles.cardSub}>
        ${budget.spent} of ${budget.amount}
      </Text>
    </View>
  );
}

export default function BudgetListScreen() {
  const totalBudget = mockBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = mockBudgets.reduce((s, b) => s + b.spent, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgify</Text>
        <Text style={styles.headerSub}>April 2026</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>${totalBudget}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryValue}>${totalSpent}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValue}>${totalBudget - totalSpent}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={mockBudgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BudgetCard budget={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+ Add Budget</Text>
      </TouchableOpacity>
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
  summaryRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#C7D2FE', fontSize: 11 },
  summaryValue: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  cardRemaining: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  overBudget: { color: '#EF4444' },
  progressBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 4 },
  progressOver: { backgroundColor: '#EF4444' },
  cardSub: { fontSize: 12, color: '#9CA3AF', marginTop: 6 },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
