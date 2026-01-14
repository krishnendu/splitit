import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroups } from '../../contexts/GroupContext';
import { groupsService } from '../../services/sheets/groupsService';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { Button } from '../common/Button';
import { CreateGroupModal } from './CreateGroupModal';
import type { Group } from '../../types';

export const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { groups } = useGroups();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadGroup();
  }, [id, groups]);

  const loadGroup = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const groupData = await groupsService.readById(id);
      setGroup(groupData);
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!group) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Group not found</p>
        <Link to="/groups">
          <Button variant="primary">Back to Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-gray-600 mt-1">
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <Button onClick={() => setIsEditModalOpen(true)} variant="secondary">
            Edit Group
          </Button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Members</h2>
          <div className="space-y-2">
            {group.members.map((email) => (
              <div key={email} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span>{email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link to={`/groups/${id}/expenses`} className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Expenses</h3>
          <p className="text-gray-600">View and manage expenses</p>
        </Link>
        <Link to={`/groups/${id}/balances`} className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Balances</h3>
          <p className="text-gray-600">See who owes whom</p>
        </Link>
      </div>

      {isEditModalOpen && (
        <CreateGroupModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            loadGroup();
          }}
          groupToEdit={group}
        />
      )}
    </div>
  );
};
