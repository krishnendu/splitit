import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/config';
import type { User } from '../../types';

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
}

class AuthService {
  async handleCredentialResponse(response: CredentialResponse): Promise<GoogleProfile | null> {
    if (!response.credential) {
      return null;
    }

    try {
      // Decode JWT token to get user info
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const profile: GoogleProfile = JSON.parse(jsonPayload);
      
      // Store token
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.credential);
      
      // Store profile
      const userProfile = {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      };
      storage.set(STORAGE_KEYS.USER_PROFILE, userProfile);

      return profile;
    } catch (error) {
      console.error('Error processing credential response:', error);
      return null;
    }
  }

  getStoredProfile(): GoogleProfile | null {
    return storage.get<GoogleProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  getStoredToken(): string | null {
    return storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken() && !!this.getStoredProfile();
  }

  logout(): void {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_PROFILE);
  }

  async getAccessToken(): Promise<string | null> {
    // For Google OAuth, the credential is the JWT token
    // We may need to exchange it for an access token if using Google APIs
    return this.getStoredToken();
  }
}

export const authService = new AuthService();
