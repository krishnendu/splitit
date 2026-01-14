import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import type { Group } from '../../types';

interface GroupCardProps {
  group: Group;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  return (
    <Link to={`/groups/${group.group_id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
            <p className="text-gray-600 text-sm">
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Created {formatDate(group.created_at)}
            </p>
          </div>
          {group.image_url && (
            <img
              src={group.image_url}
              alt={group.name}
              className="w-16 h-16 rounded-lg object-cover ml-4"
            />
          )}
        </div>
      </div>
    </Link>
  );
};
