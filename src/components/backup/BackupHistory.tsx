import React from 'react';
import { backupService } from '../../services/backup/backupService';
import { formatDate } from '../../utils/date';
import { Button } from '../common/Button';

export const BackupHistory: React.FC = () => {
  const history = backupService.getBackupHistory();

  const handleDownload = async (backup: any) => {
    await backupService.downloadBackup(backup);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No backups yet. Create your first backup!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Backup History</h3>
      {history.map((backup) => (
        <div key={backup.backup_metadata.backup_id} className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {formatDate(backup.backup_metadata.timestamp)}
              </p>
              <p className="text-sm text-gray-600">
                {backup.data.groups.length} groups, {backup.data.expenses.length} expenses
              </p>
            </div>
            <Button
              onClick={() => handleDownload(backup)}
              variant="secondary"
              className="text-sm"
            >
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
