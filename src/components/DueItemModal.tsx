import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DueItem, useCalendar } from '../store/CalendarContext';
import { useTheme } from '../store/ThemeContext';
import { useSubscription } from '../store/SubscriptionContext';

const CATEGORIES = [
  { label: 'Housing',       value: 'housing',       emoji: '🏠' },
  { label: 'Utilities',     value: 'utilities',     emoji: '💡' },
  { label: 'Transport',     value: 'transport',     emoji: '🚗' },
  { label: 'Food',          value: 'food',          emoji: '🍔' },
  { label: 'Entertainment', value: 'entertainment', emoji: '🎬' },
  { label: 'Health',        value: 'health',        emoji: '❤️' },
  { label: 'Savings',       value: 'savings',       emoji: '💰' },
  { label: 'Debt',          value: 'debt',          emoji: '📉' },
  { label: 'Other',         value: 'other',         emoji: '📦' },
];

const EMOJI_PRESETS = [
  '🏠','💡','🚗','🍔','🎬','❤️','💰','📉','📦',
  '✈️','🎓','👶','🐶','🌿','🏋️','🎮','🛒','💊',
  '🔑','📱','🎁','🍕','☕','🧾','💳','🏦','📅',
];

interface Props {
  visible: boolean;
  date: string;
  editItem?: DueItem | null;
  onClose: () => void;
}

export default function DueItemModal({ visible, date, editItem, onClose }: Props) {
  const { addItem, updateItem } = useCalendar();
  const { categoryColors } = useTheme();
  const { hasAccess } = useSubscription();
  const isUltra = hasAccess('pro_ultra');

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    if (editItem) {
      setLabel(editItem.label);
      setAmount(editItem.amount.toString());
      setCategory(editItem.category);
      setEmoji(editItem.emoji ?? '');
    } else {
      setLabel('');
      setAmount('');
      setCategory('other');
      setEmoji('');
    }
  }, [editItem, visible]);

  const canSave = label.trim() && amount;
  const accentColor = categoryColors[category] ?? '#4F46E5';

  const handleSave = () => {
    if (!canSave) return;
    const payload = {
      date,
      label: label.trim(),
      amount: parseFloat(amount),
      category,
      isPaid: false,
      ...(isUltra && emoji ? { emoji } : {}),
    };
    if (editItem) {
      updateItem(editItem.id, payload);
    } else {
      addItem(payload);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>{editItem ? 'Edit Item' : 'Add Due Item'}</Text>
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
                const color = categoryColors[cat.value] ?? '#6B7280';
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

            {/* Emoji picker — Ultra only */}
            {isUltra && (
              <>
                <View style={styles.emojiLabelRow}>
                  <Text style={styles.fieldLabel}>Item Emoji</Text>
                  <View style={styles.ultraBadge}>
                    <Text style={styles.ultraBadgeText}>ULTRA</Text>
                  </View>
                </View>
                <View style={styles.emojiGrid}>
                  {EMOJI_PRESETS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiBtn, emoji === e && { backgroundColor: accentColor + '20', borderColor: accentColor }]}
                      onPress={() => setEmoji(emoji === e ? '' : e)}
                    >
                      <Text style={styles.emojiChar}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {emoji !== '' && (
                  <TouchableOpacity onPress={() => setEmoji('')} style={styles.clearEmoji}>
                    <Text style={styles.clearEmojiText}>✕ Clear emoji</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, maxHeight: '92%',
  },
  handle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2937', flex: 1 },
  dateLabel: { fontSize: 13, color: '#9CA3AF', marginRight: 8 },
  closeBtn: { padding: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 16, color: '#1F2937' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  catEmoji: { fontSize: 14, marginRight: 5 },
  catText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  emojiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 6 },
  ultraBadge: { backgroundColor: '#7C3AED', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  ultraBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: { width: 42, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  emojiChar: { fontSize: 22 },
  clearEmoji: { marginTop: 8, alignSelf: 'flex-start' },
  clearEmojiText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  saveBtnDisabled: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
