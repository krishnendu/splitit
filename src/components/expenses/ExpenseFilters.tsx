import React from 'react';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

interface ExpenseFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Filter by Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="input"
      >
        <option value="all">All Categories</option>
        {EXPENSE_CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.icon} {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};
