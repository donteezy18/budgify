import React, { createContext, useContext, useState } from 'react';

export interface DueItem {
  id: string;
  date: string;
  label: string;
  amount: number;
  category: string;
  isPaid: boolean;
  emoji?: string;
}

interface CalendarContextValue {
  items: DueItem[];
  addItem: (item: Omit<DueItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<DueItem>) => void;
  deleteItem: (id: string) => void;
  getItemsForDate: (date: string) => DueItem[];
}

const CalendarContext = createContext<CalendarContextValue>({
  items: [],
  addItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
  getItemsForDate: () => [],
});

const SEED_ITEMS: DueItem[] = [
  { id: 's1', date: '2026-04-20', label: 'Rent',         amount: 1500,  category: 'housing',       isPaid: false },
  { id: 's2', date: '2026-04-22', label: 'Electric Bill', amount: 110,   category: 'utilities',     isPaid: false },
  { id: 's3', date: '2026-04-25', label: 'Car Insurance', amount: 87,    category: 'transport',     isPaid: false },
  { id: 's4', date: '2026-04-15', label: 'Netflix',       amount: 15.99, category: 'entertainment', isPaid: true  },
  { id: 's5', date: '2026-04-28', label: 'Gym Membership',amount: 45,    category: 'health',        isPaid: false },
];

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DueItem[]>(SEED_ITEMS);

  const addItem = (item: Omit<DueItem, 'id'>) =>
    setItems((prev) => [...prev, { ...item, id: Date.now().toString() }]);

  const updateItem = (id: string, updates: Partial<DueItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));

  const deleteItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const getItemsForDate = (date: string) => items.filter((i) => i.date === date);

  return (
    <CalendarContext.Provider value={{ items, addItem, updateItem, deleteItem, getItemsForDate }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => useContext(CalendarContext);
