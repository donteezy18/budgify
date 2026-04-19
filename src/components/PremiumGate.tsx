import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionTier, PLANS } from '../types';
import { useSubscription } from '../store/SubscriptionContext';
import UpgradeScreen from '../screens/UpgradeScreen';

interface Props {
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
}

export default function PremiumGate({ requiredTier, children }: Props) {
  const { hasAccess } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (hasAccess(requiredTier)) {
    return <>{children}</>;
  }

  const plan = PLANS.find((p) => p.tier === requiredTier)!;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: plan.color + '20' }]}>
          <Ionicons name="lock-closed" size={36} color={plan.color} />
        </View>
        <Text style={styles.title}>{plan.name} Feature</Text>
        <Text style={styles.body}>
          This feature is available on the{' '}
          <Text style={{ color: plan.color, fontWeight: '700' }}>{plan.name}</Text>
          {' '}plan and above.
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: plan.color }]}
          onPress={() => setShowUpgrade(true)}
        >
          <Text style={styles.btnText}>Upgrade — ${plan.price}/mo</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showUpgrade} animationType="slide">
        <UpgradeScreen
          highlightTier={requiredTier}
          onClose={() => setShowUpgrade(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  body: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: {
    borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14,
    shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
