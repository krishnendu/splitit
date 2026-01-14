import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useExpenses } from '../../contexts/ExpenseContext';
import { ExpenseCard } from './ExpenseCard';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { Button } from '../common/Button';
import { CreateExpenseModal } from './CreateExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseFilters } from './ExpenseFilters';
import type { Expense } from '../../types';

export const ExpenseList: React.FC = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const { expenses, isLoading, deleteExpense } = useExpenses();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const groupExpenses = useMemo(() => {
    if (!groupId) return [];
    return expenses.filter(e => e.group_id === groupId);
  }, [expenses, groupId]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return groupExpenses;
    return groupExpenses.filter(e => e.category === selectedCategory);
  }, [groupExpenses, selectedCategory]);

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!groupId) {
    return <div>Group ID not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
          Add Expense
        </Button>
      </div>

      <ExpenseFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No expenses yet. Add your first expense!</p>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Add Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.expense_id}
              expense={expense}
              onEdit={() => setEditingExpense(expense)}
              onDelete={() => handleDelete(expense.expense_id)}
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateExpenseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          groupId={groupId}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
        />
      )}
    </div>
  );
};
