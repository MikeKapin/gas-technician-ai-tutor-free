'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionMode = 'free' | 'pro' | 'student';

interface SubscriptionContextType {
  mode: SubscriptionMode;
  setMode: (mode: SubscriptionMode) => void;
  hasAIAccess: boolean;
  messagesUsed: number;
  messageLimit: number;
  daysRemaining: number;
  isExpiringSoon: boolean;
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  activateStudentCode: (code: string) => boolean;
  isStudentMode: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [mode, setMode] = useState<SubscriptionMode>('free');
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Free tier limits
  const messageLimit = 10; // Free users get 10 AI messages per session
  const proAccessDays = 30; // Pro access lasts 30 days
  const studentAccessDays = 365; // Student access lasts 12 months (365 days)

  // Helper function to calculate days remaining
  const calculateDaysRemaining = (purchaseDate: string): number => {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffTime = purchase.getTime() + (proAccessDays * 24 * 60 * 60 * 1000) - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Validate LARK student access codes (LARK0001 - LARK0080)
  const validateLARKCode = (code: string): boolean => {
    const upperCode = code.toUpperCase().trim();
    const larkPattern = /^LARK\d{4}$/;

    if (!larkPattern.test(upperCode)) {
      return false;
    }

    const codeNumber = parseInt(upperCode.substring(4));
    return codeNumber >= 1 && codeNumber <= 80;
  };

  // Activate student code
  const activateStudentCode = (code: string): boolean => {
    if (!validateLARKCode(code)) {
      return false;
    }

    const now = new Date().toISOString();
    const upperCode = code.toUpperCase().trim();

    // Store student activation data
    localStorage.setItem('student-activation-date', now);
    localStorage.setItem('student-activation-code', upperCode);

    setMode('student');
    setDaysRemaining(studentAccessDays);

    return true;
  };

  // Check URL parameters and access status on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const successParam = params.get('success');
    const newSubscriber = params.get('new');
    const activate = params.get('activate');

    // Show activation modal if activate=true
    if (activate === 'true') {
      // This will be handled by the ChatInterface component
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Handle new Pro purchase
    if (modeParam === 'pro' && (successParam === 'true' || newSubscriber === 'true')) {
      const now = new Date().toISOString();
      localStorage.setItem('pro-purchase-date', now);
      setMode('pro');
      setDaysRemaining(proAccessDays);

      // Store flag to show PWA prompt after mode is set
      sessionStorage.setItem('show-pwa-success', 'true');

      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check existing Student access first
      const studentActivationDate = localStorage.getItem('student-activation-date');
      if (studentActivationDate) {
        const remaining = calculateDaysRemaining(studentActivationDate);
        setDaysRemaining(remaining);

        if (remaining > 0) {
          setMode('student');
          return;
        } else {
          // Student access expired - clean up
          localStorage.removeItem('student-activation-date');
          localStorage.removeItem('student-activation-code');
        }
      }

      // Check existing Pro access
      const purchaseDate = localStorage.getItem('pro-purchase-date');
      if (purchaseDate) {
        const remaining = calculateDaysRemaining(purchaseDate);
        setDaysRemaining(remaining);

        if (remaining > 0) {
          setMode('pro');
        } else {
          // Pro access expired - clean up
          localStorage.removeItem('pro-purchase-date');
          setMode('free');
        }
      } else {
        setMode('free');
      }
    }
  }, []);

  const hasAIAccess = mode === 'pro' || mode === 'student' || messagesUsed < messageLimit;
  const isExpiringSoon = (mode === 'pro' || mode === 'student') && daysRemaining > 0 && daysRemaining <= 5;
  const isStudentMode = mode === 'student';

  const incrementMessageCount = () => {
    if (mode === 'free') {
      setMessagesUsed(prev => prev + 1);
    }
  };

  const resetMessageCount = () => {
    setMessagesUsed(0);
  };

  const value = {
    mode,
    setMode,
    hasAIAccess,
    messagesUsed,
    messageLimit,
    daysRemaining,
    isExpiringSoon,
    incrementMessageCount,
    resetMessageCount,
    activateStudentCode,
    isStudentMode
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}