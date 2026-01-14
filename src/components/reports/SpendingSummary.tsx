import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reports/reportService';
import { LoadingSpinner } from '../layout/LoadingSpinner';

export const SpendingSummary: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [user?.email]);

  const loadSummary = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const data = await reportService.getSpendingByGroup(user.email);
      setSummary(data);
    } catch (error) {
      console.error('Error loading spending summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Spending by Group</h2>
      {summary.length === 0 ? (
        <p className="text-gray-600">No spending data available</p>
      ) : (
        <div className="space-y-3">
          {summary.map((item) => (
            <div key={item.group.group_id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.group.name}</p>
                <p className="text-sm text-gray-600">{item.expenseCount} expenses</p>
              </div>
              <p className="text-lg font-semibold">
                {item.group.currency} {item.total.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
