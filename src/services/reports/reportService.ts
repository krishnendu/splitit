import { expensesService } from '../sheets/expensesService';
import { groupsService } from '../sheets/groupsService';
import type { Expense, Group } from '../../types';

interface CategoryTotal {
  category: string;
  amount: number;
  count: number;
}

interface GroupSpending {
  group: Group;
  total: number;
  expenseCount: number;
}

class ReportService {
  async getSpendingByGroup(userEmail: string): Promise<GroupSpending[]> {
    const groups = await groupsService.readByUserEmail(userEmail);
    const expenses = await expensesService.readAll();

    return groups.map(group => {
      const groupExpenses = expenses.filter(e => e.group_id === group.group_id);
      const total = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      return {
        group,
        total,
        expenseCount: groupExpenses.length,
      };
    });
  }

  async getPersonalSpending(userEmail: string): Promise<{
    totalSpent: number;
    totalOwed: number;
    expenseCount: number;
  }> {
    const expenses = await expensesService.readAll();
    const userExpenses = expenses.filter(e => e.paid_by === userEmail);
    
    const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate what user owes from splits
    let totalOwed = 0;
    expenses.forEach(expense => {
      const userSplit = expense.splits?.find(s => s.user_email === userEmail);
      if (userSplit && expense.paid_by !== userEmail) {
        totalOwed += userSplit.amount;
      }
    });

    return {
      totalSpent,
      totalOwed,
      expenseCount: userExpenses.length,
    };
  }

  async getCategoryBreakdown(groupId?: string): Promise<CategoryTotal[]> {
    const expenses = groupId
      ? await expensesService.readByGroupId(groupId)
      : await expensesService.readAll();

    const categoryMap: { [key: string]: { amount: number; count: number } } = {};

    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (!categoryMap[category]) {
        categoryMap[category] = { amount: 0, count: 0 };
      }
      categoryMap[category].amount += expense.amount;
      categoryMap[category].count += 1;
    });

    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    })).sort((a, b) => b.amount - a.amount);
  }

  async exportToCSV(expenses: Expense[]): Promise<string> {
    const headers = ['Date', 'Title', 'Amount', 'Currency', 'Paid By', 'Category', 'Group', 'Notes'];
    const rows = expenses.map(expense => [
      expense.date,
      expense.title,
      expense.amount.toString(),
      expense.currency,
      expense.paid_by,
      expense.category,
      expense.group_id,
      expense.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const reportService = new ReportService();
