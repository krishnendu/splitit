import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';

export const GoogleSignIn: React.FC = () => {
  const { login } = useAuth();

  const handleSuccess = async (response: any) => {
    const profile = await authService.handleCredentialResponse(response);
    if (profile && response.credential) {
      login(profile, response.credential);
    }
  };

  const handleError = () => {
    console.error('Login failed');
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
      />
    </div>
  );
};
