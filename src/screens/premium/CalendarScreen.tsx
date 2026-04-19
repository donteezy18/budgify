import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PremiumGate from '../../components/PremiumGate';

function CalendarContent() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSub}>April 2026</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📅 Calendar view coming soon</Text>
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  return (
    <PremiumGate requiredTier="pro_lite">
      <CalendarContent />
    </PremiumGate>
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
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 16, color: '#9CA3AF' },
});
