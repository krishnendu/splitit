import React from 'react';
import { useBalances } from '../../contexts/BalanceContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../layout/LoadingSpinner';

export const OverallBalance: React.FC = () => {
  const { user } = useAuth();
  const { balances, isLoading, getBalancesByUser } = useBalances();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user?.email) {
    return <div>Please sign in to view balances</div>;
  }

  const userBalances = getBalancesByUser(user.email);
  
  let totalOwed = 0;
  let totalOwing = 0;

  userBalances.forEach(balance => {
    if (balance.user_from === user.email) {
      totalOwing += balance.amount;
    } else if (balance.user_to === user.email) {
      totalOwed += balance.amount;
    }
  });

  const netBalance = totalOwed - totalOwing;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Your Overall Balance</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">You are owed:</span>
          <span className="text-green-600 font-semibold">
            ${totalOwed.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">You owe:</span>
          <span className="text-red-600 font-semibold">
            ${totalOwing.toFixed(2)}
          </span>
        </div>
        <div className="border-t pt-4 flex justify-between">
          <span className="font-semibold">Net Balance:</span>
          <span className={`font-bold text-lg ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(netBalance).toFixed(2)} {netBalance >= 0 ? 'owed to you' : 'you owe'}
          </span>
        </div>
      </div>
    </div>
  );
};
