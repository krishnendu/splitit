// User types
export interface User {
  user_id: string;
  email: string;
  name: string;
  profile_pic?: string;
  currency: string;
  timezone: string;
  created_at: string;
  last_backup?: string;
}

// Group types
export interface Group {
  group_id: string;
  name: string;
  created_by: string;
  members: string[]; // Array of user emails
  currency: string;
  image_url?: string;
  created_at: string;
  archived: boolean;
}

// Expense types
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface ExpenseSplit {
  user_email: string;
  amount: number;
}

export interface Expense {
  expense_id: string;
  group_id: string;
  title: string;
  amount: number;
  currency: string;
  paid_by: string; // user email
  split_type: SplitType;
  splits: ExpenseSplit[]; // JSON string in sheet, parsed to array
  category: string;
  tags?: string[]; // JSON string in sheet
  notes?: string;
  receipt_url?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Balance types
export interface Balance {
  balance_id: string;
  group_id: string;
  user_from: string; // user email
  user_to: string; // user email
  amount: number;
  currency: string;
  updated_at: string;
}

// Settlement types
export interface Settlement {
  settlement_id: string;
  group_id: string;
  from_user: string; // user email
  to_user: string; // user email
  amount: number;
  currency: string;
  method?: string;
  date: string;
  settled_at: string;
  notes?: string;
}

// Comment types
export interface Comment {
  comment_id: string;
  expense_id: string;
  user_id: string;
  text: string;
  timestamp: string;
}

// Notification types
export type NotificationType = 'expense' | 'settlement' | 'group_update';

export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  timestamp: string;
}

// Backup types
export interface BackupMetadata {
  backup_id: string;
  timestamp: string;
  user_email: string;
  app_version: string;
  sheet_id: string;
  backup_type: 'full' | 'partial' | 'selective';
}

export interface BackupFile {
  version: string;
  backup_metadata: BackupMetadata;
  data: {
    users: User[];
    groups: Group[];
    expenses: Expense[];
    balances: Balance[];
    settlements: Settlement[];
    comments: Comment[];
    notifications: Notification[];
  };
  settings: {
    user_preferences: Record<string, unknown>;
    app_config: Record<string, unknown>;
  };
  checksum: string;
}

// Sheet row types (as stored in Google Sheets)
export interface UserRow {
  user_id: string;
  email: string;
  name: string;
  profile_pic: string;
  currency: string;
  timezone: string;
  created_at: string;
  last_backup: string;
}

export interface GroupRow {
  group_id: string;
  name: string;
  created_by: string;
  members: string; // JSON string
  currency: string;
  image_url: string;
  created_at: string;
  archived: string; // "true" or "false"
}

export interface ExpenseRow {
  expense_id: string;
  group_id: string;
  title: string;
  amount: string;
  currency: string;
  paid_by: string;
  split_type: string;
  splits: string; // JSON string
  category: string;
  tags: string; // JSON string
  notes: string;
  receipt_url: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface BalanceRow {
  balance_id: string;
  group_id: string;
  user_from: string;
  user_to: string;
  amount: string;
  currency: string;
  updated_at: string;
}

export interface SettlementRow {
  settlement_id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: string;
  currency: string;
  method: string;
  date: string;
  settled_at: string;
  notes: string;
}

export interface CommentRow {
  comment_id: string;
  expense_id: string;
  user_id: string;
  text: string;
  timestamp: string;
}

export interface NotificationRow {
  notification_id: string;
  user_id: string;
  type: string;
  message: string;
  read: string; // "true" or "false"
  timestamp: string;
}

export interface BackupRow {
  backup_id: string;
  backup_date: string;
  backup_type: string;
  file_location: string;
  file_size: string;
  created_by: string;
}

export interface SystemConfigRow {
  config_key: string;
  config_value: string;
  updated_at: string;
}

// API Response types
export interface SheetsApiResponse {
  values: string[][];
}

export interface SheetsBatchUpdateResponse {
  spreadsheetId: string;
  updatedCells: number;
}

// App state types
export interface AppConfig {
  sheetId?: string;
  apiKey?: string;
  oauthClientId?: string;
  initialized: boolean;
}

export interface UserPreferences {
  currency: string;
  timezone: string;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  autoBackupEnabled?: boolean;
}
