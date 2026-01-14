import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, USERS_HEADERS } from '../../constants/sheetSchemas';
import type { User } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class UsersService {
  private sheetName = SHEET_NAMES.USERS;

  private rowToUser(row: string[]): User | null {
    if (row.length < USERS_HEADERS.length) {
      return null;
    }

    return {
      user_id: row[0] || '',
      email: row[1] || '',
      name: row[2] || '',
      profile_pic: row[3] || undefined,
      currency: row[4] || 'USD',
      timezone: row[5] || 'UTC',
      created_at: row[6] || new Date().toISOString(),
      last_backup: row[7] || undefined,
    };
  }

  private userToRow(user: User): string[] {
    return [
      user.user_id,
      user.email,
      user.name,
      user.profile_pic || '',
      user.currency,
      user.timezone,
      user.created_at,
      user.last_backup || '',
    ];
  }

  async create(user: Omit<User, 'user_id' | 'created_at'>): Promise<User> {
    const newUser: User = {
      ...user,
      user_id: uuidv4(),
      created_at: new Date().toISOString(),
    };

    const row = this.userToRow(newUser);
    await sheetsClient.appendRange(`${this.sheetName}!A:H`, [row]);

    return newUser;
  }

  async readAll(): Promise<User[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:H`);
    
    return rows
      .map(row => this.rowToUser(row))
      .filter((user): user is User => user !== null);
  }

  async readByEmail(email: string): Promise<User | null> {
    const users = await this.readAll();
    return users.find(u => u.email === email) || null;
  }

  async readById(userId: string): Promise<User | null> {
    const users = await this.readAll();
    return users.find(u => u.user_id === userId) || null;
  }

  async update(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.readAll();
    const userIndex = users.findIndex(u => u.user_id === userId);

    if (userIndex === -1) {
      return null;
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...updates,
      user_id: userId, // Ensure ID doesn't change
    };

    const row = this.userToRow(updatedUser);
    // +2 because: +1 for header row, +1 for 0-based index
    await sheetsClient.writeRange(`${this.sheetName}!A${userIndex + 2}:H${userIndex + 2}`, [row]);

    return updatedUser;
  }

  async delete(userId: string): Promise<boolean> {
    const users = await this.readAll();
    const userIndex = users.findIndex(u => u.user_id === userId);

    if (userIndex === -1) {
      return false;
    }

    // Google Sheets doesn't have a direct delete API, so we'll clear the row
    // In a production app, you might want to mark as deleted instead
    await sheetsClient.writeRange(`${this.sheetName}!A${userIndex + 2}:H${userIndex + 2}`, [Array(8).fill('')]);

    return true;
  }
}

export const usersService = new UsersService();
