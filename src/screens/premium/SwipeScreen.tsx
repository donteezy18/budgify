import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  PanResponder, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumGate from '../../components/PremiumGate';
import { Transaction, BudgetCategory } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const mockUncategorized: Transaction[] = [
  { id: '1', userId: 'u1', description: 'Amazon Purchase', amount: 34.99, category: 'other', date: '2026-04-18', isPlaidImport: true, categorized: false },
  { id: '2', userId: 'u1', description: 'Spotify', amount: 9.99, category: 'other', date: '2026-04-17', isPlaidImport: true, categorized: false },
  { id: '3', userId: 'u1', description: 'CVS Pharmacy', amount: 22.50, category: 'other', date: '2026-04-16', isPlaidImport: true, categorized: false },
  { id: '4', userId: 'u1', description: 'Uber', amount: 14.00, category: 'other', date: '2026-04-15', isPlaidImport: true, categorized: false },
];

const CATEGORIES: { label: string; value: BudgetCategory; emoji: string; color: string }[] = [
  { label: 'Food', value: 'food', emoji: '🍔', color: '#10B981' },
  { label: 'Transport', value: 'transport', emoji: '🚗', color: '#3B82F6' },
  { label: 'Entertainment', value: 'entertainment', emoji: '🎬', color: '#8B5CF6' },
  { label: 'Health', value: 'health', emoji: '❤️', color: '#EC4899' },
  { label: 'Utilities', value: 'utilities', emoji: '💡', color: '#F59E0B' },
  { label: 'Other', value: 'other', emoji: '📦', color: '#6B7280' },
];

function SwipeCard({ transaction, onSwipe }: {
  transaction: Transaction;
  onSwipe: (category: BudgetCategory) => void;
}) {
  const position = new Animated.ValueXY();
  const [selectedCat, setSelectedCat] = useState<BudgetCategory | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        Animated.timing(position, {
          toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
          duration: 200, useNativeDriver: true,
        }).start(() => onSwipe(selectedCat ?? 'other'));
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        Animated.timing(position, {
          toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
          duration: 200, useNativeDriver: true,
        }).start(() => onSwipe('other'));
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 }, useNativeDriver: true,
        }).start();
      }
    },
  });

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const rightOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const leftOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.card, { transform: [...position.getTranslateTransform(), { rotate }] }]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.swipeLabel, styles.keepLabel, { opacity: rightOpacity }]}>
        <Text style={styles.keepText}>CATEGORIZE</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeLabel, styles.skipLabel, { opacity: leftOpacity }]}>
        <Text style={styles.skipText}>SKIP</Text>
      </Animated.View>

      <Text style={styles.cardAmount}>${transaction.amount.toFixed(2)}</Text>
      <Text style={styles.cardDesc}>{transaction.description}</Text>
      <Text style={styles.cardDate}>{transaction.date}</Text>

      <Text style={styles.catPrompt}>Swipe right to categorize, left to skip</Text>
      <View style={styles.catGrid}>
        {CATEGORIES.map((cat) => (
          <View
            key={cat.value}
            style={[
              styles.catChip,
              selectedCat === cat.value && { backgroundColor: cat.color + '20', borderColor: cat.color },
            ]}
          >
            <Text
              onPress={() => setSelectedCat(cat.value)}
              style={[styles.catChipText, selectedCat === cat.value && { color: cat.color }]}
            >
              {cat.emoji} {cat.label}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function SwipeContent() {
  const [transactions, setTransactions] = useState(mockUncategorized);
  const [done, setDone] = useState(false);

  const handleSwipe = () => {
    const remaining = transactions.slice(1);
    setTransactions(remaining);
    if (remaining.length === 0) setDone(true);
  };

  if (done) {
    return (
      <View style={styles.doneContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text style={styles.doneTitle}>All caught up!</Text>
        <Text style={styles.doneSub}>No more transactions to categorize.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swipe to Sort</Text>
        <Text style={styles.headerSub}>{transactions.length} transactions to categorize</Text>
      </View>
      <View style={styles.swipeArea}>
        {transactions.slice(0, 3).reverse().map((t, i) => (
          i === transactions.slice(0, 3).length - 1 ? (
            <SwipeCard key={t.id} transaction={t} onSwipe={handleSwipe} />
          ) : (
            <View key={t.id} style={[styles.cardStack, { bottom: (transactions.slice(0, 3).length - 1 - i) * 8 }]} />
          )
        ))}
      </View>
    </View>
  );
}

export default function SwipeScreen() {
  return (
    <PremiumGate requiredTier="pro_lite">
      <SwipeContent />
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
  swipeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardStack: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 24,
    opacity: 0.5,
  },
  swipeLabel: {
    position: 'absolute',
    top: 20,
    borderWidth: 3,
    borderRadius: 8,
    padding: 6,
    paddingHorizontal: 12,
  },
  keepLabel: { right: 20, borderColor: '#10B981' },
  skipLabel: { left: 20, borderColor: '#EF4444' },
  keepText: { color: '#10B981', fontWeight: '900', fontSize: 16 },
  skipText: { color: '#EF4444', fontWeight: '900', fontSize: 16 },
  cardAmount: { fontSize: 40, fontWeight: '800', color: '#1F2937', textAlign: 'center', marginTop: 16 },
  cardDesc: { fontSize: 18, fontWeight: '600', color: '#374151', textAlign: 'center', marginTop: 6 },
  cardDate: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  catPrompt: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  catChip: {
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  catChipText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#1F2937', marginTop: 16 },
  doneSub: { fontSize: 15, color: '#9CA3AF', marginTop: 8 },
});
