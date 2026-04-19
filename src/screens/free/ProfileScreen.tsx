import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../../store/SubscriptionContext';
import { PLANS } from '../../types';
import UpgradeScreen from '../UpgradeScreen';
import CustomizeScreen from '../premium/CustomizeScreen';
import { useTheme } from '../../store/ThemeContext';

const TIER_LABELS: Record<string, string> = {
  free: 'FREE PLAN',
  pro_lite: 'PRO LITE',
  pro_ultra: 'PRO ULTRA',
};

const TIER_BADGE_COLORS: Record<string, string> = {
  free:       '#6B7280',
  pro_lite:   '#4F46E5',
  pro_ultra:  '#7C3AED',
};

interface MenuItem {
  icon: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { tier } = useSubscription();
  const { primaryColor, categoryColors } = useTheme();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  const isUpgradable = tier !== 'pro_ultra';
  const tierBadgeColor = TIER_BADGE_COLORS[tier];

  const MENU_ITEMS: MenuItem[] = [
    { icon: 'person-outline',           label: 'Account Details' },
    { icon: 'card-outline',             label: 'Subscription',       onPress: () => setShowUpgrade(true) },
    {
      icon: 'color-palette-outline',
      label: 'Customize App',
      badge: 'ULTRA',
      badgeColor: '#7C3AED',
      onPress: () => setShowCustomize(true),
    },
    { icon: 'notifications-outline',    label: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security' },
    { icon: 'help-circle-outline',      label: 'Help & Support' },
  ];

  return (
    <View style={styles.container}>
      {/* Header uses theme primaryColor, not hardcoded tier color */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>D</Text>
        </View>
        <Text style={styles.name}>Dontay</Text>
        {/* Badge still shows the subscription tier with its own color */}
        <View style={[styles.badge, { backgroundColor: tierBadgeColor }]}>
          <Text style={styles.badgeText}>{TIER_LABELS[tier]}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index === MENU_ITEMS.length - 1 && styles.menuItemLast]}
              onPress={item.onPress}
              activeOpacity={item.onPress ? 0.6 : 1}
            >
              <Ionicons name={item.icon as any} size={22} color={primaryColor} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={[styles.menuBadge, { backgroundColor: item.badgeColor }]}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}
        </View>

        {isUpgradable && (
          <TouchableOpacity style={styles.upgradeCard} onPress={() => setShowUpgrade(true)}>
            <Ionicons name="star" size={22} color="#F59E0B" />
            <Text style={[styles.upgradeText, { color: primaryColor }]}>
              {tier === 'free' ? 'Upgrade to Pro Lite — $4.99/mo' : 'Upgrade to Pro Ultra — $9.99/mo'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={primaryColor} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Upgrade modal */}
      <Modal visible={showUpgrade} animationType="slide">
        <UpgradeScreen
          highlightTier={tier === 'free' ? 'pro_lite' : 'pro_ultra'}
          onClose={() => setShowUpgrade(false)}
        />
      </Modal>

      {/* Customize modal — PremiumGate inside CustomizeScreen handles the Ultra check */}
      <Modal visible={showCustomize} animationType="slide">
        <View style={{ flex: 1 }}>
          <View style={[styles.modalTopBar, { backgroundColor: primaryColor }]}>
            <TouchableOpacity onPress={() => setShowCustomize(false)} style={styles.modalCloseBtn}>
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTopTitle}>Customize App</Text>
            <View style={{ width: 40 }} />
          </View>
          <CustomizeScreen />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    paddingTop: 60, paddingBottom: 36, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '700' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 10 },
  badge: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  scroll: { paddingBottom: 40 },
  menu: {
    margin: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1F2937', fontWeight: '500' },
  menuBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4 },
  menuBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  upgradeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', marginHorizontal: 16,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  upgradeText: { flex: 1, fontSize: 15, fontWeight: '700', marginLeft: 10 },
  modalTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
  },
  modalCloseBtn: { width: 40, alignItems: 'flex-start' },
  modalTopTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
