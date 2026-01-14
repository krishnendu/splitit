import React, { useState } from 'react';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/config';

interface BackupSetupProps {
  onComplete: () => void;
}

export const BackupSetup: React.FC<BackupSetupProps> = ({ onComplete }) => {
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    storage.set(STORAGE_KEYS.USER_PREFERENCES, {
      backupFrequency,
      autoBackupEnabled,
    });

    onComplete();
  };

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-bold mb-4">Backup Preferences</h2>
      <p className="text-gray-600 mb-6">
        Configure how often you want to backup your data.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={(e) => setAutoBackupEnabled(e.target.checked)}
              className="rounded"
            />
            <span>Enable automatic backups</span>
          </label>
        </div>

        {autoBackupEnabled && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Backup Frequency
            </label>
            <select
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value as any)}
              className="input"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full">
          Continue
        </button>
      </form>
    </div>
  );
};
