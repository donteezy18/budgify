import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBank, BankAccount } from '../store/BankContext';
import { useTheme } from '../store/ThemeContext';
import PremiumGate from '../components/PremiumGate';

// Simulated bank list — will be replaced by Plaid Link SDK in production
const MOCK_BANKS = [
  { name: 'Chase',           logo: '🏦', color: '#115EA3' },
  { name: 'Bank of America', logo: '🔴', color: '#E31837' },
  { name: 'Wells Fargo',     logo: '🟡', color: '#D71E28' },
  { name: 'Capital One',     logo: '💳', color: '#004977' },
  { name: 'Citibank',        logo: '🔵', color: '#003B70' },
  { name: 'US Bank',         logo: '💼', color: '#0A2240' },
  { name: 'TD Bank',         logo: '🌿', color: '#1B7336' },
  { name: 'PNC Bank',        logo: '🟠', color: '#E87722' },
  { name: 'Ally Bank',       logo: '🟣', color: '#7B2D8B' },
  { name: 'Other Bank',      logo: '🏛️', color: '#6B7280' },
];

const ACCOUNT_TYPES: { label: string; value: BankAccount['accountType'] }[] = [
  { label: 'Checking', value: 'checking' },
  { label: 'Savings',  value: 'savings'  },
  { label: 'Credit',   value: 'credit'   },
];

function ConnectFlow({ onClose }: { onClose: () => void }) {
  const { connectAccount } = useBank();
  const { primaryColor } = useTheme();
  const [step, setStep] = useState<'bank' | 'type' | 'success'>('bank');
  const [selectedBank, setSelectedBank] = useState<typeof MOCK_BANKS[0] | null>(null);
  const [selectedType, setSelectedType] = useState<BankAccount['accountType']>('checking');

  const handleConnect = () => {
    if (!selectedBank) return;
    connectAccount({
      institutionName: selectedBank.name,
      institutionLogo: selectedBank.logo,
      accountType: selectedType,
      accountMask: String(Math.floor(1000 + Math.random() * 9000)),
      isActive: true,
    });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <View style={flow.successContainer}>
        <View style={[flow.successCircle, { backgroundColor: primaryColor + '15' }]}>
          <Ionicons name="checkmark-circle" size={64} color={primaryColor} />
        </View>
        <Text style={flow.successTitle}>{selectedBank?.logo} {selectedBank?.name} Connected!</Text>
        <Text style={flow.successBody}>
          Your transactions have been imported. Sort them in the{' '}
          <Text style={{ fontWeight: '800' }}>Transactions</Text> tab or swipe through them in the{' '}
          <Text style={{ fontWeight: '800' }}>Swipe</Text> tab.
        </Text>
        <TouchableOpacity style={[flow.doneBtn, { backgroundColor: primaryColor }]} onPress={onClose}>
          <Text style={flow.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'type') {
    return (
      <View style={flow.container}>
        <Text style={flow.stepTitle}>Select Account Type</Text>
        <Text style={flow.stepSub}>for {selectedBank?.logo} {selectedBank?.name}</Text>
        {ACCOUNT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[flow.typeRow, selectedType === t.value && { borderColor: primaryColor, backgroundColor: primaryColor + '10' }]}
            onPress={() => setSelectedType(t.value)}
          >
            <Ionicons
              name={t.value === 'checking' ? 'card-outline' : t.value === 'savings' ? 'wallet-outline' : 'trending-up-outline'}
              size={22}
              color={selectedType === t.value ? primaryColor : '#9CA3AF'}
            />
            <Text style={[flow.typeLabel, selectedType === t.value && { color: primaryColor, fontWeight: '700' }]}>
              {t.label}
            </Text>
            {selectedType === t.value && (
              <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
            )}
          </TouchableOpacity>
        ))}
        <View style={flow.btnRow}>
          <TouchableOpacity style={flow.backBtn} onPress={() => setStep('bank')}>
            <Text style={flow.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[flow.connectBtn, { backgroundColor: primaryColor }]} onPress={handleConnect}>
            <Text style={flow.connectBtnText}>Connect Account</Text>
          </TouchableOpacity>
        </View>
        <Text style={flow.disclaimer}>
          🔒 In production, Plaid securely authenticates with your bank. Your credentials are never stored by Budgify.
        </Text>
      </View>
    );
  }

  return (
    <View style={flow.container}>
      <Text style={flow.stepTitle}>Select Your Bank</Text>
      <Text style={flow.stepSub}>Choose your financial institution</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
        {MOCK_BANKS.map((bank) => (
          <TouchableOpacity
            key={bank.name}
            style={[flow.bankRow, selectedBank?.name === bank.name && { borderColor: primaryColor, backgroundColor: primaryColor + '10' }]}
            onPress={() => setSelectedBank(bank)}
          >
            <Text style={flow.bankLogo}>{bank.logo}</Text>
            <Text style={[flow.bankName, selectedBank?.name === bank.name && { color: primaryColor, fontWeight: '700' }]}>
              {bank.name}
            </Text>
            {selectedBank?.name === bank.name && (
              <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[flow.connectBtn, { backgroundColor: selectedBank ? primaryColor : '#D1D5DB' }]}
        disabled={!selectedBank}
        onPress={() => setStep('type')}
      >
        <Text style={flow.connectBtnText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

function ConnectedAccountCard({ account, onDisconnect }: { account: BankAccount; onDisconnect: () => void }) {
  const { getPendingForAccount } = useBank();
  const { primaryColor } = useTheme();
  const pending = getPendingForAccount(account.id);

  return (
    <View style={card.container}>
      <View style={card.row}>
        <Text style={card.logo}>{account.institutionLogo}</Text>
        <View style={card.info}>
          <Text style={card.name}>{account.institutionName}</Text>
          <Text style={card.sub}>
            {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} ••••{account.accountMask}
          </Text>
        </View>
        <View style={[card.statusDot, { backgroundColor: account.isActive ? '#10B981' : '#EF4444' }]} />
        <TouchableOpacity onPress={onDisconnect} style={card.disconnectBtn}>
          <Ionicons name="unlink-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {pending.length > 0 && (
        <View style={[card.pendingBadge, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }]}>
          <Ionicons name="time-outline" size={14} color={primaryColor} />
          <Text style={[card.pendingText, { color: primaryColor }]}>
            {pending.length} transaction{pending.length > 1 ? 's' : ''} waiting to be categorized
          </Text>
        </View>
      )}

      <View style={card.hintRow}>
        <View style={card.hintChip}>
          <Ionicons name="list-outline" size={13} color="#6B7280" />
          <Text style={card.hintText}>Sort in Transactions</Text>
        </View>
        <View style={card.hintChip}>
          <Ionicons name="swap-horizontal-outline" size={13} color="#6B7280" />
          <Text style={card.hintText}>Swipe to categorize</Text>
        </View>
      </View>

      <Text style={card.connectedAt}>Connected {account.connectedAt}</Text>
    </View>
  );
}

function BankContent() {
  const { accounts, disconnectAccount, pendingTransactions } = useBank();
  const { primaryColor } = useTheme();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const totalPending = pendingTransactions.filter((t) => !t.categorized).length;

  const handleDisconnect = (id: string, name: string) => {
    Alert.alert(
      `Disconnect ${name}?`,
      'This will remove the account and all imported transactions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => disconnectAccount(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Bank Accounts</Text>
        <Text style={styles.headerSub}>Connect your accounts to import transactions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Pending banner */}
        {totalPending > 0 && (
          <View style={[styles.pendingBanner, { backgroundColor: primaryColor + '12', borderColor: primaryColor + '30' }]}>
            <Ionicons name="alert-circle-outline" size={20} color={primaryColor} />
            <Text style={[styles.pendingBannerText, { color: primaryColor }]}>
              <Text style={{ fontWeight: '800' }}>{totalPending} transactions</Text> imported and waiting to be categorized
            </Text>
          </View>
        )}

        {/* Connected accounts */}
        {accounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Accounts</Text>
            {accounts.map((acct) => (
              <ConnectedAccountCard
                key={acct.id}
                account={acct}
                onDisconnect={() => handleDisconnect(acct.id, acct.institutionName)}
              />
            ))}
          </View>
        )}

        {/* Add account CTA */}
        <TouchableOpacity
          style={[styles.addAccountBtn, { borderColor: primaryColor }]}
          onPress={() => setShowConnectModal(true)}
        >
          <View style={[styles.addAccountIcon, { backgroundColor: primaryColor + '15' }]}>
            <Ionicons name="add" size={26} color={primaryColor} />
          </View>
          <View style={styles.addAccountText}>
            <Text style={[styles.addAccountTitle, { color: primaryColor }]}>
              {accounts.length === 0 ? 'Connect a Bank Account' : 'Add Another Account'}
            </Text>
            <Text style={styles.addAccountSub}>
              Transactions will auto-import and be ready to sort or swipe
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={primaryColor} />
        </TouchableOpacity>

        {/* How it works */}
        <View style={styles.howSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { icon: 'link-outline',             color: primaryColor, title: 'Connect your bank',         body: 'Securely link your account using Plaid — your credentials never touch our servers.' },
            { icon: 'download-outline',          color: '#10B981',   title: 'Transactions auto-import',  body: 'New transactions appear automatically, ready to sort.' },
            { icon: 'list-outline',              color: '#3B82F6',   title: 'Sort in Transactions tab',  body: 'Browse and manually assign categories to each imported transaction.' },
            { icon: 'swap-horizontal-outline',   color: '#8B5CF6',   title: 'Swipe to categorize',       body: 'Swipe right to keep and categorize, left to skip — like Tinder for your spending.' },
          ].map((step) => (
            <View key={step.title} style={styles.howRow}>
              <View style={[styles.howIcon, { backgroundColor: step.color + '15' }]}>
                <Ionicons name={step.icon as any} size={20} color={step.color} />
              </View>
              <View style={styles.howText}>
                <Text style={styles.howTitle}>{step.title}</Text>
                <Text style={styles.howBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plaidNote}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
          <Text style={styles.plaidNoteText}>
            Bank sync powered by <Text style={{ fontWeight: '800' }}>Plaid</Text> — coming soon. Your connection is set up and ready to activate.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showConnectModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Connect Bank Account</Text>
              <TouchableOpacity onPress={() => setShowConnectModal(false)}>
                <Ionicons name="close-circle" size={26} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            <ConnectFlow onClose={() => setShowConnectModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function BankConnectionScreen() {
  return (
    <PremiumGate requiredTier="pro_lite">
      <BankContent />
    </PremiumGate>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },
  content: { padding: 16, paddingBottom: 48 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14 },
  pendingBannerText: { flex: 1, fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  addAccountBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  addAccountIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  addAccountText: { flex: 1 },
  addAccountTitle: { fontSize: 15, fontWeight: '800' },
  addAccountSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  howSection: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  howIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  howText: { flex: 1 },
  howTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  howBody: { fontSize: 13, color: '#6B7280', marginTop: 2, lineHeight: 18 },
  plaidNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BBF7D0',
  },
  plaidNoteText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
});

const card = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  sub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  disconnectBtn: { padding: 6 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, padding: 8, marginTop: 10 },
  pendingText: { fontSize: 12, fontWeight: '600', flex: 1 },
  hintRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  hintChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  hintText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  connectedAt: { fontSize: 11, color: '#D1D5DB', marginTop: 8 },
});

const flow = StyleSheet.create({
  container: { flex: 1 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  stepSub: { fontSize: 14, color: '#9CA3AF', marginBottom: 16 },
  bankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, marginBottom: 8,
  },
  bankLogo: { fontSize: 24 },
  bankName: { flex: 1, fontSize: 15, color: '#1F2937', fontWeight: '500' },
  typeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 16, marginBottom: 10,
  },
  typeLabel: { flex: 1, fontSize: 16, color: '#1F2937', fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backBtn: { flex: 1, borderRadius: 14, padding: 15, alignItems: 'center', backgroundColor: '#F3F4F6' },
  backBtnText: { fontWeight: '700', color: '#6B7280', fontSize: 15 },
  connectBtn: { flex: 2, borderRadius: 14, padding: 15, alignItems: 'center', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  connectBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  disclaimer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16, lineHeight: 18 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  successCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', textAlign: 'center', marginBottom: 12 },
  successBody: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  doneBtn: { borderRadius: 14, paddingHorizontal: 40, paddingVertical: 15, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
