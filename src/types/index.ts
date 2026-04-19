export type SubscriptionTier = 'free' | 'pro_lite' | 'pro_ultra';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  billingPeriod: 'month' | 'year';
  features: string[];
  color: string;
}

export const PLANS: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'month',
    color: '#6B7280',
    features: [
      'Budget list view',
      'Manual transaction entry',
      'Spending categories',
      'Monthly summary',
    ],
  },
  {
    tier: 'pro_lite',
    name: 'Pro Lite',
    price: 4.99,
    billingPeriod: 'month',
    color: '#4F46E5',
    features: [
      'Everything in Free',
      'Calendar view',
      'Swipe-to-categorize transactions',
      'Bank account sync (coming soon)',
    ],
  },
  {
    tier: 'pro_ultra',
    name: 'Pro Ultra',
    price: 9.99,
    billingPeriod: 'month',
    color: '#7C3AED',
    features: [
      'Everything in Pro Lite',
      'AI financial assistant (coming soon)',
      'Debt consolidation tools (coming soon)',
      'Advanced spending insights',
      'Priority support',
    ],
  },
];

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
