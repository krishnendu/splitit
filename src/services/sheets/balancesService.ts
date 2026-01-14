import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, BALANCES_HEADERS } from '../../constants/sheetSchemas';
import type { Balance, BalanceRow } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class BalancesService {
  private sheetName = SHEET_NAMES.BALANCES;

  private rowToBalance(row: string[]): Balance | null {
    if (row.length < BALANCES_HEADERS.length) {
      return null;
    }

    return {
      balance_id: row[0] || '',
      group_id: row[1] || '',
      user_from: row[2] || '',
      user_to: row[3] || '',
      amount: parseFloat(row[4] || '0'),
      currency: row[5] || 'USD',
      updated_at: row[6] || new Date().toISOString(),
    };
  }

  private balanceToRow(balance: Balance): string[] {
    return [
      balance.balance_id,
      balance.group_id,
      balance.user_from,
      balance.user_to,
      balance.amount.toString(),
      balance.currency,
      balance.updated_at,
    ];
  }

  async create(balance: Omit<Balance, 'balance_id' | 'updated_at'>): Promise<Balance> {
    const newBalance: Balance = {
      ...balance,
      balance_id: uuidv4(),
      updated_at: new Date().toISOString(),
    };

    const row = this.balanceToRow(newBalance);
    await sheetsClient.appendRange(`${this.sheetName}!A:G`, [row]);

    return newBalance;
  }

  async readAll(): Promise<Balance[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:G`);
    
    return rows
      .map(row => this.rowToBalance(row))
      .filter((balance): balance is Balance => balance !== null);
  }

  async readByGroupId(groupId: string): Promise<Balance[]> {
    const balances = await this.readAll();
    return balances.filter(b => b.group_id === groupId);
  }

  async readByUserEmail(userEmail: string): Promise<Balance[]> {
    const balances = await this.readAll();
    return balances.filter(b => b.user_from === userEmail || b.user_to === userEmail);
  }

  async update(balanceId: string, updates: Partial<Balance>): Promise<Balance | null> {
    const balances = await this.readAll();
    const balanceIndex = balances.findIndex(b => b.balance_id === balanceId);

    if (balanceIndex === -1) {
      return null;
    }

    const updatedBalance: Balance = {
      ...balances[balanceIndex],
      ...updates,
      balance_id: balanceId,
      updated_at: new Date().toISOString(),
    };

    const row = this.balanceToRow(updatedBalance);
    await sheetsClient.writeRange(`${this.sheetName}!A${balanceIndex + 2}:G${balanceIndex + 2}`, [row]);

    return updatedBalance;
  }

  async deleteByGroupId(groupId: string): Promise<number> {
    const balances = await this.readByGroupId(groupId);
    let deleted = 0;

    for (const balance of balances) {
      const allBalances = await this.readAll();
      const balanceIndex = allBalances.findIndex(b => b.balance_id === balance.balance_id);
      
      if (balanceIndex !== -1) {
        await sheetsClient.writeRange(`${this.sheetName}!A${balanceIndex + 2}:G${balanceIndex + 2}`, [Array(7).fill('')]);
        deleted++;
      }
    }

    return deleted;
  }

  async upsertBalance(groupId: string, userFrom: string, userTo: string, amount: number, currency: string): Promise<Balance> {
    const balances = await this.readByGroupId(groupId);
    const existing = balances.find(
      b => b.user_from === userFrom && b.user_to === userTo && b.currency === currency
    );

    if (existing) {
      return this.update(existing.balance_id, { amount, updated_at: new Date().toISOString() }) || existing;
    }

    return this.create({
      group_id: groupId,
      user_from: userFrom,
      user_to: userTo,
      amount,
      currency,
    });
  }
}

export const balancesService = new BalancesService();
