import { gapi } from 'gapi-script';
import { STORAGE_KEYS, SHEETS_API_CONFIG, API_LIMITS } from '../../constants/config';
import { storage } from '../../utils/storage';
import type { SheetsBatchUpdateResponse } from '../../types';

export interface SheetsClientConfig {
  apiKey?: string;
  sheetId: string;
  accessToken?: string;
}

class SheetsClient {
  private apiKey: string | null = null;
  private sheetId: string | null = null;
  private accessToken: string | null = null;
  private gapiInitialized = false;

  async initialize(config: SheetsClientConfig): Promise<void> {
    this.apiKey = config.apiKey || storage.get<string>(STORAGE_KEYS.API_KEY) || null;
    this.sheetId = config.sheetId;
    this.accessToken = config.accessToken || storage.get<string>(STORAGE_KEYS.AUTH_TOKEN) || null;

    if (!this.sheetId) {
      throw new Error('Sheet ID is required');
    }

    // Initialize gapi if not already initialized
    if (!this.gapiInitialized) {
      await this.loadGapi();
    }
  }

  private async loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (gapi.client && gapi.client.sheets) {
        this.gapiInitialized = true;
        resolve();
        return;
      }

      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.apiKey || undefined,
            discoveryDocs: SHEETS_API_CONFIG.DISCOVERY_DOCS,
          });

          if (this.accessToken) {
            gapi.client.setToken({ access_token: this.accessToken });
          }

          this.gapiInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing gapi:', error);
          reject(error);
        }
      });
    });
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    if (gapi.client) {
      gapi.client.setToken({ access_token: token });
    }
  }

  private async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    if (!this.gapiInitialized || !gapi.client?.sheets) {
      throw new Error('Sheets API not initialized');
    }

    let attempts = 0;
    while (attempts < API_LIMITS.RETRY_ATTEMPTS) {
      try {
        return await requestFn();
      } catch (error: any) {
        attempts++;
        if (attempts >= API_LIMITS.RETRY_ATTEMPTS) {
          throw error;
        }
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, API_LIMITS.RETRY_DELAY * attempts));
      }
    }
    throw new Error('Request failed after retries');
  }

  async readRange(range: string): Promise<string[][]> {
    if (!this.sheetId) {
      throw new Error('Sheet ID not set');
    }

    return this.executeRequest(async () => {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId!,
        range,
      });

      return response.result.values || [];
    });
  }

  async writeRange(range: string, values: string[][]): Promise<void> {
    if (!this.sheetId) {
      throw new Error('Sheet ID not set');
    }

    await this.executeRequest(async () => {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId!,
        range,
        valueInputOption: 'RAW',
        resource: {
          values,
        },
      });
    });
  }

  async appendRange(range: string, values: string[][]): Promise<void> {
    if (!this.sheetId) {
      throw new Error('Sheet ID not set');
    }

    await this.executeRequest(async () => {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId!,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values,
        },
      });
    });
  }

  async batchUpdate(requests: Array<{ range: string; values: string[][] }>): Promise<SheetsBatchUpdateResponse> {
    if (!this.sheetId) {
      throw new Error('Sheet ID not set');
    }

    // Split into batches if needed
    const batches: Array<Array<{ range: string; values: string[][] }>> = [];
    for (let i = 0; i < requests.length; i += API_LIMITS.BATCH_SIZE) {
      batches.push(requests.slice(i, i + API_LIMITS.BATCH_SIZE));
    }

    const allResults: SheetsBatchUpdateResponse[] = [];

    for (const batch of batches) {
      const result = await this.executeRequest(async () => {
        const data = batch.map(req => ({
          range: req.range,
          values: req.values,
        }));

        const response = await gapi.client.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.sheetId!,
          resource: {
            valueInputOption: 'RAW',
            data,
          },
        });

        return {
          spreadsheetId: response.result.spreadsheetId || this.sheetId!,
          updatedCells: batch.reduce((sum, req) => sum + req.values.length, 0),
        };
      });

      allResults.push(result);
    }

    return {
      spreadsheetId: this.sheetId!,
      updatedCells: allResults.reduce((sum, r) => sum + r.updatedCells, 0),
    };
  }

  async createSheet(title: string): Promise<void> {
    if (!this.sheetId) {
      throw new Error('Sheet ID not set');
    }

    await this.executeRequest(async () => {
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId!,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });
    });
  }

  async clearRange(range: string): Promise<void> {
    if (!this.sheetId) {
      throw new Error('Sheet ID not set');
    }

    await this.executeRequest(async () => {
      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: this.sheetId!,
        range,
      });
    });
  }

  getSheetId(): string | null {
    return this.sheetId;
  }

  isInitialized(): boolean {
    return this.gapiInitialized && !!this.sheetId;
  }
}

// Singleton instance
export const sheetsClient = new SheetsClient();
