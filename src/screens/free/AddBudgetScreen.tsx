import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BudgetCategory } from '../../types';
import { useTheme } from '../../store/ThemeContext';

const CATEGORIES: { label: string; value: BudgetCategory; emoji: string }[] = [
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

export default function AddBudgetScreen() {
  const { primaryColor } = useTheme();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BudgetCategory | null>(null);

  const canSave = name.trim() && amount && category;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: primaryColor }]}>
          <Text style={styles.headerTitle}>Add Budget</Text>
          <Text style={styles.headerSub}>Set a spending limit for a category</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Budget Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Groceries"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Monthly Limit ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.catChip,
                    isActive && { borderColor: primaryColor, backgroundColor: primaryColor + '15' },
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, isActive && { color: primaryColor, fontWeight: '700' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: primaryColor, shadowColor: primaryColor },
              !canSave && styles.saveBtnDisabled,
            ]}
            disabled={!canSave}
            onPress={() => { setName(''); setAmount(''); setCategory(null); }}
          >
            <Text style={styles.saveBtnText}>Save Budget</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, color: '#1F2937', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  catEmoji: { fontSize: 16, marginRight: 6 },
  catLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  saveBtnDisabled: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
