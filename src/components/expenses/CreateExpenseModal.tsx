import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useGroups } from '../../contexts/GroupContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { DEFAULTS } from '../../constants/config';
import { getCurrentTimestamp } from '../../utils/date';
import type { Expense, ExpenseSplit } from '../../types';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  isOpen,
  onClose,
  groupId,
}) => {
  const { createExpense } = useExpenses();
  const { groups } = useGroups();
  const group = groups.find(g => g.group_id === groupId);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentTimestamp());
  const [paidBy, setPaidBy] = useState(group?.members[0] || '');
  const [category, setCategory] = useState(DEFAULTS.CATEGORY);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !group) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // Calculate equal split
    const splitAmount = amountNum / group.members.length;
    const splits: ExpenseSplit[] = group.members.map(member => ({
      user_email: member,
      amount: splitAmount,
    }));

    setIsSubmitting(true);
    try {
      await createExpense({
        group_id: groupId,
        title,
        amount: amountNum,
        currency: group.currency,
        paid_by: paidBy,
        split_type: 'equal',
        splits,
        category,
        notes: notes || undefined,
        date,
      });
      onClose();
      // Reset form
      setTitle('');
      setAmount('');
      setDate(getCurrentTimestamp());
      setPaidBy(group.members[0] || '');
      setCategory(DEFAULTS.CATEGORY);
      setNotes('');
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) {
    return null;
  }

  const categoryOptions = EXPENSE_CATEGORIES.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`,
  }));

  const paidByOptions = group.members.map(email => ({
    value: email,
    label: email,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Dinner at restaurant"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.00"
          />

          <DatePicker
            label="Date"
            value={date}
            onChange={setDate}
            required
          />
        </div>

        <Select
          label="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          options={paidByOptions}
          required
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
          This expense will be split equally among {group.members.length} {group.members.length === 1 ? 'person' : 'people'}
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Creating...' : 'Create Expense'}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
