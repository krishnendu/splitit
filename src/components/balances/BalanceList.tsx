import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBalances } from '../../contexts/BalanceContext';
import { useExpenses } from '../../contexts/ExpenseContext';
import { BalanceCard } from './BalanceCard';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { Button } from '../common/Button';
import { SettlementModal } from '../settlements/SettlementModal';
import type { Balance } from '../../types';

export const BalanceList: React.FC = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const { isLoading, calculateBalances, getBalancesByGroup } = useBalances();
  const { expenses } = useExpenses();
  const [settlingBalance, setSettlingBalance] = useState<Balance | null>(null);

  useEffect(() => {
    if (groupId) {
      calculateBalances(groupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, expenses.length]);

  const groupBalances = groupId ? getBalancesByGroup(groupId) : [];

  const handleRecalculate = async () => {
    if (groupId) {
      await calculateBalances(groupId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!groupId) {
    return <div>Group ID not found</div>;
  }

  if (groupBalances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No balances to show. All expenses are settled!</p>
        <Button onClick={handleRecalculate} variant="secondary">
          Recalculate
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Balances</h1>
          <Button onClick={handleRecalculate} variant="secondary">
            Recalculate
          </Button>
        </div>

        <div className="space-y-4">
          {groupBalances.map((balance) => (
            <div key={balance.balance_id} className="flex items-center space-x-4">
              <div className="flex-1">
                <BalanceCard balance={balance} />
              </div>
              <Button
                onClick={() => setSettlingBalance(balance)}
                variant="primary"
                className="whitespace-nowrap"
              >
                Settle Up
              </Button>
            </div>
          ))}
        </div>
      </div>

      {settlingBalance && (
        <SettlementModal
          isOpen={!!settlingBalance}
          onClose={() => {
            setSettlingBalance(null);
            handleRecalculate();
          }}
          balance={settlingBalance}
        />
      )}
    </>
  );
};
