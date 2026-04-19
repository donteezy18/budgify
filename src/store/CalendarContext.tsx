import React, { createContext, useContext, useState } from 'react';

export interface DueItem {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  amount: number;
  category: string;
  isPaid: boolean;
}

interface CalendarContextValue {
  items: DueItem[];
  addItem: (item: Omit<DueItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<DueItem>) => void;
  deleteItem: (id: string) => void;
  getItemsForDate: (date: string) => DueItem[];
  getMarkedDates: () => Record<string, any>;
}

const CalendarContext = createContext<CalendarContextValue>({
  items: [],
  addItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
  getItemsForDate: () => [],
  getMarkedDates: () => ({}),
});

const SEED_ITEMS: DueItem[] = [
  { id: 's1', date: '2026-04-20', label: 'Rent', amount: 1500, category: 'housing', isPaid: false },
  { id: 's2', date: '2026-04-22', label: 'Electric Bill', amount: 110, category: 'utilities', isPaid: false },
  { id: 's3', date: '2026-04-25', label: 'Car Insurance', amount: 87, category: 'transport', isPaid: false },
  { id: 's4', date: '2026-04-15', label: 'Netflix', amount: 15.99, category: 'entertainment', isPaid: true },
  { id: 's5', date: '2026-04-28', label: 'Gym Membership', amount: 45, category: 'health', isPaid: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  housing: '#EF4444',
  utilities: '#F59E0B',
  transport: '#3B82F6',
  entertainment: '#8B5CF6',
  health: '#EC4899',
  food: '#10B981',
  savings: '#14B8A6',
  debt: '#F97316',
  other: '#6B7280',
};

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DueItem[]>(SEED_ITEMS);

  const addItem = (item: Omit<DueItem, 'id'>) => {
    setItems((prev) => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const updateItem = (id: string, updates: Partial<DueItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getItemsForDate = (date: string) =>
    items.filter((i) => i.date === date);

  const getMarkedDates = () => {
    const marks: Record<string, any> = {};
    items.forEach((item) => {
      const color = CATEGORY_COLORS[item.category] ?? '#6B7280';
      const dot = { key: item.id, color: item.isPaid ? '#D1D5DB' : color };
      if (marks[item.date]) {
        marks[item.date].dots = [...(marks[item.date].dots ?? []), dot];
      } else {
        marks[item.date] = { dots: [dot] };
      }
    });
    return marks;
  };

  return (
    <CalendarContext.Provider value={{ items, addItem, updateItem, deleteItem, getItemsForDate, getMarkedDates }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => useContext(CalendarContext);
export { CATEGORY_COLORS };
