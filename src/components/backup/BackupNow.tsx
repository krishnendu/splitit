import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { backupService } from '../../services/backup/backupService';
import { sheetsClient } from '../../services/sheets/sheetsClient';
import { Button } from '../common/Button';

export const BackupNow: React.FC = () => {
  const { user } = useAuth();
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    if (!user?.email) return;

    setIsBackingUp(true);
    try {
      const sheetId = sheetsClient.getSheetId();
      if (!sheetId) {
        alert('Sheet ID not found');
        return;
      }

      const backup = await backupService.createBackup(user.email, sheetId);
      await backupService.downloadBackup(backup);
      alert('Backup created and downloaded successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <Button onClick={handleBackup} variant="primary" disabled={isBackingUp}>
      {isBackingUp ? 'Creating Backup...' : 'Backup Now'}
    </Button>
  );
};
