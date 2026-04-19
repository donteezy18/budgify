import React, { createContext, useContext, useState } from 'react';

export interface BankAccount {
  id: string;
  institutionName: string;
  institutionLogo: string; // emoji placeholder until Plaid logo API
  accountType: 'checking' | 'savings' | 'credit';
  accountMask: string; // last 4 digits
  connectedAt: string;
  isActive: boolean;
}

export interface PendingTransaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  categorized: boolean;
}

interface BankContextValue {
  accounts: BankAccount[];
  pendingTransactions: PendingTransaction[];
  connectAccount: (account: Omit<BankAccount, 'id' | 'connectedAt'>) => void;
  disconnectAccount: (id: string) => void;
  categorizeTransaction: (id: string, category: string) => void;
  dismissTransaction: (id: string) => void;
  getPendingForAccount: (accountId: string) => PendingTransaction[];
}

const BankContext = createContext<BankContextValue>({
  accounts: [],
  pendingTransactions: [],
  connectAccount: () => {},
  disconnectAccount: () => {},
  categorizeTransaction: () => {},
  dismissTransaction: () => {},
  getPendingForAccount: () => [],
});

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);

  const connectAccount = (account: Omit<BankAccount, 'id' | 'connectedAt'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: Date.now().toString(),
      connectedAt: new Date().toISOString().split('T')[0],
    };
    setAccounts((prev) => [...prev, newAccount]);

    // Seed mock pending transactions for demo purposes.
    // In production this will be replaced by a Plaid webhook/sync call.
    const mockPending: PendingTransaction[] = [
      { id: `${newAccount.id}-1`, accountId: newAccount.id, description: 'AMAZON.COM',        amount: 34.99, date: '2026-04-18', category: 'other', categorized: false },
      { id: `${newAccount.id}-2`, accountId: newAccount.id, description: 'SPOTIFY USA',       amount: 9.99,  date: '2026-04-17', category: 'other', categorized: false },
      { id: `${newAccount.id}-3`, accountId: newAccount.id, description: 'WHOLE FOODS MKT',   amount: 62.14, date: '2026-04-16', category: 'other', categorized: false },
      { id: `${newAccount.id}-4`, accountId: newAccount.id, description: 'SHELL OIL',         amount: 55.00, date: '2026-04-15', category: 'other', categorized: false },
      { id: `${newAccount.id}-5`, accountId: newAccount.id, description: 'NETFLIX.COM',       amount: 15.99, date: '2026-04-14', category: 'other', categorized: false },
      { id: `${newAccount.id}-6`, accountId: newAccount.id, description: 'CHIPOTLE #1842',    amount: 14.75, date: '2026-04-13', category: 'other', categorized: false },
    ];
    setPendingTransactions((prev) => [...prev, ...mockPending]);
  };

  const disconnectAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setPendingTransactions((prev) => prev.filter((t) => t.accountId !== id));
  };

  const categorizeTransaction = (id: string, category: string) => {
    setPendingTransactions((prev) =>
      prev.map((t) => t.id === id ? { ...t, category, categorized: true } : t)
    );
  };

  const dismissTransaction = (id: string) => {
    setPendingTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getPendingForAccount = (accountId: string) =>
    pendingTransactions.filter((t) => t.accountId === accountId && !t.categorized);

  return (
    <BankContext.Provider value={{
      accounts, pendingTransactions,
      connectAccount, disconnectAccount,
      categorizeTransaction, dismissTransaction, getPendingForAccount,
    }}>
      {children}
    </BankContext.Provider>
  );
}

export const useBank = () => useContext(BankContext);
