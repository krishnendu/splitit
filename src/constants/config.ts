// App configuration constants
export const APP_VERSION = '1.0.0';
export const BACKUP_VERSION = '1.0.0';

// LocalStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'splitit_auth_token',
  USER_PROFILE: 'splitit_user_profile',
  SHEET_ID: 'splitit_sheet_id',
  API_KEY: 'splitit_api_key',
  OAUTH_CLIENT_ID: 'splitit_oauth_client_id',
  APP_CONFIG: 'splitit_app_config',
  USER_PREFERENCES: 'splitit_user_preferences',
  BACKUP_HISTORY: 'splitit_backup_history',
  LAST_SYNC: 'splitit_last_sync',
} as const;

// Google Sheets API configuration
export const SHEETS_API_CONFIG = {
  DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
  API_VERSION: 'v4',
} as const;

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  ACTIVE_TAB: 30000, // 30 seconds
  INACTIVE_TAB: 300000, // 5 minutes
  BALANCE_UPDATE: 10000, // 10 seconds after expense change
} as const;

// API rate limits
export const API_LIMITS = {
  REQUESTS_PER_100_SECONDS: 100,
  BATCH_SIZE: 100, // Max rows per batch request
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Backup configuration
export const BACKUP_CONFIG = {
  MAX_LOCAL_BACKUPS: 5,
  MAX_BACKUP_SIZE_MB: 50,
  COMPRESSION_ENABLED: true,
  INCLUDE_RECEIPTS: false, // For MVP, receipts not included
} as const;

// Default values
export const DEFAULTS = {
  CURRENCY: 'USD',
  TIMEZONE: 'UTC',
  SPLIT_TYPE: 'equal' as const,
  CATEGORY: 'other',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIMESTAMP: "yyyy-MM-dd'T'HH:mm:ss'Z'",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  SHEET_NOT_FOUND: 'Google Sheet not found. Please check your Sheet ID.',
  API_ERROR: 'Error connecting to Google Sheets API.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  INVALID_BACKUP: 'Invalid backup file format.',
  RESTORE_FAILED: 'Failed to restore backup. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;
