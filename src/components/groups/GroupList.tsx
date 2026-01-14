import React, { useState } from 'react';
import { useGroups } from '../../contexts/GroupContext';
import { GroupCard } from './GroupCard';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { Button } from '../common/Button';
import { CreateGroupModal } from './CreateGroupModal';

export const GroupList: React.FC = () => {
  const { groups, isLoading, error } = useGroups();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No groups yet. Create your first group to get started!</p>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Create Group</Button>
        </div>
        {isCreateModalOpen && (
          <CreateGroupModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Groups</h1>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Create Group</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.group_id} group={group} />
          ))}
        </div>
      </div>
      {isCreateModalOpen && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </>
  );
};
