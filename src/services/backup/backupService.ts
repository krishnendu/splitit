import { usersService } from '../sheets/usersService';
import { groupsService } from '../sheets/groupsService';
import { expensesService } from '../sheets/expensesService';
import { balancesService } from '../sheets/balancesService';
import { settlementsService } from '../sheets/settlementsService';
import { commentsService } from '../sheets/commentsService';
import { notificationsService } from '../sheets/notificationsService';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS, APP_VERSION, BACKUP_VERSION, BACKUP_CONFIG } from '../../constants/config';
import { v4 as uuidv4 } from 'uuid';
import type { BackupFile } from '../../types';

class BackupService {
  async createBackup(userEmail: string, sheetId: string): Promise<BackupFile> {
    // Fetch all data
    const [users, groups, expenses, balances, settlements, comments, notifications] = await Promise.all([
      usersService.readAll(),
      groupsService.readAll(),
      expensesService.readAll(),
      balancesService.readAll(),
      settlementsService.readAll(),
      commentsService.readAll(),
      notificationsService.readAll(),
    ]);

    // Get user preferences
    const userPreferences = storage.get(STORAGE_KEYS.USER_PREFERENCES) || {};
    const appConfig = storage.get(STORAGE_KEYS.APP_CONFIG) || {};

    // Create backup metadata
    const backupMetadata = {
      backup_id: uuidv4(),
      timestamp: new Date().toISOString(),
      user_email: userEmail,
      app_version: APP_VERSION,
      sheet_id: sheetId,
      backup_type: 'full' as const,
    };

    // Create backup file
    const backupFile: BackupFile = {
      version: BACKUP_VERSION,
      backup_metadata: backupMetadata,
      data: {
        users,
        groups,
        expenses,
        balances,
        settlements,
        comments,
        notifications,
      },
      settings: {
        user_preferences: userPreferences,
        app_config: appConfig,
      },
      checksum: '', // Will be calculated
    };

    // Calculate checksum
    backupFile.checksum = await this.calculateChecksum(backupFile);

    // Store in localStorage (last 5 backups)
    this.storeBackupMetadata(backupFile);

    return backupFile;
  }

  async calculateChecksum(backup: BackupFile): Promise<string> {
    // Simple checksum using JSON string
    const jsonString = JSON.stringify(backup);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async validateBackup(backup: BackupFile): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check structure
    if (!backup.version) errors.push('Missing version');
    if (!backup.backup_metadata) errors.push('Missing backup metadata');
    if (!backup.data) errors.push('Missing data');
    if (!backup.checksum) errors.push('Missing checksum');

    // Validate checksum
    if (backup.checksum) {
      const tempChecksum = backup.checksum;
      backup.checksum = '';
      const calculated = await this.calculateChecksum(backup);
      if (calculated !== tempChecksum) {
        errors.push('Checksum validation failed');
      }
      backup.checksum = tempChecksum;
    }

    // Check required data fields
    if (backup.data) {
      if (!Array.isArray(backup.data.users)) errors.push('Invalid users data');
      if (!Array.isArray(backup.data.groups)) errors.push('Invalid groups data');
      if (!Array.isArray(backup.data.expenses)) errors.push('Invalid expenses data');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async downloadBackup(backup: BackupFile): Promise<void> {
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitit-backup-${backup.backup_metadata.timestamp.split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private storeBackupMetadata(backup: BackupFile): void {
    const history = storage.get<BackupFile[]>(STORAGE_KEYS.BACKUP_HISTORY) || [];
    history.unshift(backup);
    
    // Keep only last N backups
    const trimmed = history.slice(0, BACKUP_CONFIG.MAX_LOCAL_BACKUPS);
    storage.set(STORAGE_KEYS.BACKUP_HISTORY, trimmed);
  }

  getBackupHistory(): BackupFile[] {
    return storage.get<BackupFile[]>(STORAGE_KEYS.BACKUP_HISTORY) || [];
  }
}

export const backupService = new BackupService();
