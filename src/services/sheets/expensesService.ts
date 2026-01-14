import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, EXPENSES_HEADERS } from '../../constants/sheetSchemas';
import type { Expense, ExpenseSplit } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class ExpensesService {
  private sheetName = SHEET_NAMES.EXPENSES;

  private rowToExpense(row: string[]): Expense | null {
    if (row.length < EXPENSES_HEADERS.length) {
      return null;
    }

    let splits: ExpenseSplit[] = [];
    try {
      splits = JSON.parse(row[7] || '[]');
    } catch {
      splits = [];
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(row[9] || '[]');
    } catch {
      tags = [];
    }

    return {
      expense_id: row[0] || '',
      group_id: row[1] || '',
      title: row[2] || '',
      amount: parseFloat(row[3] || '0'),
      currency: row[4] || 'USD',
      paid_by: row[5] || '',
      split_type: (row[6] || 'equal') as any,
      splits,
      category: row[8] || 'other',
      tags,
      notes: row[10] || undefined,
      receipt_url: row[11] || undefined,
      date: row[12] || new Date().toISOString(),
      created_at: row[13] || new Date().toISOString(),
      updated_at: row[14] || new Date().toISOString(),
    };
  }

  private expenseToRow(expense: Expense): string[] {
    return [
      expense.expense_id,
      expense.group_id,
      expense.title,
      expense.amount.toString(),
      expense.currency,
      expense.paid_by,
      expense.split_type,
      JSON.stringify(expense.splits),
      expense.category,
      JSON.stringify(expense.tags || []),
      expense.notes || '',
      expense.receipt_url || '',
      expense.date,
      expense.created_at,
      expense.updated_at,
    ];
  }

  async create(expense: Omit<Expense, 'expense_id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      expense_id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const row = this.expenseToRow(newExpense);
    await sheetsClient.appendRange(`${this.sheetName}!A:O`, [row]);

    return newExpense;
  }

  async readAll(): Promise<Expense[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:O`);
    
    return rows
      .map(row => this.rowToExpense(row))
      .filter((expense): expense is Expense => expense !== null);
  }

  async readById(expenseId: string): Promise<Expense | null> {
    const expenses = await this.readAll();
    return expenses.find(e => e.expense_id === expenseId) || null;
  }

  async readByGroupId(groupId: string): Promise<Expense[]> {
    const expenses = await this.readAll();
    return expenses.filter(e => e.group_id === groupId);
  }

  async update(expenseId: string, updates: Partial<Expense>): Promise<Expense | null> {
    const expenses = await this.readAll();
    const expenseIndex = expenses.findIndex(e => e.expense_id === expenseId);

    if (expenseIndex === -1) {
      return null;
    }

    const updatedExpense: Expense = {
      ...expenses[expenseIndex],
      ...updates,
      expense_id: expenseId,
      updated_at: new Date().toISOString(),
    };

    const row = this.expenseToRow(updatedExpense);
    await sheetsClient.writeRange(`${this.sheetName}!A${expenseIndex + 2}:O${expenseIndex + 2}`, [row]);

    return updatedExpense;
  }

  async delete(expenseId: string): Promise<boolean> {
    const expenses = await this.readAll();
    const expenseIndex = expenses.findIndex(e => e.expense_id === expenseId);

    if (expenseIndex === -1) {
      return false;
    }

    await sheetsClient.writeRange(`${this.sheetName}!A${expenseIndex + 2}:O${expenseIndex + 2}`, [Array(15).fill('')]);

    return true;
  }
}

export const expensesService = new ExpensesService();
