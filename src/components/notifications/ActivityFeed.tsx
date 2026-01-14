import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../layout/LoadingSpinner';

export const ActivityFeed: React.FC = () => {
  const { notifications, isLoading, markAllAsRead, unreadCount } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="secondary"
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-600">
          No notifications
        </div>
      ) : (
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem key={notification.notification_id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};
