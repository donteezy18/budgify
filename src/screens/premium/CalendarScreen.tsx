import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumGate from '../../components/PremiumGate';
import DueItemModal from '../../components/DueItemModal';
import { useCalendar, DueItem, CATEGORY_COLORS } from '../../store/CalendarContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 32) / 7);
const TODAY = new Date().toISOString().split('T')[0];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_EMOJIS: Record<string, string> = {
  housing: '🏠', utilities: '💡', transport: '🚗', food: '🍔',
  entertainment: '🎬', health: '❤️', savings: '💰', debt: '📉', other: '📦',
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Block Calendar Grid ──────────────────────────────────────────────────────
function BlockCalendar({
  year, month, selectedDate, onSelectDate, itemsByDate,
}: {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  itemsByDate: Record<string, DueItem[]>;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={gridStyles.grid}>
      {/* Day headers */}
      <View style={gridStyles.headerRow}>
        {DAY_HEADERS.map((d) => (
          <View key={d} style={gridStyles.headerCell}>
            <Text style={gridStyles.headerText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <View key={wi} style={gridStyles.weekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={gridStyles.emptyCell} />;

            const dateStr = toDateString(year, month, day);
            const items = itemsByDate[dateStr] ?? [];
            const isToday = dateStr === TODAY;
            const isSelected = dateStr === selectedDate;
            const unpaidItems = items.filter((i) => !i.isPaid);
            const paidItems = items.filter((i) => i.isPaid);

            return (
              <TouchableOpacity
                key={di}
                style={[
                  gridStyles.cell,
                  isToday && gridStyles.todayCell,
                  isSelected && gridStyles.selectedCell,
                ]}
                onPress={() => onSelectDate(dateStr)}
                activeOpacity={0.75}
              >
                <Text style={[
                  gridStyles.dayNum,
                  isToday && gridStyles.todayNum,
                  isSelected && gridStyles.selectedNum,
                ]}>
                  {day}
                </Text>

                {/* Show up to 2 item chips, then +N more */}
                {unpaidItems.slice(0, 2).map((item) => (
                  <View
                    key={item.id}
                    style={[gridStyles.itemChip, { backgroundColor: CATEGORY_COLORS[item.category] + '22', borderLeftColor: CATEGORY_COLORS[item.category] }]}
                  >
                    <Text style={[gridStyles.itemChipText, { color: CATEGORY_COLORS[item.category] }]} numberOfLines={1}>
                      ${item.amount % 1 === 0 ? item.amount : item.amount.toFixed(0)}
                    </Text>
                  </View>
                ))}

                {unpaidItems.length > 2 && (
                  <Text style={gridStyles.moreText}>+{unpaidItems.length - 2}</Text>
                )}

                {paidItems.length > 0 && unpaidItems.length === 0 && (
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginTop: 2 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, onEdit, onToggle, onDelete }: {
  item: DueItem;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const color = CATEGORY_COLORS[item.category] ?? '#6B7280';
  return (
    <View style={[styles.itemRow, item.isPaid && styles.itemRowPaid]}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkCircle, { borderColor: color }, item.isPaid && { backgroundColor: color }]}
      >
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
function CalendarContent() {
  const { items, getItemsForDate, updateItem, deleteItem } = useCalendar();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<DueItem | null>(null);

  const todayDate = new Date();
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());

  const selectedItems = getItemsForDate(selectedDate);
  const totalDue = selectedItems.filter((i) => !i.isPaid).reduce((s, i) => s + i.amount, 0);
  const totalPaid = selectedItems.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0);

  // Group items by date for the grid
  const itemsByDate: Record<string, DueItem[]> = {};
  items.forEach((item) => {
    if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
    itemsByDate[item.date].push(item);
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
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

  const upcoming = items
    .filter((i) => !i.isPaid && i.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSub}>Tap a date to view or add items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Block calendar grid */}
        <View style={styles.calendarWrapper}>
          <BlockCalendar
            year={viewYear}
            month={viewMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            itemsByDate={itemsByDate}
          />
        </View>

        {/* Selected day panel */}
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
              <Text style={styles.emptyDaySubText}>Tap the button below to add something</Text>
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

        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.sectionTitle}>Upcoming this month</Text>
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
        )}
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

export default function CalendarScreen() {
  return (
    <PremiumGate requiredTier="pro_lite">
      <CalendarContent />
    </PremiumGate>
  );
}

// ─── Grid Styles ──────────────────────────────────────────────────────────────
const gridStyles = StyleSheet.create({
  grid: { width: '100%' },
  headerRow: { flexDirection: 'row' },
  headerCell: {
    width: CELL_SIZE, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  weekRow: { flexDirection: 'row' },
  emptyCell: { width: CELL_SIZE, height: CELL_SIZE + 10 },
  cell: {
    width: CELL_SIZE,
    minHeight: CELL_SIZE + 10,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 3,
    backgroundColor: '#fff',
  },
  todayCell: { backgroundColor: '#EEF2FF' },
  selectedCell: { backgroundColor: '#4F46E5' },
  dayNum: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 2 },
  todayNum: { color: '#4F46E5', fontWeight: '800' },
  selectedNum: { color: '#fff', fontWeight: '800' },
  itemChip: {
    borderLeftWidth: 2,
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginBottom: 1,
  },
  itemChipText: { fontSize: 9, fontWeight: '700' },
  moreText: { fontSize: 9, color: '#9CA3AF', fontWeight: '700', marginTop: 1 },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  headerSub: { color: '#C7D2FE', fontSize: 14, marginTop: 2 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  monthTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  calendarWrapper: {
    marginHorizontal: 16,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 0.5, borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  dayPanel: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  dayPanelHeader: { marginBottom: 12 },
  dayPanelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayPanelDate: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  todayBadge: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
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
    borderWidth: 1.5, borderColor: '#E0E7FF', borderRadius: 12, borderStyle: 'dashed',
  },
  addDayBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
  upcomingSection: {
    marginHorizontal: 16, marginTop: 14,
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
