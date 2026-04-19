import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLANS, SubscriptionTier } from '../types';
import { useSubscription } from '../store/SubscriptionContext';

interface Props {
  highlightTier?: SubscriptionTier;
  onClose?: () => void;
}

export default function UpgradeScreen({ highlightTier, onClose }: Props) {
  const { tier: currentTier, setTier } = useSubscription();
  const [selected, setSelected] = useState<SubscriptionTier>(
    highlightTier ?? 'pro_lite'
  );

  const handleSubscribe = () => {
    // TODO: wire up Stripe payment flow
    setTier(selected);
    onClose?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Unlock Budgify</Text>
        <Text style={styles.subtitle}>Choose the plan that fits your goals</Text>

        {PLANS.map((plan) => {
          const isActive = selected === plan.tier;
          const isCurrent = currentTier === plan.tier;

          return (
            <TouchableOpacity
              key={plan.tier}
              style={[
                styles.card,
                isActive && { borderColor: plan.color, borderWidth: 2 },
                plan.tier === 'pro_ultra' && styles.featuredCard,
              ]}
              onPress={() => setSelected(plan.tier)}
              activeOpacity={0.85}
            >
              {plan.tier === 'pro_ultra' && (
                <View style={[styles.badge, { backgroundColor: plan.color }]}>
                  <Text style={styles.badgeText}>BEST VALUE</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  {isCurrent && (
                    <Text style={styles.currentLabel}>Current plan</Text>
                  )}
                </View>
                <View style={styles.priceBlock}>
                  {plan.price === 0 ? (
                    <Text style={[styles.price, { color: plan.color }]}>Free</Text>
                  ) : (
                    <>
                      <Text style={[styles.price, { color: plan.color }]}>
                        ${plan.price}
                      </Text>
                      <Text style={styles.period}>/mo</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={plan.color}
                    style={styles.checkIcon}
                  />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}

              <View style={[styles.radioRow]}>
                <View style={[styles.radio, isActive && { borderColor: plan.color }]}>
                  {isActive && <View style={[styles.radioDot, { backgroundColor: plan.color }]} />}
                </View>
                <Text style={[styles.selectLabel, isActive && { color: plan.color }]}>
                  {isActive ? 'Selected' : 'Select'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {selected !== 'free' && (
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: PLANS.find(p => p.tier === selected)?.color },
            ]}
            onPress={handleSubscribe}
          >
            <Text style={styles.ctaText}>
              {currentTier === selected
                ? 'Already subscribed'
                : `Subscribe to ${PLANS.find(p => p.tier === selected)?.name}`}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.disclaimer}>
          Cancel anytime. Billed monthly. Stripe-secured checkout.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  topRow: { paddingHorizontal: 16, paddingTop: 8, alignItems: 'flex-end' },
  closeBtn: { padding: 8 },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  featuredCard: {
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 20, fontWeight: '800' },
  currentLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  priceBlock: { flexDirection: 'row', alignItems: 'flex-end' },
  price: { fontSize: 28, fontWeight: '800' },
  period: { fontSize: 13, color: '#9CA3AF', marginBottom: 4, marginLeft: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkIcon: { marginRight: 8 },
  featureText: { fontSize: 14, color: '#374151', flex: 1 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  selectLabel: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  ctaBtn: {
    borderRadius: 16, padding: 17,
    alignItems: 'center', marginTop: 8,
    shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disclaimer: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 16 },
});
