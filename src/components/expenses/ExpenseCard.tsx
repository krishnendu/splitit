import React from 'react';
import { formatDate } from '../../utils/date';
import { getCategoryById } from '../../constants/categories';
import type { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const category = getCategoryById(expense.category);

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {category && (
              <span className="text-2xl">{category.icon}</span>
            )}
            <h3 className="text-lg font-semibold">{expense.title}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-1">
            Paid by {expense.paid_by} • {formatDate(expense.date)}
          </p>
          <p className="text-2xl font-bold text-primary-600">
            {expense.currency} {expense.amount.toFixed(2)}
          </p>
          {expense.notes && (
            <p className="text-gray-500 text-sm mt-2">{expense.notes}</p>
          )}
          {expense.splits && expense.splits.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Split among {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
