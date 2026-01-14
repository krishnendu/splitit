import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { GroupProvider } from './contexts/GroupContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { BalanceProvider } from './contexts/BalanceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { GoogleSignIn } from './components/auth/GoogleSignIn';
import { GroupList } from './components/groups/GroupList';
import { GroupDetails } from './components/groups/GroupDetails';
import { ExpenseList } from './components/expenses/ExpenseList';
import { BalanceList } from './components/balances/BalanceList';
import { OverallBalance } from './components/balances/OverallBalance';
import { SettlementList } from './components/settlements/SettlementList';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { UserProfile } from './components/user/UserProfile';
import { BackupSettings } from './components/backup/BackupSettings';
import { InstallPrompt } from './components/common/InstallPrompt';
import { storage } from './utils/storage';
import { STORAGE_KEYS } from './constants/config';
import type { AppConfig } from './types';

// Get OAuth client ID from storage
const getOAuthClientId = () => {
  return storage.get<string>(STORAGE_KEYS.OAUTH_CLIENT_ID) || '';
};

const LoginPage: React.FC = () => {
  const clientId = getOAuthClientId();
  
  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">OAuth Client ID not configured</p>
          <a href="/onboarding" className="text-primary-600 hover:underline">
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full card">
          <h1 className="text-3xl font-bold text-center mb-6">Welcome to SplitIt</h1>
          <GoogleSignIn />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = storage.get<AppConfig>(STORAGE_KEYS.APP_CONFIG);
  const isInitialized = config?.initialized;

  if (!isInitialized) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OverallBalance />
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/groups" className="block text-primary-600 hover:underline">
              View Groups →
            </a>
            <a href="/reports" className="block text-primary-600 hover:underline">
              View Reports →
            </a>
            <a href="/settings" className="block text-primary-600 hover:underline">
              Backup Settings →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      
      <Route
        path="/*"
        element={
          <AuthGuard>
            <OnboardingCheck>
              <GoogleOAuthProvider clientId={getOAuthClientId()}>
                <GroupProvider>
                  <ExpenseProvider>
                    <BalanceProvider>
                      <NotificationProvider>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/groups" element={<GroupList />} />
                            <Route path="/groups/:id" element={<GroupDetails />} />
                            <Route path="/groups/:id/expenses" element={<ExpenseList />} />
                            <Route path="/groups/:id/balances" element={<BalanceList />} />
                            <Route path="/groups/:id/settlements" element={<SettlementList />} />
                            <Route path="/balances" element={<OverallBalance />} />
                            <Route path="/reports" element={<ReportsDashboard />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/settings" element={<BackupSettings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Layout>
                      </NotificationProvider>
                    </BalanceProvider>
                  </ExpenseProvider>
                </GroupProvider>
              </GoogleOAuthProvider>
            </OnboardingCheck>
          </AuthGuard>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <InstallPrompt />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
