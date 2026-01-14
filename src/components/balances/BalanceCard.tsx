import React from 'react';
import type { Balance } from '../../types';

interface BalanceCardProps {
  balance: Balance;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            <strong>{balance.user_from}</strong> owes <strong>{balance.user_to}</strong>
          </p>
          <p className="text-2xl font-bold text-red-600">
            {balance.currency} {balance.amount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
