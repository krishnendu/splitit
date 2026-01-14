import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { settlementsService } from '../../services/sheets/settlementsService';
import { SettlementCard } from './SettlementCard';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import type { Settlement } from '../../types';

export const SettlementList: React.FC = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettlements();
  }, [groupId]);

  const loadSettlements = async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const data = await settlementsService.readByGroupId(groupId);
      setSettlements(data);
    } catch (error) {
      console.error('Error loading settlements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!groupId) {
    return <div>Group ID not found</div>;
  }

  if (settlements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No settlements recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settlement History</h1>
      <div className="space-y-4">
        {settlements.map((settlement) => (
          <SettlementCard key={settlement.settlement_id} settlement={settlement} />
        ))}
      </div>
    </div>
  );
};
