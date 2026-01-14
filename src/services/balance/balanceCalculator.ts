import { expensesService } from '../sheets/expensesService';
import { balancesService } from '../sheets/balancesService';
import type { Balance } from '../../types';

interface DebtGraph {
  [key: string]: {
    [key: string]: number; // user_from -> user_to -> amount
  };
}

class BalanceCalculator {
  /**
   * Calculate balances for a group based on expenses
   */
  async calculateBalances(groupId: string): Promise<Balance[]> {
    const expenses = await expensesService.readByGroupId(groupId);
    
    // Build debt graph: who owes whom how much
    const debtGraph: DebtGraph = {};

    for (const expense of expenses) {
      const paidBy = expense.paid_by;
      const splits = expense.splits || [];

      for (const split of splits) {
        const owesTo = split.user_email;
        if (owesTo === paidBy) continue; // Person doesn't owe themselves

        if (!debtGraph[owesTo]) {
          debtGraph[owesTo] = {};
        }
        if (!debtGraph[owesTo][paidBy]) {
          debtGraph[owesTo][paidBy] = 0;
        }
        debtGraph[owesTo][paidBy] += split.amount;
      }
    }

    // Simplify debts
    const simplified = this.simplifyDebts(debtGraph, expenses[0]?.currency || 'USD');

    // Save to balances sheet
    await this.saveBalances(groupId, simplified);

    return simplified;
  }

  /**
   * Simplify debts using a basic algorithm
   * Minimizes the number of transactions needed
   */
  private simplifyDebts(debtGraph: DebtGraph, currency: string): Balance[] {
    const balances: Balance[] = [];
    const netAmounts: { [key: string]: number } = {};

    // Calculate net amounts for each person
    for (const [owesTo, creditors] of Object.entries(debtGraph)) {
      if (!netAmounts[owesTo]) netAmounts[owesTo] = 0;
      
      for (const [creditor, amount] of Object.entries(creditors)) {
        if (!netAmounts[creditor]) netAmounts[creditor] = 0;
        netAmounts[owesTo] -= amount;
        netAmounts[creditor] += amount;
      }
    }

    // Create simplified balances
    const debtors: Array<[string, number]> = [];
    const creditors: Array<[string, number]> = [];

    for (const [person, amount] of Object.entries(netAmounts)) {
      if (Math.abs(amount) < 0.01) continue; // Ignore tiny amounts
      
      if (amount < 0) {
        debtors.push([person, Math.abs(amount)]);
      } else if (amount > 0) {
        creditors.push([person, amount]);
      }
    }

    // Match debtors with creditors
    let debtorIdx = 0;
    let creditorIdx = 0;

    while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
      const [debtor, debtAmount] = debtors[debtorIdx];
      const [creditor, creditAmount] = creditors[creditorIdx];

      const settleAmount = Math.min(debtAmount, creditAmount);

      balances.push({
        balance_id: `${debtor}-${creditor}`,
        group_id: '', // Will be set by caller
        user_from: debtor,
        user_to: creditor,
        amount: settleAmount,
        currency,
        updated_at: new Date().toISOString(),
      });

      debtors[debtorIdx][1] -= settleAmount;
      creditors[creditorIdx][1] -= settleAmount;

      if (debtors[debtorIdx][1] < 0.01) debtorIdx++;
      if (creditors[creditorIdx][1] < 0.01) creditorIdx++;
    }

    return balances;
  }

  /**
   * Save balances to the sheet
   */
  private async saveBalances(groupId: string, balances: Balance[]): Promise<void> {
    // Delete existing balances for this group
    await balancesService.deleteByGroupId(groupId);

    // Create new balances
    for (const balance of balances) {
      await balancesService.create({
        ...balance,
        group_id: groupId,
      });
    }
  }

  /**
   * Recalculate balances after expense change
   */
  async recalculateBalances(groupId: string): Promise<Balance[]> {
    return this.calculateBalances(groupId);
  }
}

export const balanceCalculator = new BalanceCalculator();
