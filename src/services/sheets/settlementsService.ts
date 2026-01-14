import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, SETTLEMENTS_HEADERS } from '../../constants/sheetSchemas';
import type { Settlement } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class SettlementsService {
  private sheetName = SHEET_NAMES.SETTLEMENTS;

  private rowToSettlement(row: string[]): Settlement | null {
    if (row.length < SETTLEMENTS_HEADERS.length) {
      return null;
    }

    return {
      settlement_id: row[0] || '',
      group_id: row[1] || '',
      from_user: row[2] || '',
      to_user: row[3] || '',
      amount: parseFloat(row[4] || '0'),
      currency: row[5] || 'USD',
      method: row[6] || undefined,
      date: row[7] || new Date().toISOString(),
      settled_at: row[8] || new Date().toISOString(),
      notes: row[9] || undefined,
    };
  }

  private settlementToRow(settlement: Settlement): string[] {
    return [
      settlement.settlement_id,
      settlement.group_id,
      settlement.from_user,
      settlement.to_user,
      settlement.amount.toString(),
      settlement.currency,
      settlement.method || '',
      settlement.date,
      settlement.settled_at,
      settlement.notes || '',
    ];
  }

  async create(settlement: Omit<Settlement, 'settlement_id' | 'settled_at'>): Promise<Settlement> {
    const newSettlement: Settlement = {
      ...settlement,
      settlement_id: uuidv4(),
      settled_at: new Date().toISOString(),
    };

    const row = this.settlementToRow(newSettlement);
    await sheetsClient.appendRange(`${this.sheetName}!A:J`, [row]);

    return newSettlement;
  }

  async readAll(): Promise<Settlement[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:J`);
    
    return rows
      .map(row => this.rowToSettlement(row))
      .filter((settlement): settlement is Settlement => settlement !== null);
  }

  async readById(settlementId: string): Promise<Settlement | null> {
    const settlements = await this.readAll();
    return settlements.find(s => s.settlement_id === settlementId) || null;
  }

  async readByGroupId(groupId: string): Promise<Settlement[]> {
    const settlements = await this.readAll();
    return settlements.filter(s => s.group_id === groupId);
  }

  async readByUserEmail(userEmail: string): Promise<Settlement[]> {
    const settlements = await this.readAll();
    return settlements.filter(s => s.from_user === userEmail || s.to_user === userEmail);
  }
}

export const settlementsService = new SettlementsService();
