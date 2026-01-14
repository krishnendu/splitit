import React from 'react';
import { format } from 'date-fns';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  error?: string;
  value: string; // ISO date string
  onChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  value,
  onChange,
  className = '',
  ...props
}) => {
  const formattedValue = value ? format(new Date(value), 'yyyy-MM-dd') : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      onChange(date.toISOString());
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type="date"
        value={formattedValue}
        onChange={handleChange}
        className={`input ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
