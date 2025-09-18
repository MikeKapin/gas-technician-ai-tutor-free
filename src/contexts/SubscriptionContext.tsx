'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SubscriptionMode = 'free';

interface SubscriptionContextType {
  mode: SubscriptionMode;
  hasAIAccess: boolean;
  messagesUsed: number;
  messageLimit: number;
  incrementMessageCount: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [mode] = useState<SubscriptionMode>('free');
  const [messagesUsed] = useState<number>(0);
  const messageLimit = 0; // No AI access in free version

  // Free version never has AI access
  const hasAIAccess = false;

  const incrementMessageCount = () => {
    // No-op in free version
  };

  const value: SubscriptionContextType = {
    mode,
    hasAIAccess,
    messagesUsed,
    messageLimit,
    incrementMessageCount,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};