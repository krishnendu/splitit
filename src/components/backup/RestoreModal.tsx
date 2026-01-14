import React, { useState } from 'react';
import { restoreService, RestoreMode } from '../../services/backup/restoreService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RestorePreview } from './RestorePreview';
import type { BackupFile } from '../../types';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({ isOpen, onClose }) => {
  const [backup, setBackup] = useState<BackupFile | null>(null);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>('merge');
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validation = await restoreService.validateBackupFile(file);
    
    if (validation.valid && validation.backup) {
      setBackup(validation.backup);
    } else {
      setError(validation.errors.join(', '));
    }
  };

  const handleRestore = async () => {
    if (!backup) return;

    setIsRestoring(true);
    try {
      await restoreService.restoreData(backup, restoreMode);
      alert('Restore completed successfully!');
      onClose();
      window.location.reload();
    } catch (error: any) {
      setError(error.message || 'Failed to restore backup');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restore from Backup" size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Backup File</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="input"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {backup && (
          <>
            <RestorePreview backup={backup} mode={restoreMode} />
            
            <div>
              <label className="block text-sm font-medium mb-2">Restore Mode</label>
              <select
                value={restoreMode}
                onChange={(e) => setRestoreMode(e.target.value as RestoreMode)}
                className="input"
              >
                <option value="merge">Merge with existing data</option>
                <option value="replace">Replace all data</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleRestore}
                variant="primary"
                disabled={isRestoring}
                className="flex-1"
              >
                {isRestoring ? 'Restoring...' : 'Restore'}
              </Button>
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
