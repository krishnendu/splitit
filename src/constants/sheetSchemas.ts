// Sheet names
export const SHEET_NAMES = {
  USERS: 'Users',
  GROUPS: 'Groups',
  EXPENSES: 'Expenses',
  BALANCES: 'Balances',
  SETTLEMENTS: 'Settlements',
  COMMENTS: 'Comments',
  NOTIFICATIONS: 'Notifications',
  BACKUPS: 'Backups',
  SYSTEM_CONFIG: 'System Config',
} as const;

// Column headers for each sheet
export const USERS_HEADERS = [
  'user_id',
  'email',
  'name',
  'profile_pic',
  'currency',
  'timezone',
  'created_at',
  'last_backup',
];

export const GROUPS_HEADERS = [
  'group_id',
  'name',
  'created_by',
  'members',
  'currency',
  'image_url',
  'created_at',
  'archived',
];

export const EXPENSES_HEADERS = [
  'expense_id',
  'group_id',
  'title',
  'amount',
  'currency',
  'paid_by',
  'split_type',
  'splits',
  'category',
  'tags',
  'notes',
  'receipt_url',
  'date',
  'created_at',
  'updated_at',
];

export const BALANCES_HEADERS = [
  'balance_id',
  'group_id',
  'user_from',
  'user_to',
  'amount',
  'currency',
  'updated_at',
];

export const SETTLEMENTS_HEADERS = [
  'settlement_id',
  'group_id',
  'from_user',
  'to_user',
  'amount',
  'currency',
  'method',
  'date',
  'settled_at',
  'notes',
];

export const COMMENTS_HEADERS = [
  'comment_id',
  'expense_id',
  'user_id',
  'text',
  'timestamp',
];

export const NOTIFICATIONS_HEADERS = [
  'notification_id',
  'user_id',
  'type',
  'message',
  'read',
  'timestamp',
];

export const BACKUPS_HEADERS = [
  'backup_id',
  'backup_date',
  'backup_type',
  'file_location',
  'file_size',
  'created_by',
];

export const SYSTEM_CONFIG_HEADERS = [
  'config_key',
  'config_value',
  'updated_at',
];

// Helper to get headers for a sheet
export const getSheetHeaders = (sheetName: string): string[] => {
  switch (sheetName) {
    case SHEET_NAMES.USERS:
      return USERS_HEADERS;
    case SHEET_NAMES.GROUPS:
      return GROUPS_HEADERS;
    case SHEET_NAMES.EXPENSES:
      return EXPENSES_HEADERS;
    case SHEET_NAMES.BALANCES:
      return BALANCES_HEADERS;
    case SHEET_NAMES.SETTLEMENTS:
      return SETTLEMENTS_HEADERS;
    case SHEET_NAMES.COMMENTS:
      return COMMENTS_HEADERS;
    case SHEET_NAMES.NOTIFICATIONS:
      return NOTIFICATIONS_HEADERS;
    case SHEET_NAMES.BACKUPS:
      return BACKUPS_HEADERS;
    case SHEET_NAMES.SYSTEM_CONFIG:
      return SYSTEM_CONFIG_HEADERS;
    default:
      return [];
  }
};
