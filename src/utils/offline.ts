import { useEffect } from 'react';

// Offline detection utility
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const useOfflineDetection = (callback: (isOnline: boolean) => void) => {
  useEffect(() => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [callback]);
};

// Queue for offline operations
class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];

  add(operation: () => Promise<void>) {
    this.queue.push(operation);
    if (isOnline()) {
      this.processQueue();
    }
  }

  async processQueue() {
    while (this.queue.length > 0 && isOnline()) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('Error processing queued operation:', error);
          // Re-add to queue on error
          this.queue.unshift(operation);
          break;
        }
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
