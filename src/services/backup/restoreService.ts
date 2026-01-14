import { usersService } from '../sheets/usersService';
import { groupsService } from '../sheets/groupsService';
import { expensesService } from '../sheets/expensesService';
import { balancesService } from '../sheets/balancesService';
import { settlementsService } from '../sheets/settlementsService';
import { backupService } from './backupService';
import type { BackupFile } from '../../types';

export type RestoreMode = 'replace' | 'merge';

interface RestorePreview {
  users: number;
  groups: number;
  expenses: number;
  balances: number;
  settlements: number;
  conflicts: number;
}

class RestoreService {
  async validateBackupFile(file: File): Promise<{ valid: boolean; backup?: BackupFile; errors: string[] }> {
    try {
      const text = await file.text();
      const backup: BackupFile = JSON.parse(text);
      
      const validation = await backupService.validateBackup(backup);
      
      return {
        valid: validation.valid,
        backup: validation.valid ? backup : undefined,
        errors: validation.errors,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message || 'Invalid backup file format'],
      };
    }
  }

  async previewRestore(backup: BackupFile, mode: RestoreMode): Promise<RestorePreview> {
    const existingUsers = await usersService.readAll();
    const existingGroups = await groupsService.readAll();
    const existingExpenses = await expensesService.readAll();

    let conflicts = 0;

    if (mode === 'merge') {
      // Count conflicts
      const backupUserIds = new Set(backup.data.users.map(u => u.user_id));
      const backupGroupIds = new Set(backup.data.groups.map(g => g.group_id));
      const backupExpenseIds = new Set(backup.data.expenses.map(e => e.expense_id));

      existingUsers.forEach(u => {
        if (backupUserIds.has(u.user_id)) conflicts++;
      });
      existingGroups.forEach(g => {
        if (backupGroupIds.has(g.group_id)) conflicts++;
      });
      existingExpenses.forEach(e => {
        if (backupExpenseIds.has(e.expense_id)) conflicts++;
      });
    }

    return {
      users: backup.data.users.length,
      groups: backup.data.groups.length,
      expenses: backup.data.expenses.length,
      balances: backup.data.balances.length,
      settlements: backup.data.settlements.length,
      conflicts,
    };
  }

  async restoreData(backup: BackupFile, mode: RestoreMode): Promise<void> {
    if (mode === 'replace') {
      // Clear existing data (by archiving/deleting)
      // Note: In a real implementation, you might want to backup current data first
      await this.replaceData(backup);
    } else {
      await this.mergeData(backup);
    }
  }

  private async replaceData(backup: BackupFile): Promise<void> {
    // Restore users
    for (const user of backup.data.users) {
      const existing = await usersService.readByEmail(user.email);
      if (existing) {
        await usersService.update(existing.user_id, user);
      } else {
        await usersService.create(user);
      }
    }

    // Restore groups
    for (const group of backup.data.groups) {
      const existing = await groupsService.readById(group.group_id);
      if (existing) {
        await groupsService.update(group.group_id, group);
      } else {
        await groupsService.create(group);
      }
    }

    // Restore expenses
    for (const expense of backup.data.expenses) {
      const existing = await expensesService.readById(expense.expense_id);
      if (existing) {
        await expensesService.update(expense.expense_id, expense);
      } else {
        await expensesService.create(expense);
      }
    }

    // Restore balances
    for (const balance of backup.data.balances) {
      await balancesService.create(balance);
    }

    // Restore settlements
    for (const settlement of backup.data.settlements) {
      await settlementsService.create(settlement);
    }
  }

  private async mergeData(backup: BackupFile): Promise<void> {
    // Merge users (keep newer)
    for (const user of backup.data.users) {
      const existing = await usersService.readByEmail(user.email);
      if (existing) {
        // Keep newer version
        if (new Date(user.created_at) > new Date(existing.created_at)) {
          await usersService.update(existing.user_id, user);
        }
      } else {
        await usersService.create(user);
      }
    }

    // Merge groups (keep newer)
    for (const group of backup.data.groups) {
      const existing = await groupsService.readById(group.group_id);
      if (existing) {
        if (new Date(group.created_at) > new Date(existing.created_at)) {
          await groupsService.update(group.group_id, group);
        }
      } else {
        await groupsService.create(group);
      }
    }

    // Merge expenses (keep newer)
    for (const expense of backup.data.expenses) {
      const existing = await expensesService.readById(expense.expense_id);
      if (existing) {
        if (new Date(expense.updated_at) > new Date(existing.updated_at)) {
          await expensesService.update(expense.expense_id, expense);
        }
      } else {
        await expensesService.create(expense);
      }
    }

    // Add new balances and settlements (don't merge, just add)
    for (const balance of backup.data.balances) {
      const existing = await balancesService.readByGroupId(balance.group_id);
      const found = existing.find(
        b => b.user_from === balance.user_from && b.user_to === balance.user_to
      );
      if (!found) {
        await balancesService.create(balance);
      }
    }

    for (const settlement of backup.data.settlements) {
      const existing = await settlementsService.readById(settlement.settlement_id);
      if (!existing) {
        await settlementsService.create(settlement);
      }
    }
  }
}

export const restoreService = new RestoreService();
