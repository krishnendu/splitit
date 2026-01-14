import React, { useState } from 'react';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/config';
import { BackupNow } from './BackupNow';
import { BackupHistory } from './BackupHistory';
import { RestoreModal } from './RestoreModal';
import { Button } from '../common/Button';

export const BackupSettings: React.FC = () => {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    storage.get(STORAGE_KEYS.USER_PREFERENCES)?.autoBackupEnabled ?? false
  );
  const [backupFrequency, setBackupFrequency] = useState(
    storage.get(STORAGE_KEYS.USER_PREFERENCES)?.backupFrequency ?? 'weekly'
  );

  const handleSavePreferences = () => {
    const preferences = storage.get(STORAGE_KEYS.USER_PREFERENCES) || {};
    storage.set(STORAGE_KEYS.USER_PREFERENCES, {
      ...preferences,
      autoBackupEnabled,
      backupFrequency,
    });
    alert('Preferences saved!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Backup & Restore</h1>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Manual Backup</h2>
        <BackupNow />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Auto-Backup Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={(e) => setAutoBackupEnabled(e.target.checked)}
              className="rounded"
            />
            <span>Enable automatic backups</span>
          </label>

          {autoBackupEnabled && (
            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <Button onClick={handleSavePreferences} variant="primary">
            Save Preferences
          </Button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Restore from Backup</h2>
        <Button onClick={() => setIsRestoreModalOpen(true)} variant="secondary">
          Restore from File
        </Button>
      </div>

      <div className="card">
        <BackupHistory />
      </div>

      {isRestoreModalOpen && (
        <RestoreModal
          isOpen={isRestoreModalOpen}
          onClose={() => setIsRestoreModalOpen(false)}
        />
      )}
    </div>
  );
};
