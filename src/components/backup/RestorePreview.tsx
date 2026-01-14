import React, { useEffect, useState } from 'react';
import { restoreService, RestoreMode } from '../../services/backup/restoreService';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import type { BackupFile } from '../../types';

interface RestorePreviewProps {
  backup: BackupFile;
  mode: RestoreMode;
}

export const RestorePreview: React.FC<RestorePreviewProps> = ({ backup, mode }) => {
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreview();
  }, [backup, mode]);

  const loadPreview = async () => {
    setIsLoading(true);
    try {
      const data = await restoreService.previewRestore(backup, mode);
      setPreview(data);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!preview) {
    return <div>Unable to load preview</div>;
  }

  return (
    <div className="bg-blue-50 p-4 rounded">
      <h4 className="font-semibold mb-3">Restore Preview</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Users:</span>
          <span className="font-medium">{preview.users}</span>
        </div>
        <div className="flex justify-between">
          <span>Groups:</span>
          <span className="font-medium">{preview.groups}</span>
        </div>
        <div className="flex justify-between">
          <span>Expenses:</span>
          <span className="font-medium">{preview.expenses}</span>
        </div>
        <div className="flex justify-between">
          <span>Balances:</span>
          <span className="font-medium">{preview.balances}</span>
        </div>
        <div className="flex justify-between">
          <span>Settlements:</span>
          <span className="font-medium">{preview.settlements}</span>
        </div>
        {mode === 'merge' && preview.conflicts > 0 && (
          <div className="flex justify-between text-yellow-700">
            <span>Potential Conflicts:</span>
            <span className="font-medium">{preview.conflicts}</span>
          </div>
        )}
      </div>
    </div>
  );
};
