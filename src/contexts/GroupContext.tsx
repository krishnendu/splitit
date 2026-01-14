import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { groupsService } from '../services/sheets/groupsService';
import { POLLING_INTERVALS } from '../constants/config';
import type { Group } from '../types';

interface GroupContextType {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
  createGroup: (group: Omit<Group, 'group_id' | 'created_at'>) => Promise<Group | null>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<Group | null>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  addMember: (groupId: string, userEmail: string) => Promise<Group | null>;
  removeMember: (groupId: string, userEmail: string) => Promise<Group | null>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGroups = async () => {
    try {
      setError(null);
      const allGroups = await groupsService.readAll();
      setGroups(allGroups);
    } catch (err: any) {
      setError(err.message || 'Failed to load groups');
      console.error('Error loading groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshGroups();

    // Poll for updates
    const interval = setInterval(() => {
      refreshGroups();
    }, POLLING_INTERVALS.ACTIVE_TAB);

    return () => clearInterval(interval);
  }, []);

  const createGroup = async (group: Omit<Group, 'group_id' | 'created_at'>): Promise<Group | null> => {
    try {
      const newGroup = await groupsService.create(group);
      await refreshGroups();
      return newGroup;
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
      return null;
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<Group | null> => {
    try {
      const updated = await groupsService.update(groupId, updates);
      await refreshGroups();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update group');
      return null;
    }
  };

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    try {
      const result = await groupsService.delete(groupId);
      await refreshGroups();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete group');
      return false;
    }
  };

  const addMember = async (groupId: string, userEmail: string): Promise<Group | null> => {
    try {
      const updated = await groupsService.addMember(groupId, userEmail);
      await refreshGroups();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
      return null;
    }
  };

  const removeMember = async (groupId: string, userEmail: string): Promise<Group | null> => {
    try {
      const updated = await groupsService.removeMember(groupId, userEmail);
      await refreshGroups();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
      return null;
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        isLoading,
        error,
        refreshGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        addMember,
        removeMember,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
