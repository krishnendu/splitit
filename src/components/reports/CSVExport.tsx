import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { reportService } from '../../services/reports/reportService';
import { Button } from '../common/Button';

export const CSVExport: React.FC = () => {
  const { expenses } = useExpenses();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await reportService.exportToCSV(expenses);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} variant="secondary" disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export to CSV'}
    </Button>
  );
};
