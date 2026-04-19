import React, { createContext, useContext, useState } from 'react';

export const PRESET_COLORS = [
  { name: 'Indigo',    value: '#4F46E5' },
  { name: 'Violet',   value: '#7C3AED' },
  { name: 'Rose',     value: '#E11D48' },
  { name: 'Orange',   value: '#EA580C' },
  { name: 'Amber',    value: '#D97706' },
  { name: 'Emerald',  value: '#059669' },
  { name: 'Teal',     value: '#0D9488' },
  { name: 'Sky',      value: '#0284C7' },
  { name: 'Fuchsia',  value: '#C026D3' },
  { name: 'Slate',    value: '#475569' },
  { name: 'Pink',     value: '#DB2777' },
  { name: 'Lime',     value: '#65A30D' },
];

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  housing:       '#EF4444',
  utilities:     '#F59E0B',
  transport:     '#3B82F6',
  entertainment: '#8B5CF6',
  health:        '#EC4899',
  food:          '#10B981',
  savings:       '#14B8A6',
  debt:          '#F97316',
  other:         '#6B7280',
};

interface ThemeContextValue {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  categoryColors: Record<string, string>;
  setCategoryColor: (category: string, color: string) => void;
  resetCategoryColors: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  primaryColor: '#4F46E5',
  setPrimaryColor: () => {},
  categoryColors: DEFAULT_CATEGORY_COLORS,
  setCategoryColor: () => {},
  resetCategoryColors: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [categoryColors, setCategoryColors] = useState({ ...DEFAULT_CATEGORY_COLORS });

  const setCategoryColor = (category: string, color: string) => {
    setCategoryColors((prev) => ({ ...prev, [category]: color }));
  };

  const resetCategoryColors = () => setCategoryColors({ ...DEFAULT_CATEGORY_COLORS });

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, categoryColors, setCategoryColor, resetCategoryColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
