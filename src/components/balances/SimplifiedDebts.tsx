import React from 'react';
import { useBalances } from '../../contexts/BalanceContext';
import type { Balance } from '../../types';

interface SimplifiedDebtsProps {
  groupId: string;
}

export const SimplifiedDebts: React.FC<SimplifiedDebtsProps> = ({ groupId }) => {
  const { getBalancesByGroup } = useBalances();
  const balances = getBalancesByGroup(groupId);

  if (balances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        All debts are settled!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Simplified Debts</h3>
      {balances.map((balance) => (
        <DebtItem key={balance.balance_id} balance={balance} />
      ))}
    </div>
  );
};

const DebtItem: React.FC<{ balance: Balance }> = ({ balance }) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
      <div>
        <p className="font-medium">{balance.user_from}</p>
        <p className="text-sm text-gray-600">owes</p>
        <p className="font-medium">{balance.user_to}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-red-600">
          {balance.currency} {balance.amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};
