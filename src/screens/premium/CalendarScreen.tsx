import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Dimensions, Pressable,
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

// ─── Single calendar cell ─────────────────────────────────────────────────────
function CalendarCell({
  day, dateStr, isToday, isSelected, items, onPress, onLongPress,
}: {
  day: number;
  dateStr: string;
  isToday: boolean;
  isSelected: boolean;
  items: DueItem[];
  onPress: () => void;
  onLongPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const unpaidItems = items.filter((i) => !i.isPaid);
  const paidItems   = items.filter((i) => i.isPaid);
  const showCircle  = isToday || isSelected || pressed;

  return (
    <Pressable
      style={gridStyles.cell}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {/* Date number with circle */}
      <View style={gridStyles.dayNumRow}>
        <View style={[
          gridStyles.dayCircle,
          isToday    && gridStyles.dayCircleToday,
          isSelected && !isToday && gridStyles.dayCircleSelected,
          pressed && !isToday && !isSelected && gridStyles.dayCircleHover,
        ]}>
          <Text style={[
            gridStyles.dayNum,
            isToday    && gridStyles.dayNumToday,
            isSelected && !isToday && gridStyles.dayNumSelected,
            pressed && !isToday && !isSelected && gridStyles.dayNumHover,
          ]}>
            {day}
          </Text>
        </View>
      </View>

      {/* Item chips: label + amount */}
      {unpaidItems.slice(0, 2).map((item) => {
        const color = CATEGORY_COLORS[item.category];
        const amtStr = `$${item.amount % 1 === 0 ? item.amount : item.amount.toFixed(0)}`;
        return (
          <View key={item.id} style={[gridStyles.itemChip, { backgroundColor: color + '20', borderLeftColor: color }]}>
            <Text style={[gridStyles.itemChipText, { color }]} numberOfLines={1}>
              {item.label} {amtStr}
            </Text>
          </View>
        );
      })}

      {unpaidItems.length > 2 && (
        <Text style={gridStyles.moreText}>+{unpaidItems.length - 2} more</Text>
      )}

      {paidItems.length > 0 && unpaidItems.length === 0 && (
        <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginTop: 2 }} />
      )}
    </Pressable>
  );
}

// ─── Block Calendar Grid ──────────────────────────────────────────────────────
function BlockCalendar({
  year, month, selectedDate, onSelectDate, onAddForDate, itemsByDate,
}: {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddForDate: (date: string) => void;
  itemsByDate: Record<string, DueItem[]>;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View style={gridStyles.grid}>
      <View style={gridStyles.headerRow}>
        {DAY_HEADERS.map((d) => (
          <View key={d} style={gridStyles.headerCell}>
            <Text style={gridStyles.headerText}>{d}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={gridStyles.weekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={gridStyles.emptyCell} />;
            const dateStr = toDateString(year, month, day);
            return (
              <CalendarCell
                key={di}
                day={day}
                dateStr={dateStr}
                isToday={dateStr === TODAY}
                isSelected={dateStr === selectedDate}
                items={itemsByDate[dateStr] ?? []}
                onPress={() => onSelectDate(dateStr)}
                onLongPress={() => onAddForDate(dateStr)}
              />
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

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── Unified Day + Upcoming Panel ────────────────────────────────────────────
function DayPanel({
  selectedDate,
  onSelectDate,
  onEdit,
  onAdd,
}: {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  onEdit: (item: DueItem) => void;
  onAdd: () => void;
}) {
  const { items, getItemsForDate, updateItem, deleteItem } = useCalendar();
  const [upcomingOpen, setUpcomingOpen] = useState(true);

  const selectedItems = getItemsForDate(selectedDate);
  const totalDue = selectedItems.filter((i) => !i.isPaid).reduce((s, i) => s + i.amount, 0);
  const totalPaid = selectedItems.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0);
  const isToday = selectedDate === TODAY;

  const upcoming = items
    .filter((i) => !i.isPaid && i.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Remove this from your calendar?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const prevDate = shiftDate(selectedDate, -1);
  const nextDate = shiftDate(selectedDate, 1);
  const prevItems = getItemsForDate(prevDate);
  const nextItems = getItemsForDate(nextDate);

  return (
    <View style={styles.unifiedCard}>
      {/* ── Day navigation row ── */}
      <View style={styles.dayNavRow}>
        <TouchableOpacity
          style={styles.dayNavBtn}
          onPress={() => onSelectDate(prevDate)}
        >
          <Ionicons name="chevron-back" size={18} color="#4F46E5" />
          <View style={styles.dayNavHint}>
            <Text style={styles.dayNavHintDate}>{formatShort(prevDate)}</Text>
            <Text style={styles.dayNavHintSub} numberOfLines={1}>
              {prevItems.length > 0 ? `${prevItems.length} item${prevItems.length > 1 ? 's' : ''}` : 'Nothing due'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dayNavCenter}>
          <Text style={styles.dayNavTitle} numberOfLines={1}>
            {isToday ? 'Today' : formatShort(selectedDate)}
          </Text>
          {selectedItems.length === 0 ? (
            <Text style={styles.dayNavEmpty}>Nothing due</Text>
          ) : (
            <View style={styles.dayNavSummary}>
              <Text style={styles.dayNavDue}>-${totalDue.toFixed(2)}</Text>
              {totalPaid > 0 && <Text style={styles.dayNavPaid}>✓${totalPaid.toFixed(2)}</Text>}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.dayNavBtn, styles.dayNavBtnRight]}
          onPress={() => onSelectDate(nextDate)}
        >
          <View style={styles.dayNavHint}>
            <Text style={styles.dayNavHintDate}>{formatShort(nextDate)}</Text>
            <Text style={styles.dayNavHintSub} numberOfLines={1}>
              {nextItems.length > 0 ? `${nextItems.length} item${nextItems.length > 1 ? 's' : ''}` : 'Nothing due'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* ── Item list ── */}
      {selectedItems.length > 0 && (
        <View style={styles.itemList}>
          {selectedItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onEdit={() => onEdit(item)}
              onToggle={() => updateItem(item.id, { isPaid: !item.isPaid })}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.addDayBtn} onPress={onAdd}>
        <Ionicons name="add-circle" size={18} color="#4F46E5" />
        <Text style={styles.addDayBtnText}>Add item on this date</Text>
      </TouchableOpacity>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Upcoming collapsible ── */}
      <TouchableOpacity
        style={styles.upcomingToggle}
        onPress={() => setUpcomingOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <Text style={styles.upcomingToggleText}>Upcoming this month</Text>
        <Ionicons
          name={upcomingOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {upcomingOpen && (
        <View style={styles.upcomingList}>
          {upcoming.length === 0 ? (
            <Text style={styles.upcomingEmpty}>No upcoming items</Text>
          ) : (
            upcoming.map((item) => {
              const color = CATEGORY_COLORS[item.category] ?? '#6B7280';
              const daysUntil = Math.ceil(
                (new Date(item.date + 'T00:00:00').getTime() - new Date(TODAY + 'T00:00:00').getTime()) / 86400000
              );
              const whenLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.upcomingRow}
                  onPress={() => onSelectDate(item.date)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.upcomingDot, { backgroundColor: color }]} />
                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingLabel}>{item.label}</Text>
                    <Text style={[styles.upcomingWhen, { color }]}>{whenLabel}</Text>
                  </View>
                  <Text style={[styles.upcomingAmount, { color }]}>${item.amount.toFixed(2)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#D1D5DB" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
function CalendarContent() {
  const { items } = useCalendar();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<DueItem | null>(null);

  const todayDate = new Date();
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());

  // When selected date changes, keep the grid month in sync
  const handleSelectDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    setSelectedDate(date);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSub}>Tap a date to view or add items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWrapper}>
          <BlockCalendar
            year={viewYear}
            month={viewMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onAddForDate={(date) => { handleSelectDate(date); setEditItem(null); setShowAddModal(true); }}
            itemsByDate={itemsByDate}
          />
        </View>

        <DayPanel
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onEdit={(item) => { setEditItem(item); setShowAddModal(true); }}
          onAdd={() => { setEditItem(null); setShowAddModal(true); }}
        />
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
const CIRCLE_SIZE = Math.min(CELL_SIZE - 6, 26);

const gridStyles = StyleSheet.create({
  grid: { width: '100%' },
  headerRow: { flexDirection: 'row' },
  headerCell: { width: CELL_SIZE, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  weekRow: { flexDirection: 'row' },
  emptyCell: { width: CELL_SIZE, minHeight: CELL_SIZE + 14 },
  cell: {
    width: CELL_SIZE,
    minHeight: CELL_SIZE + 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingBottom: 4,
    paddingHorizontal: 2,
    backgroundColor: '#fff',
  },

  // Date number circle
  dayNumRow: { alignItems: 'center', marginBottom: 3, marginTop: 2 },
  dayCircle: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  dayCircleToday: { backgroundColor: '#4F46E5' },
  dayCircleSelected: { backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: '#4F46E5' },
  dayCircleHover: { backgroundColor: '#F3F4F6' },

  dayNum: { fontSize: 12, fontWeight: '600', color: '#374151' },
  dayNumToday: { color: '#fff', fontWeight: '800' },
  dayNumSelected: { color: '#4F46E5', fontWeight: '800' },
  dayNumHover: { color: '#1F2937', fontWeight: '700' },

  // Item chips with label
  itemChip: {
    borderLeftWidth: 2, borderRadius: 3,
    paddingHorizontal: 3, paddingVertical: 1, marginBottom: 2,
  },
  itemChipText: { fontSize: 8, fontWeight: '700' },
  moreText: { fontSize: 8, color: '#9CA3AF', fontWeight: '700', marginTop: 1, paddingHorizontal: 3 },
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
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    borderWidth: 0.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  // ── Unified card ──
  unifiedCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    borderRadius: 20, paddingTop: 4, paddingBottom: 18, paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },

  // ── Day navigation row ──
  dayNavRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 4,
  },
  dayNavBtn: {
    flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4,
  },
  dayNavBtnRight: { justifyContent: 'flex-end' },
  dayNavHint: { flex: 1 },
  dayNavHintDate: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  dayNavHintSub: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  dayNavCenter: { flex: 1.4, alignItems: 'center' },
  dayNavTitle: { fontSize: 14, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  dayNavEmpty: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  dayNavSummary: { flexDirection: 'row', gap: 6, marginTop: 2, alignItems: 'center' },
  dayNavDue: { fontSize: 12, fontWeight: '800', color: '#EF4444' },
  dayNavPaid: { fontSize: 12, fontWeight: '700', color: '#10B981' },

  // ── Item list ──
  itemList: { gap: 8, marginBottom: 4 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, gap: 10,
  },
  itemRowPaid: { opacity: 0.55 },
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
    gap: 6, marginTop: 10, paddingVertical: 9,
    borderWidth: 1.5, borderColor: '#E0E7FF', borderRadius: 12, borderStyle: 'dashed',
  },
  addDayBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },

  // ── Upcoming collapsible ──
  upcomingToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 2,
  },
  upcomingToggleText: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  upcomingList: { marginTop: 10, gap: 2 },
  upcomingEmpty: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  upcomingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  upcomingDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  upcomingInfo: { flex: 1 },
  upcomingLabel: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  upcomingWhen: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  upcomingAmount: { fontSize: 13, fontWeight: '800' },
});
