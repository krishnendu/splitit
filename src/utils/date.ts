import { format, parseISO } from 'date-fns';
import { DATE_FORMATS } from '../constants/config';

export const formatDate = (date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const formatTimestamp = (timestamp: string): string => {
  return formatDate(timestamp, DATE_FORMATS.TIMESTAMP);
};
