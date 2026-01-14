import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reports/reportService';
import { LoadingSpinner } from '../layout/LoadingSpinner';

export const PersonalSpending: React.FC = () => {
  const { user } = useAuth();
  const [spending, setSpending] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpending();
  }, [user?.email]);

  const loadSpending = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const data = await reportService.getPersonalSpending(user.email);
      setSpending(data);
    } catch (error) {
      console.error('Error loading personal spending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!spending) {
    return <div className="card">No spending data available</div>;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Your Spending</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Spent:</span>
          <span className="text-lg font-semibold">${spending.totalSpent.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Owed:</span>
          <span className="text-lg font-semibold">${spending.totalOwed.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expenses:</span>
          <span className="text-lg font-semibold">{spending.expenseCount}</span>
        </div>
      </div>
    </div>
  );
};
