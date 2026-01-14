import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              SplitIt
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link to="/groups" className="text-gray-600 hover:text-gray-900">
                Groups
              </Link>
              <Link to="/balances" className="text-gray-600 hover:text-gray-900">
                Balances
              </Link>
              <Link to="/reports" className="text-gray-600 hover:text-gray-900">
                Reports
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            {user && (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                </Link>
                <Button onClick={logout} variant="secondary" className="text-sm">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
