import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../../store/SubscriptionContext';
import { PLANS } from '../../types';
import UpgradeScreen from '../UpgradeScreen';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Account Details' },
  { icon: 'card-outline', label: 'Subscription' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

const TIER_LABELS: Record<string, string> = {
  free: 'FREE PLAN',
  pro_lite: 'PRO LITE',
  pro_ultra: 'PRO ULTRA',
};

const TIER_COLORS: Record<string, string> = {
  free: '#6B7280',
  pro_lite: '#4F46E5',
  pro_ultra: '#7C3AED',
};

export default function ProfileScreen() {
  const { tier } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isUpgradable = tier !== 'pro_ultra';
  const plan = PLANS.find((p) => p.tier === tier)!;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: TIER_COLORS[tier] }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>D</Text>
        </View>
        <Text style={styles.name}>Dontay</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{TIER_LABELS[tier]}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem}>
            <Ionicons name={item.icon as any} size={22} color={TIER_COLORS[tier]} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        ))}
      </View>

      {isUpgradable && (
        <TouchableOpacity style={styles.upgradeCard} onPress={() => setShowUpgrade(true)}>
          <Ionicons name="star" size={22} color="#F59E0B" />
          <Text style={styles.upgradeText}>
            {tier === 'free' ? 'Upgrade to Pro Lite — $4.99/mo' : 'Upgrade to Pro Ultra — $9.99/mo'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#4F46E5" />
        </TouchableOpacity>
      )}

      <Modal visible={showUpgrade} animationType="slide">
        <UpgradeScreen
          highlightTier={tier === 'free' ? 'pro_lite' : 'pro_ultra'}
          onClose={() => setShowUpgrade(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '700' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 10 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  menu: { margin: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  menuIcon: { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1F2937', fontWeight: '500' },
  upgradeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', marginHorizontal: 16,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  upgradeText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#4F46E5', marginLeft: 10 },
});
