import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, PRESET_COLORS, DEFAULT_CATEGORY_COLORS } from '../../store/ThemeContext';
import PremiumGate from '../../components/PremiumGate';

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

function ColorSwatch({
  color, name, isActive, onPress,
}: { color: string; name: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.swatchWrap} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.swatch, { backgroundColor: color }, isActive && styles.swatchActive]}>
        {isActive && <Ionicons name="checkmark" size={18} color="#fff" />}
      </View>
      <Text style={[styles.swatchName, isActive && { color, fontWeight: '700' }]}>{name}</Text>
    </TouchableOpacity>
  );
}

function CustomizeContent() {
  const { primaryColor, setPrimaryColor, categoryColors, setCategoryColor, resetCategoryColors } = useTheme();
  const [activeCatPicker, setActiveCatPicker] = useState<string | null>(null);

  const handleResetAll = () => {
    Alert.alert('Reset Colors', 'Restore all category colors to defaults?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: () => {
          resetCategoryColors();
          setActiveCatPicker(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Customize</Text>
        <Text style={styles.headerSub}>Make Budgify yours</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* App theme color */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>App Theme Color</Text>
            <View style={[styles.previewDot, { backgroundColor: primaryColor }]} />
          </View>
          <Text style={styles.sectionSub}>Changes headers, buttons, and accents throughout the app</Text>
          <View style={styles.swatchGrid}>
            {PRESET_COLORS.map((c) => (
              <ColorSwatch
                key={c.value}
                color={c.value}
                name={c.name}
                isActive={primaryColor === c.value}
                onPress={() => setPrimaryColor(c.value)}
              />
            ))}
          </View>
        </View>

        {/* Preview bar */}
        <View style={[styles.previewBar, { backgroundColor: primaryColor }]}>
          <Text style={styles.previewBarText}>Preview — this is how your header will look</Text>
          <View style={styles.previewBtn}>
            <Text style={[styles.previewBtnText, { color: primaryColor }]}>Button</Text>
          </View>
        </View>

        {/* Category colors */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Category Colors</Text>
            <TouchableOpacity onPress={handleResetAll}>
              <Text style={styles.resetText}>Reset all</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSub}>Customize the color for each spending category</Text>

          {CATEGORIES.map((cat) => {
            const currentColor = categoryColors[cat.value] ?? DEFAULT_CATEGORY_COLORS[cat.value];
            const isOpen = activeCatPicker === cat.value;
            return (
              <View key={cat.value}>
                <TouchableOpacity
                  style={styles.catRow}
                  onPress={() => setActiveCatPicker(isOpen ? null : cat.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <View style={[styles.catColorDot, { backgroundColor: currentColor }]} />
                  <Text style={[styles.catColorHex, { color: currentColor }]}>{currentColor}</Text>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.catSwatchGrid}>
                    {PRESET_COLORS.map((c) => (
                      <TouchableOpacity
                        key={c.value}
                        style={[styles.catSwatch, { backgroundColor: c.value }, currentColor === c.value && styles.catSwatchActive]}
                        onPress={() => { setCategoryColor(cat.value, c.value); setActiveCatPicker(null); }}
                      >
                        {currentColor === c.value && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

export default function CustomizeScreen() {
  return (
    <PremiumGate requiredTier="pro_ultra">
      <CustomizeContent />
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 },

  content: { padding: 16, paddingBottom: 48 },

  section: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  sectionSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  previewDot: { width: 18, height: 18, borderRadius: 9 },
  resetText: { fontSize: 13, color: '#EF4444', fontWeight: '700' },

  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchWrap: { alignItems: 'center', width: 52 },
  swatch: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  swatchActive: { transform: [{ scale: 1.15 }] },
  swatchName: { fontSize: 10, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  previewBar: {
    borderRadius: 16, padding: 16, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  previewBarText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 },
  previewBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  previewBtnText: { fontWeight: '800', fontSize: 13 },

  catRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10,
  },
  catEmoji: { fontSize: 18, width: 26 },
  catLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1F2937' },
  catColorDot: { width: 14, height: 14, borderRadius: 7 },
  catColorHex: { fontSize: 12, fontWeight: '700', width: 62 },

  catSwatchGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: 12, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 4,
  },
  catSwatch: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  catSwatchActive: { transform: [{ scale: 1.2 }] },
});
