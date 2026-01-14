import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { balancesService } from '../services/sheets/balancesService';
import { balanceCalculator } from '../services/balance/balanceCalculator';
import { POLLING_INTERVALS } from '../constants/config';
import type { Balance } from '../types';

interface BalanceContextType {
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
  refreshBalances: (groupId?: string) => Promise<void>;
  calculateBalances: (groupId: string) => Promise<Balance[]>;
  getBalancesByGroup: (groupId: string) => Balance[];
  getBalancesByUser: (userEmail: string) => Balance[];
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const useBalances = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalances must be used within a BalanceProvider');
  }
  return context;
};

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBalances = async (groupId?: string) => {
    try {
      setError(null);
      const allBalances = groupId
        ? await balancesService.readByGroupId(groupId)
        : await balancesService.readAll();
      setBalances(allBalances);
    } catch (err: any) {
      setError(err.message || 'Failed to load balances');
      console.error('Error loading balances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBalancesForGroup = async (groupId: string): Promise<Balance[]> => {
    try {
      setError(null);
      const calculated = await balanceCalculator.calculateBalances(groupId);
      await refreshBalances(groupId);
      return calculated;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate balances');
      throw err;
    }
  };

  useEffect(() => {
    refreshBalances();

    const interval = setInterval(() => {
      refreshBalances();
    }, POLLING_INTERVALS.ACTIVE_TAB);

    return () => clearInterval(interval);
  }, []);

  const getBalancesByGroup = (groupId: string): Balance[] => {
    return balances.filter(b => b.group_id === groupId);
  };

  const getBalancesByUser = (userEmail: string): Balance[] => {
    return balances.filter(
      b => b.user_from === userEmail || b.user_to === userEmail
    );
  };

  return (
    <BalanceContext.Provider
      value={{
        balances,
        isLoading,
        error,
        refreshBalances,
        calculateBalances: calculateBalancesForGroup,
        getBalancesByGroup,
        getBalancesByUser,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
