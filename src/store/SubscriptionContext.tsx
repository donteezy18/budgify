import React, { createContext, useContext, useState } from 'react';
import { SubscriptionTier } from '../types';

interface SubscriptionContextValue {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasAccess: (required: SubscriptionTier) => boolean;
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro_lite: 1,
  pro_ultra: 2,
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  tier: 'free',
  setTier: () => {},
  hasAccess: () => false,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>('free');

  const hasAccess = (required: SubscriptionTier) =>
    TIER_RANK[tier] >= TIER_RANK[required];

  return (
    <SubscriptionContext.Provider value={{ tier, setTier, hasAccess }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
