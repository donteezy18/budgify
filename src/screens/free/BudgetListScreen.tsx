import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Budget, BudgetCategory } from '../../types';
import { useTheme, DEFAULT_CATEGORY_COLORS } from '../../store/ThemeContext';

const INITIAL_BUDGETS: Budget[] = [
  { id: '1', userId: 'u1', name: 'Rent',          amount: 1500, spent: 1500, category: 'housing',       month: 4, year: 2026, createdAt: '' },
  { id: '2', userId: 'u1', name: 'Groceries',     amount: 400,  spent: 210,  category: 'food',          month: 4, year: 2026, createdAt: '' },
  { id: '3', userId: 'u1', name: 'Transport',     amount: 200,  spent: 80,   category: 'transport',     month: 4, year: 2026, createdAt: '' },
  { id: '4', userId: 'u1', name: 'Entertainment', amount: 150,  spent: 95,   category: 'entertainment', month: 4, year: 2026, createdAt: '' },
];

const CATEGORY_EMOJIS: Record<BudgetCategory, string> = {
  housing: '🏠', food: '🍔', transport: '🚗', utilities: '💡',
  entertainment: '🎬', health: '❤️', savings: '💰', debt: '📉', other: '📦',
};

const CATEGORY_LIST: { label: string; value: BudgetCategory; emoji: string }[] = [
  { label: 'Housing',       value: 'housing',       emoji: '🏠' },
  { label: 'Food',          value: 'food',          emoji: '🍔' },
  { label: 'Transport',     value: 'transport',     emoji: '🚗' },
  { label: 'Utilities',     value: 'utilities',     emoji: '💡' },
  { label: 'Entertainment', value: 'entertainment', emoji: '🎬' },
  { label: 'Health',        value: 'health',        emoji: '❤️' },
  { label: 'Savings',       value: 'savings',       emoji: '💰' },
  { label: 'Debt',          value: 'debt',          emoji: '📉' },
  { label: 'Other',         value: 'other',         emoji: '📦' },
];

// ─── Donut chart helpers ────────────────────────────────────────────────────

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 88;
const INNER_R = 56;

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(startAngle: number, endAngle: number): string {
  const large = endAngle - startAngle > 180 ? 1 : 0;
  const os = polarToCart(CX, CY, OUTER_R, startAngle);
  const oe = polarToCart(CX, CY, OUTER_R, endAngle);
  const ie = polarToCart(CX, CY, INNER_R, endAngle);
  const is = polarToCart(CX, CY, INNER_R, startAngle);
  return [
    `M ${os.x} ${os.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ');
}

interface Slice { color: string; label: string; amount: number; path: string }

function buildSlices(budgets: Budget[], categoryColors: Record<string, string>): Slice[] {
  const total = budgets.reduce((s, b) => s + b.amount, 0);
  if (total === 0) return [];
  let cursor = 0;
  return budgets.map((b) => {
    const sweep = (b.amount / total) * 360;
    const end = cursor + sweep;
    const path = slicePath(cursor, Math.min(end, cursor + sweep - 0.01));
    cursor = end;
    return {
      color: categoryColors[b.category] ?? DEFAULT_CATEGORY_COLORS[b.category] ?? '#9CA3AF',
      label: b.name,
      amount: b.amount,
      path,
    };
  });
}

// ─── Components ─────────────────────────────────────────────────────────────

function DonutChart({ budgets, categoryColors, totalBudget, totalSpent }: {
  budgets: Budget[];
  categoryColors: Record<string, string>;
  totalBudget: number;
  totalSpent: number;
}) {
  const remaining = totalBudget - totalSpent;
  const slices = buildSlices(budgets, categoryColors);

  return (
    <View style={chartStyles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        {slices.length === 0 ? (
          <Circle cx={CX} cy={CY} r={OUTER_R} fill="#E5E7EB" />
        ) : (
          slices.map((s, i) => (
            <Path key={i} d={s.path} fill={s.color} />
          ))
        )}
        {/* inner hole */}
        <Circle cx={CX} cy={CY} r={INNER_R} fill="#F4F6FA" />
      </Svg>
      <View style={chartStyles.center} pointerEvents="none">
        <Text style={chartStyles.centerAmount}>
          {remaining < 0 ? `-$${Math.abs(remaining).toFixed(0)}` : `$${remaining.toFixed(0)}`}
        </Text>
        <Text style={chartStyles.centerLabel}>{remaining < 0 ? 'over budget' : 'remaining'}</Text>
      </View>
    </View>
  );
}

function Legend({ budgets, categoryColors }: { budgets: Budget[]; categoryColors: Record<string, string> }) {
  return (
    <View style={legendStyles.wrap}>
      {budgets.map((b) => {
        const color = categoryColors[b.category] ?? DEFAULT_CATEGORY_COLORS[b.category] ?? '#9CA3AF';
        return (
          <View key={b.id} style={legendStyles.row}>
            <View style={[legendStyles.dot, { backgroundColor: color }]} />
            <Text style={legendStyles.name}>{CATEGORY_EMOJIS[b.category]} {b.name}</Text>
            <Text style={legendStyles.amount}>${b.amount.toLocaleString()}</Text>
          </View>
        );
      })}
    </View>
  );
}

function BudgetCard({ budget, primaryColor, categoryColors }: {
  budget: Budget; primaryColor: string; categoryColors: Record<string, string>;
}) {
  const progress = Math.min(budget.spent / budget.amount, 1);
  const remaining = budget.amount - budget.spent;
  const isOver = remaining < 0;
  const barColor = categoryColors[budget.category] ?? DEFAULT_CATEGORY_COLORS[budget.category] ?? primaryColor;

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.row}>
        <Text style={cardStyles.emoji}>{CATEGORY_EMOJIS[budget.category]}</Text>
        <View style={{ flex: 1 }}>
          <View style={cardStyles.titleRow}>
            <Text style={cardStyles.title}>{budget.name}</Text>
            <Text style={[cardStyles.remaining, isOver ? cardStyles.over : { color: barColor }]}>
              {isOver ? `-$${Math.abs(remaining).toFixed(0)}` : `$${remaining.toFixed(0)} left`}
            </Text>
          </View>
          <View style={cardStyles.progressBg}>
            <View style={[cardStyles.progressFill, { width: `${progress * 100}%`, backgroundColor: isOver ? '#EF4444' : barColor }]} />
          </View>
          <Text style={cardStyles.sub}>${budget.spent} of ${budget.amount}</Text>
        </View>
      </View>
    </View>
  );
}

function AddBudgetForm({ onAdd, primaryColor }: {
  onAdd: (b: Budget) => void; primaryColor: string;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BudgetCategory | null>(null);
  const canSave = name.trim() && Number(amount) > 0 && category;

  const handleSave = () => {
    if (!canSave) return;
    onAdd({
      id: Date.now().toString(),
      userId: 'u1',
      name: name.trim(),
      amount: Number(amount),
      spent: 0,
      category: category!,
      month: 4, year: 2026, createdAt: '',
    });
    setName(''); setAmount(''); setCategory(null);
  };

  return (
    <View style={formStyles.wrap}>
      <Text style={formStyles.heading}>New Budget</Text>
      <TextInput
        style={formStyles.input}
        placeholder="Budget name (e.g. Groceries)"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={formStyles.input}
        placeholder="Monthly limit ($)"
        placeholderTextColor="#9CA3AF"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <View style={formStyles.catGrid}>
        {CATEGORY_LIST.map((c) => {
          const active = category === c.value;
          return (
            <TouchableOpacity
              key={c.value}
              style={[formStyles.chip, active && { borderColor: primaryColor, backgroundColor: primaryColor + '18' }]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={[formStyles.chipText, active && { color: primaryColor, fontWeight: '700' }]}>
                {c.emoji} {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={[formStyles.btn, { backgroundColor: canSave ? primaryColor : '#D1D5DB', shadowColor: primaryColor }]}
        disabled={!canSave}
        onPress={handleSave}
      >
        <Text style={formStyles.btnText}>Add Budget</Text>
      </TouchableOpacity>
    </View>
  );
}

function IncomeTab({
  primaryColor, categoryColors, budgets, monthlyIncome, onSaveIncome,
}: {
  primaryColor: string;
  categoryColors: Record<string, string>;
  budgets: Budget[];
  monthlyIncome: number | null;
  onSaveIncome: (val: number) => void;
}) {
  const [input, setInput] = useState(monthlyIncome !== null ? String(monthlyIncome) : '');
  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const unallocated = monthlyIncome !== null ? monthlyIncome - totalBudgeted : null;
  const canSave = Number(input) > 0;

  return (
    <View style={incomeStyles.wrap}>
      <Text style={incomeStyles.heading}>Expected Monthly Income</Text>
      <Text style={incomeStyles.sub}>Set your take-home pay to see how your budgets stack up.</Text>

      <View style={incomeStyles.inputRow}>
        <Text style={incomeStyles.dollar}>$</Text>
        <TextInput
          style={incomeStyles.input}
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          value={input}
          onChangeText={setInput}
        />
      </View>
      <TouchableOpacity
        style={[incomeStyles.btn, { backgroundColor: canSave ? primaryColor : '#D1D5DB', shadowColor: primaryColor }]}
        disabled={!canSave}
        onPress={() => canSave && onSaveIncome(Number(input))}
        activeOpacity={0.75}
      >
        <Text style={incomeStyles.btnText}>
          {monthlyIncome !== null ? 'Update Income' : 'Save Income'}
        </Text>
      </TouchableOpacity>

      {monthlyIncome !== null && (
        <>
          {/* Summary row */}
          <View style={incomeStyles.summaryRow}>
            <View style={incomeStyles.summaryItem}>
              <Text style={incomeStyles.summaryLabel}>Income</Text>
              <Text style={[incomeStyles.summaryValue, { color: '#10B981' }]}>${monthlyIncome.toLocaleString()}</Text>
            </View>
            <View style={incomeStyles.summaryDivider} />
            <View style={incomeStyles.summaryItem}>
              <Text style={incomeStyles.summaryLabel}>Budgeted</Text>
              <Text style={[incomeStyles.summaryValue, { color: primaryColor }]}>${totalBudgeted.toLocaleString()}</Text>
            </View>
            <View style={incomeStyles.summaryDivider} />
            <View style={incomeStyles.summaryItem}>
              <Text style={incomeStyles.summaryLabel}>Free</Text>
              <Text style={[incomeStyles.summaryValue, { color: unallocated! < 0 ? '#EF4444' : '#1F2937' }]}>
                {unallocated! < 0 ? `-$${Math.abs(unallocated!).toLocaleString()}` : `$${unallocated!.toLocaleString()}`}
              </Text>
            </View>
          </View>

          {/* Budget health bar */}
          <View style={incomeStyles.healthCard}>
            <View style={incomeStyles.healthHeader}>
              <Text style={incomeStyles.healthTitle}>Budget Allocation</Text>
              <Text style={incomeStyles.healthPct}>
                {Math.min(Math.round((totalBudgeted / monthlyIncome) * 100), 100)}% allocated
              </Text>
            </View>
            <View style={incomeStyles.healthBar}>
              <View style={[
                incomeStyles.healthFill,
                {
                  width: `${Math.min((totalBudgeted / monthlyIncome) * 100, 100)}%`,
                  backgroundColor: totalBudgeted > monthlyIncome ? '#EF4444' : primaryColor,
                },
              ]} />
            </View>
          </View>

          {/* Per-budget breakdown */}
          <View style={incomeStyles.breakdownCard}>
            <Text style={incomeStyles.breakdownTitle}>Budget Breakdown</Text>
            {budgets.map((b) => {
              const color = categoryColors[b.category] ?? DEFAULT_CATEGORY_COLORS[b.category] ?? '#9CA3AF';
              const pct = Math.round((b.amount / monthlyIncome) * 100);
              return (
                <View key={b.id} style={incomeStyles.breakdownRow}>
                  <Text style={incomeStyles.breakdownEmoji}>{CATEGORY_EMOJIS[b.category]}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={incomeStyles.breakdownLabelRow}>
                      <Text style={incomeStyles.breakdownName}>{b.name}</Text>
                      <Text style={[incomeStyles.breakdownPct, { color }]}>{pct}%</Text>
                    </View>
                    <View style={incomeStyles.miniBarBg}>
                      <View style={[incomeStyles.miniBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
                    </View>
                  </View>
                  <Text style={incomeStyles.breakdownAmt}>${b.amount.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

type TabKey = 'budgets' | 'income';

export default function BudgetListScreen() {
  const { primaryColor, categoryColors } = useTheme();
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [activeTab, setActiveTab] = useState<TabKey>('budgets');
  const [showForm, setShowForm] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);

  const handleAdd = (b: Budget) => {
    setBudgets((prev) => [...prev, b]);
    setShowForm(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: primaryColor }]}>
          <Text style={styles.headerTitle}>Budgify</Text>
          <Text style={styles.headerSub}>April 2026</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Chart card */}
          <View style={styles.chartCard}>
            <DonutChart
              budgets={budgets}
              categoryColors={categoryColors}
              totalBudget={totalBudget}
              totalSpent={totalSpent}
            />
            <Legend budgets={budgets} categoryColors={categoryColors} />
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['budgets', 'income'] as TabKey[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[styles.tabText, activeTab === t && { color: primaryColor, fontWeight: '700' }]}>
                  {t === 'budgets' ? 'Budgets' : 'Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab content */}
          {activeTab === 'budgets' ? (
            <View style={styles.tabContent}>
              {budgets.map((b) => (
                <BudgetCard key={b.id} budget={b} primaryColor={primaryColor} categoryColors={categoryColors} />
              ))}
              {showForm && (
                <AddBudgetForm onAdd={handleAdd} primaryColor={primaryColor} />
              )}
            </View>
          ) : (
            <IncomeTab
              primaryColor={primaryColor}
              categoryColors={categoryColors}
              budgets={budgets}
              monthlyIncome={monthlyIncome}
              onSaveIncome={setMonthlyIncome}
            />
          )}

        </ScrollView>

        {/* FAB — only on budgets tab */}
        {activeTab === 'budgets' && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
            onPress={() => setShowForm((v) => !v)}
          >
            <Text style={styles.fabText}>{showForm ? '✕ Cancel' : '+ Add Budget'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },
  scroll: { paddingBottom: 120 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 24, margin: 16, padding: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
  tabContent: { paddingHorizontal: 16, paddingTop: 12 },
  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30,
    shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

const chartStyles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  centerAmount: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  centerLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});

const legendStyles = StyleSheet.create({
  wrap: { width: '100%', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  name: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  amount: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  emoji: { fontSize: 22, marginTop: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  remaining: { fontSize: 13, fontWeight: '700' },
  over: { color: '#EF4444' },
  progressBg: { height: 7, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sub: { fontSize: 11, color: '#9CA3AF', marginTop: 5 },
});

const formStyles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  heading: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
  input: {
    backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12,
    fontSize: 15, color: '#1F2937', marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  chipText: { fontSize: 12, color: '#6B7280' },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

const incomeStyles = StyleSheet.create({
  wrap: { padding: 16 },
  heading: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  dollar: { fontSize: 20, color: '#9CA3AF', marginRight: 6 },
  input: { flex: 1, fontSize: 20, color: '#1F2937', paddingVertical: 12 },
  btn: {
    borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20,
    shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  summaryRow: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  summaryValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  healthCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  healthTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  healthPct: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  healthBar: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  healthFill: { height: '100%', borderRadius: 5 },

  breakdownCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  breakdownTitle: { fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  breakdownEmoji: { fontSize: 18, width: 24 },
  breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakdownName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  breakdownPct: { fontSize: 12, fontWeight: '700' },
  miniBarBg: { height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },
  breakdownAmt: { fontSize: 13, fontWeight: '700', color: '#1F2937', width: 56, textAlign: 'right' },
});
