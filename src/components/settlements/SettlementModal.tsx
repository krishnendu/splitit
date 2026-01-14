import React, { useState } from 'react';
import { useBalances } from '../../contexts/BalanceContext';
import { settlementsService } from '../../services/sheets/settlementsService';
import { balancesService } from '../../services/sheets/balancesService';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { getCurrentTimestamp } from '../../utils/date';
import type { Balance } from '../../types';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: Balance;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  balance,
}) => {
  const { refreshBalances } = useBalances();
  const [amount, setAmount] = useState(balance.amount.toString());
  const [method, setMethod] = useState('');
  const [date, setDate] = useState(getCurrentTimestamp());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSubmitting(true);
    try {
      // Create settlement record
      await settlementsService.create({
        group_id: balance.group_id,
        from_user: balance.user_from,
        to_user: balance.user_to,
        amount: amountNum,
        currency: balance.currency,
        method: method || undefined,
        date,
        notes: notes || undefined,
      });

      // Update balance
      const existingBalance = await balancesService.readByGroupId(balance.group_id);
      const currentBalance = existingBalance.find(
        b => b.user_from === balance.user_from && b.user_to === balance.user_to
      );

      if (currentBalance) {
        const newAmount = currentBalance.amount - amountNum;
        if (newAmount <= 0.01) {
          // Balance settled, delete it
          await balancesService.deleteByGroupId(balance.group_id);
        } else {
          // Update balance
          await balancesService.update(currentBalance.balance_id, {
            amount: newAmount,
          });
        }
      }

      await refreshBalances(balance.group_id);
      onClose();
    } catch (error) {
      console.error('Error creating settlement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Settlement">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p><strong>{balance.user_from}</strong> paying <strong>{balance.user_to}</strong></p>
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          max={balance.amount}
        />

        <Select
          label="Payment Method (optional)"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={paymentMethods}
        />

        <DatePicker
          label="Date"
          value={date}
          onChange={setDate}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={3}
            placeholder="Add any notes about this settlement..."
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Recording...' : 'Record Settlement'}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
