import { z } from 'zod';

// Validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const sheetIdSchema = z.string().min(1, 'Sheet ID is required');

export const amountSchema = z.number().positive('Amount must be positive');

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: amountSchema,
  date: z.string().min(1, 'Date is required'),
  paid_by: emailSchema,
  category: z.string().min(1, 'Category is required'),
});

export const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  members: z.array(emailSchema).min(1, 'At least one member is required'),
});

// Validation helpers
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validateSheetId = (sheetId: string): boolean => {
  return sheetIdSchema.safeParse(sheetId).success;
};
