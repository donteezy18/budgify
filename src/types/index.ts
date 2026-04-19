export type SubscriptionTier = 'free' | 'pro' | 'plus';

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  spent: number;
  category: BudgetCategory;
  month: number;
  year: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  budgetId?: string;
  description: string;
  amount: number;
  category: BudgetCategory;
  date: string;
  isPlaidImport: boolean;
  categorized: boolean;
}

export type BudgetCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'savings'
  | 'debt'
  | 'other';
