import { sheetsClient } from './sheetsClient';
import { SHEET_NAMES, NOTIFICATIONS_HEADERS } from '../../constants/sheetSchemas';
import type { Notification, NotificationType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

class NotificationsService {
  private sheetName = SHEET_NAMES.NOTIFICATIONS;

  private rowToNotification(row: string[]): Notification | null {
    if (row.length < NOTIFICATIONS_HEADERS.length) {
      return null;
    }

    return {
      notification_id: row[0] || '',
      user_id: row[1] || '',
      type: (row[2] || 'expense') as NotificationType,
      message: row[3] || '',
      read: row[4] === 'true',
      timestamp: row[5] || new Date().toISOString(),
    };
  }

  private notificationToRow(notification: Notification): string[] {
    return [
      notification.notification_id,
      notification.user_id,
      notification.type,
      notification.message,
      notification.read ? 'true' : 'false',
      notification.timestamp,
    ];
  }

  async create(notification: Omit<Notification, 'notification_id' | 'timestamp' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      notification_id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const row = this.notificationToRow(newNotification);
    await sheetsClient.appendRange(`${this.sheetName}!A:F`, [row]);

    return newNotification;
  }

  async readAll(): Promise<Notification[]> {
    const rows = await sheetsClient.readRange(`${this.sheetName}!A2:F`);
    
    return rows
      .map(row => this.rowToNotification(row))
      .filter((notification): notification is Notification => notification !== null);
  }

  async readByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.readAll();
    return notifications.filter(n => n.user_id === userId);
  }

  async readUnreadByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.readByUserId(userId);
    return notifications.filter(n => !n.read);
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notifications = await this.readAll();
    const notificationIndex = notifications.findIndex(n => n.notification_id === notificationId);

    if (notificationIndex === -1) {
      return null;
    }

    const updatedNotification: Notification = {
      ...notifications[notificationIndex],
      read: true,
    };

    const row = this.notificationToRow(updatedNotification);
    await sheetsClient.writeRange(`${this.sheetName}!A${notificationIndex + 2}:F${notificationIndex + 2}`, [row]);

    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const unread = await this.readUnreadByUserId(userId);
    let marked = 0;

    for (const notification of unread) {
      await this.markAsRead(notification.notification_id);
      marked++;
    }

    return marked;
  }
}

export const notificationsService = new NotificationsService();
