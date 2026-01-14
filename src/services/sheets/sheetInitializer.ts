import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, getSheetHeaders } from '../../constants/sheetSchemas';

export interface SheetInitializationResult {
  success: boolean;
  createdSheets: string[];
  errors: string[];
}

class SheetInitializer {
  async initializeSheet(): Promise<SheetInitializationResult> {
    const result: SheetInitializationResult = {
      success: true,
      createdSheets: [],
      errors: [],
    };

    if (!sheetsClient.isInitialized()) {
      result.success = false;
      result.errors.push('Sheets client not initialized');
      return result;
    }

    const sheetId = sheetsClient.getSheetId();
    if (!sheetId) {
      result.success = false;
      result.errors.push('Sheet ID not set');
      return result;
    }

    // Check which sheets exist and create missing ones
    const existingSheets = await this.getExistingSheets();
    const requiredSheets = Object.values(SHEET_NAMES);

    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        try {
          await sheetsClient.createSheet(sheetName);
          result.createdSheets.push(sheetName);
        } catch (error: any) {
          result.success = false;
          result.errors.push(`Failed to create sheet ${sheetName}: ${error.message}`);
        }
      }
    }

    // Set up headers for all sheets
    for (const sheetName of requiredSheets) {
      try {
        await this.setupSheetHeaders(sheetName);
      } catch (error: any) {
        result.success = false;
        result.errors.push(`Failed to setup headers for ${sheetName}: ${error.message}`);
      }
    }

    return result;
  }

  private async getExistingSheets(): Promise<string[]> {
    try {
      const gapi = (window as any).gapi;
      if (!gapi?.client?.sheets) {
        return [];
      }
      
      const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: sheetsClient.getSheetId(),
      });

      return response.result.sheets?.map((sheet: any) => sheet.properties.title) || [];
    } catch (error) {
      console.error('Error fetching existing sheets:', error);
      return [];
    }
  }

  private async setupSheetHeaders(sheetName: string): Promise<void> {
    const headers = getSheetHeaders(sheetName);
    if (headers.length === 0) {
      return;
    }

    // Check if headers already exist
    const existingData = await sheetsClient.readRange(`${sheetName}!A1:Z1`);
    
    if (existingData.length === 0 || existingData[0].length === 0) {
      // No headers exist, create them
      await sheetsClient.writeRange(`${sheetName}!A1`, [headers]);
    } else {
      // Headers exist, verify they match
      const existingHeaders = existingData[0];
      const headersMatch = headers.every((header, index) => existingHeaders[index] === header);
      
      if (!headersMatch) {
        // Headers don't match, but we'll log a warning instead of overwriting
        console.warn(`Headers for ${sheetName} don't match expected schema. Expected:`, headers, 'Found:', existingHeaders);
      }
    }
  }

  async validateSheetStructure(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const sheetId = sheetsClient.getSheetId();

    if (!sheetId) {
      return { valid: false, errors: ['Sheet ID not set'] };
    }

    // Check if all required sheets exist
    const existingSheets = await this.getExistingSheets();
    const requiredSheets = Object.values(SHEET_NAMES);

    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        errors.push(`Missing required sheet: ${sheetName}`);
      } else {
        // Validate headers
        try {
          const headers = getSheetHeaders(sheetName);
          const existingData = await sheetsClient.readRange(`${sheetName}!A1:Z1`);
          
          if (existingData.length === 0 || existingData[0].length === 0) {
            errors.push(`Sheet ${sheetName} has no headers`);
          } else {
            const existingHeaders = existingData[0];
            const missingHeaders = headers.filter(h => !existingHeaders.includes(h));
            if (missingHeaders.length > 0) {
              errors.push(`Sheet ${sheetName} missing headers: ${missingHeaders.join(', ')}`);
            }
          }
        } catch (error: any) {
          errors.push(`Error validating sheet ${sheetName}: ${error.message}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const sheetInitializer = new SheetInitializer();
