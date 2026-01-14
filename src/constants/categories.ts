export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#f59e0b' },
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#3b82f6' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#10b981' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#f97316' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#06b6d4' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ef4444' },
  { id: 'education', name: 'Education', icon: '📚', color: '#6366f1' },
  { id: 'bills', name: 'Bills', icon: '📄', color: '#64748b' },
  { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#f43f5e' },
  { id: 'other', name: 'Other', icon: '📦', color: '#94a3b8' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return EXPENSE_CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return EXPENSE_CATEGORIES.find(cat => cat.name === name);
};
