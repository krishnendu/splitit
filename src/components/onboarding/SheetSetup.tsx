import React, { useState } from 'react';
import { sheetsClient } from '../../services/sheets/sheetsClient';
import { sheetInitializer } from '../../services/sheets/sheetInitializer';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/config';
import { validateSheetId } from '../../utils/validation';

interface SheetSetupProps {
  onComplete: () => void;
}

export const SheetSetup: React.FC<SheetSetupProps> = () => {
  const [sheetId, setSheetId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateSheetId(sheetId)) {
      setError('Please enter a valid Sheet ID');
      return;
    }

    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }

    if (!oauthClientId.trim()) {
      setError('OAuth Client ID is required');
      return;
    }

    setIsInitializing(true);

    try {
      // Store credentials
      storage.set(STORAGE_KEYS.SHEET_ID, sheetId);
      storage.set(STORAGE_KEYS.API_KEY, apiKey);
      storage.set(STORAGE_KEYS.OAUTH_CLIENT_ID, oauthClientId);

      // Initialize sheets client
      await sheetsClient.initialize({
        apiKey,
        sheetId,
      });

      // Initialize sheet structure
      const result = await sheetInitializer.initializeSheet();

      if (!result.success) {
        setError(`Initialization failed: ${result.errors.join(', ')}`);
        return;
      }

      // Mark as initialized
      storage.set(STORAGE_KEYS.APP_CONFIG, {
        initialized: true,
        sheetId,
      });

      // Complete onboarding
      // onComplete will be called by parent component
    } catch (error: any) {
      console.error('Error setting up sheet:', error);
      setError(error.message || 'Failed to initialize sheet. Please check your credentials.');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-bold mb-4">Connect Your Google Sheet</h2>
      <p className="text-gray-600 mb-6">
        We'll use your Google Sheet to store all your data. You'll need to provide your Sheet ID and API credentials.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Google Sheet ID
          </label>
          <input
            type="text"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="Enter your Sheet ID from the URL"
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Found in your Google Sheet URL: docs.google.com/spreadsheets/d/[SHEET_ID]/edit
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Google Sheets API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API Key"
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Get this from Google Cloud Console
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            OAuth Client ID
          </label>
          <input
            type="text"
            value={oauthClientId}
            onChange={(e) => setOauthClientId(e.target.value)}
            placeholder="Enter your OAuth Client ID"
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for Google Sign-In
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isInitializing}
          className="btn btn-primary w-full"
        >
          {isInitializing ? 'Initializing...' : 'Initialize Sheet'}
        </button>
      </form>
    </div>
  );
};
