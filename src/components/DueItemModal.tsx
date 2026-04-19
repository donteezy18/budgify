import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DueItem, useCalendar, CATEGORY_COLORS } from '../store/CalendarContext';

const CATEGORIES = [
  { label: 'Housing', value: 'housing', emoji: '🏠' },
  { label: 'Utilities', value: 'utilities', emoji: '💡' },
  { label: 'Transport', value: 'transport', emoji: '🚗' },
  { label: 'Food', value: 'food', emoji: '🍔' },
  { label: 'Entertainment', value: 'entertainment', emoji: '🎬' },
  { label: 'Health', value: 'health', emoji: '❤️' },
  { label: 'Savings', value: 'savings', emoji: '💰' },
  { label: 'Debt', value: 'debt', emoji: '📉' },
  { label: 'Other', value: 'other', emoji: '📦' },
];

interface Props {
  visible: boolean;
  date: string;
  editItem?: DueItem | null;
  onClose: () => void;
}

export default function DueItemModal({ visible, date, editItem, onClose }: Props) {
  const { addItem, updateItem } = useCalendar();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');

  useEffect(() => {
    if (editItem) {
      setLabel(editItem.label);
      setAmount(editItem.amount.toString());
      setCategory(editItem.category);
    } else {
      setLabel('');
      setAmount('');
      setCategory('other');
    }
  }, [editItem, visible]);

  const canSave = label.trim() && amount;

  const handleSave = () => {
    if (!canSave) return;
    if (editItem) {
      updateItem(editItem.id, { label: label.trim(), amount: parseFloat(amount), category });
    } else {
      addItem({ date, label: label.trim(), amount: parseFloat(amount), category, isPaid: false });
    }
    onClose();
  };

  const accentColor = CATEGORY_COLORS[category] ?? '#4F46E5';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {editItem ? 'Edit Item' : `Add Due Item`}
            </Text>
            <Text style={styles.dateLabel}>{date}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={26} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Label</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rent, Electric Bill..."
              value={label}
              onChangeText={setLabel}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.value;
                const color = CATEGORY_COLORS[cat.value];
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.catChip, isActive && { borderColor: color, backgroundColor: color + '15' }]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catText, isActive && { color, fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: accentColor }, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>{editItem ? 'Save Changes' : 'Add to Calendar'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#E5E7EB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2937', flex: 1 },
  dateLabel: { fontSize: 13, color: '#9CA3AF', marginRight: 8 },
  closeBtn: { padding: 2 },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 14,
    fontSize: 16, color: '#1F2937',
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  catEmoji: { fontSize: 14, marginRight: 5 },
  catText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  saveBtn: {
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
    shadowOpacity: 0.25, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  saveBtnDisabled: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
