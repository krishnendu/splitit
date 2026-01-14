import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import type { Expense } from '../../types';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const { updateExpense } = useExpenses();
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [date, setDate] = useState(expense.date);
  const [paidBy, setPaidBy] = useState(expense.paid_by);
  const [category, setCategory] = useState(expense.category);
  const [notes, setNotes] = useState(expense.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setDate(expense.date);
      setPaidBy(expense.paid_by);
      setCategory(expense.category);
      setNotes(expense.notes || '');
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSubmitting(true);
    try {
      await updateExpense(expense.expense_id, {
        title,
        amount: amountNum,
        date,
        paid_by: paidBy,
        category,
        notes: notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`,
  }));

  // Get members from splits
  const memberEmails = expense.splits?.map(s => s.user_email) || [];
  const paidByOptions = memberEmails.map(email => ({
    value: email,
    label: email,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <DatePicker
            label="Date"
            value={date}
            onChange={setDate}
            required
          />
        </div>

        {paidByOptions.length > 0 && (
          <Select
            label="Paid By"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            options={paidByOptions}
            required
          />
        )}

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={3}
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Updating...' : 'Update Expense'}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
