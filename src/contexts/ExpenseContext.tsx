import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { expensesService } from '../services/sheets/expensesService';
import { POLLING_INTERVALS } from '../constants/config';
import type { Expense } from '../types';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  refreshExpenses: (groupId?: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'expense_id' | 'created_at' | 'updated_at'>) => Promise<Expense | null>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<Expense | null>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  getExpensesByGroup: (groupId: string) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshExpenses = async (groupId?: string) => {
    try {
      setError(null);
      const allExpenses = groupId
        ? await expensesService.readByGroupId(groupId)
        : await expensesService.readAll();
      setExpenses(allExpenses);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshExpenses();

    const interval = setInterval(() => {
      refreshExpenses();
    }, POLLING_INTERVALS.ACTIVE_TAB);

    return () => clearInterval(interval);
  }, []);

  const createExpense = async (expense: Omit<Expense, 'expense_id' | 'created_at' | 'updated_at'>): Promise<Expense | null> => {
    try {
      const newExpense = await expensesService.create(expense);
      await refreshExpenses();
      return newExpense;
    } catch (err: any) {
      setError(err.message || 'Failed to create expense');
      return null;
    }
  };

  const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<Expense | null> => {
    try {
      const updated = await expensesService.update(expenseId, updates);
      await refreshExpenses();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
      return null;
    }
  };

  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    try {
      const result = await expensesService.delete(expenseId);
      await refreshExpenses();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
      return false;
    }
  };

  const getExpensesByGroup = (groupId: string): Expense[] => {
    return expenses.filter(e => e.group_id === groupId);
  };

  const getExpensesByCategory = (category: string): Expense[] => {
    return expenses.filter(e => e.category === category);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        error,
        refreshExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        getExpensesByGroup,
        getExpensesByCategory,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
