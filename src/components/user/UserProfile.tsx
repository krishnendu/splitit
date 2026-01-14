import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/sheets/usersService';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import type { User } from '../../types';

export const UserProfile: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    loadUser();
  }, [authUser]);

  const loadUser = async () => {
    if (!authUser?.email) return;

    setIsLoading(true);
    try {
      const userData = await usersService.readByEmail(authUser.email);
      if (userData) {
        setUser(userData);
        setCurrency(userData.currency);
        setTimezone(userData.timezone);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !authUser) return;

    try {
      const updated = await usersService.update(user.user_id, {
        currency,
        timezone,
      });
      if (updated) {
        setUser(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !authUser) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto card">
      <div className="flex items-center space-x-4 mb-6">
        {user.profile_pic && (
          <img
            src={user.profile_pic}
            alt={user.name}
            className="w-20 h-20 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Currency</label>
            <p className="text-lg">{user.currency}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Timezone</label>
            <p className="text-lg">{user.timezone}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSave} className="btn btn-primary">
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrency(user.currency);
                setTimezone(user.timezone);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
