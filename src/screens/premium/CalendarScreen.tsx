import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import PremiumGate from '../../components/PremiumGate';
import DueItemModal from '../../components/DueItemModal';
import { useCalendar, DueItem, CATEGORY_COLORS } from '../../store/CalendarContext';

const TODAY = new Date().toISOString().split('T')[0];

const CATEGORY_EMOJIS: Record<string, string> = {
  housing: '🏠', utilities: '💡', transport: '🚗', food: '🍔',
  entertainment: '🎬', health: '❤️', savings: '💰', debt: '📉', other: '📦',
};

function ItemRow({ item, onEdit, onToggle, onDelete }: {
  item: DueItem;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const color = CATEGORY_COLORS[item.category] ?? '#6B7280';
  return (
    <View style={[styles.itemRow, item.isPaid && styles.itemRowPaid]}>
      <TouchableOpacity onPress={onToggle} style={[styles.checkCircle, { borderColor: color }, item.isPaid && { backgroundColor: color }]}>
        {item.isPaid && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemLabel, item.isPaid && styles.itemLabelPaid]}>
          {CATEGORY_EMOJIS[item.category]} {item.label}
        </Text>
        <Text style={[styles.itemCategory, { color }]}>{item.category}</Text>
      </View>
      <Text style={[styles.itemAmount, item.isPaid && styles.itemAmountPaid]}>
        ${item.amount.toFixed(2)}
      </Text>
      <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
        <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

function CalendarContent() {
  const { getItemsForDate, getMarkedDates, updateItem, deleteItem } = useCalendar();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<DueItem | null>(null);

  const selectedItems = getItemsForDate(selectedDate);
  const markedDates = getMarkedDates();

  const totalDue = selectedItems.filter((i) => !i.isPaid).reduce((s, i) => s + i.amount, 0);
  const totalPaid = selectedItems.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0);

  const marked = {
    ...markedDates,
    [selectedDate]: {
      ...(markedDates[selectedDate] ?? {}),
      selected: true,
      selectedColor: '#4F46E5',
    },
    [TODAY]: {
      ...(markedDates[TODAY] ?? {}),
      ...(selectedDate !== TODAY ? { marked: true, dotColor: '#4F46E5' } : {}),
    },
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Remove this from your calendar?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSub}>Tap a date to view or add items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Calendar
          current={TODAY}
          onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
          markingType="multi-dot"
          markedDates={marked}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            selectedDayBackgroundColor: '#4F46E5',
            selectedDayTextColor: '#fff',
            todayTextColor: '#4F46E5',
            dayTextColor: '#1F2937',
            textDisabledColor: '#D1D5DB',
            dotColor: '#4F46E5',
            arrowColor: '#4F46E5',
            monthTextColor: '#1F2937',
            textMonthFontWeight: '800',
            textMonthFontSize: 17,
            textDayFontWeight: '500',
            textDayHeaderFontWeight: '700',
            textDayHeaderFontSize: 12,
          }}
          style={styles.calendar}
        />

        <View style={styles.dayPanel}>
          <View style={styles.dayPanelHeader}>
            <View style={styles.dayPanelTitleRow}>
              <Text style={styles.dayPanelDate}>{formatDisplayDate(selectedDate)}</Text>
              {selectedDate === TODAY && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Today</Text>
                </View>
              )}
            </View>

            {selectedItems.length > 0 && (
              <View style={styles.daySummaryRow}>
                <View style={styles.daySummaryChip}>
                  <Text style={styles.daySummaryLabel}>Due</Text>
                  <Text style={[styles.daySummaryValue, { color: '#EF4444' }]}>${totalDue.toFixed(2)}</Text>
                </View>
                <View style={styles.daySummaryChip}>
                  <Text style={styles.daySummaryLabel}>Paid</Text>
                  <Text style={[styles.daySummaryValue, { color: '#10B981' }]}>${totalPaid.toFixed(2)}</Text>
                </View>
              </View>
            )}
          </View>

          {selectedItems.length === 0 ? (
            <View style={styles.emptyDay}>
              <Ionicons name="calendar-outline" size={36} color="#E5E7EB" />
              <Text style={styles.emptyDayText}>Nothing due on this day</Text>
              <Text style={styles.emptyDaySubText}>Tap the + button to add something</Text>
            </View>
          ) : (
            <View style={styles.itemList}>
              {selectedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => { setEditItem(item); setShowAddModal(true); }}
                  onToggle={() => updateItem(item.id, { isPaid: !item.isPaid })}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addDayBtn}
            onPress={() => { setEditItem(null); setShowAddModal(true); }}
          >
            <Ionicons name="add-circle" size={20} color="#4F46E5" />
            <Text style={styles.addDayBtnText}>Add item on this date</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Upcoming this month</Text>
          <UpcomingList />
        </View>
      </ScrollView>

      <DueItemModal
        visible={showAddModal}
        date={selectedDate}
        editItem={editItem}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
      />
    </View>
  );
}

function UpcomingList() {
  const { items } = useCalendar();
  const upcoming = items
    .filter((i) => !i.isPaid && i.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <View>
      {upcoming.map((item) => {
        const color = CATEGORY_COLORS[item.category] ?? '#6B7280';
        const daysUntil = Math.ceil(
          (new Date(item.date + 'T00:00:00').getTime() - new Date(TODAY + 'T00:00:00').getTime()) / 86400000
        );
        return (
          <View key={item.id} style={styles.upcomingRow}>
            <View style={[styles.upcomingDot, { backgroundColor: color }]} />
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>{item.label}</Text>
              <Text style={styles.upcomingDate}>
                {item.date} · {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
              </Text>
            </View>
            <Text style={[styles.upcomingAmount, { color }]}>${item.amount.toFixed(2)}</Text>
          </View>
        );
      })}
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
  calendar: {
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dayPanel: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dayPanelHeader: { marginBottom: 12 },
  dayPanelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayPanelDate: { fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1 },
  todayBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  todayBadgeText: { color: '#4F46E5', fontSize: 11, fontWeight: '700' },
  daySummaryRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  daySummaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  daySummaryLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  daySummaryValue: { fontSize: 14, fontWeight: '800' },
  emptyDay: { alignItems: 'center', paddingVertical: 24 },
  emptyDayText: { fontSize: 15, color: '#9CA3AF', marginTop: 10, fontWeight: '600' },
  emptyDaySubText: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
  itemList: { gap: 10 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, gap: 10,
  },
  itemRowPaid: { opacity: 0.6 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  itemLabelPaid: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  itemCategory: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  itemAmount: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  itemAmountPaid: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  iconBtn: { padding: 4 },
  addDayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#E0E7FF', borderRadius: 12,
    borderStyle: 'dashed',
  },
  addDayBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
  upcomingSection: {
    marginHorizontal: 12, marginTop: 16, marginBottom: 32,
    backgroundColor: '#fff', borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
  upcomingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  upcomingDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  upcomingInfo: { flex: 1 },
  upcomingLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  upcomingDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  upcomingAmount: { fontSize: 14, fontWeight: '800' },
});
