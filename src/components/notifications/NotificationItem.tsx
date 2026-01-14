import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';
import type { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.notification_id);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'expense':
        return '💰';
      case 'settlement':
        return '✅';
      case 'group_update':
        return '👥';
      default:
        return '🔔';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(notification.timestamp, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
        )}
      </div>
    </div>
  );
};
