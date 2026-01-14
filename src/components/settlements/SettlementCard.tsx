import React from 'react';
import { formatDate } from '../../utils/date';
import type { Settlement } from '../../types';

interface SettlementCardProps {
  settlement: Settlement;
}

export const SettlementCard: React.FC<SettlementCardProps> = ({ settlement }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-semibold mb-1">
            {settlement.from_user} paid {settlement.to_user}
          </p>
          <p className="text-2xl font-bold text-green-600 mb-2">
            {settlement.currency} {settlement.amount.toFixed(2)}
          </p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Date: {formatDate(settlement.date)}</p>
            {settlement.method && (
              <p>Method: {settlement.method.replace('_', ' ')}</p>
            )}
            {settlement.notes && (
              <p>Notes: {settlement.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
