import React from 'react';
import { SpendingSummary } from './SpendingSummary';
import { PersonalSpending } from './PersonalSpending';
import { CategoryBreakdown } from './CategoryBreakdown';

export const ReportsDashboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalSpending />
        <SpendingSummary />
      </div>

      <CategoryBreakdown />
    </div>
  );
};
