import { registerSW } from 'virtual:pwa-register';

// PWA utility functions
export const registerServiceWorker = () => {
  return registerSW({
    immediate: true,
    onNeedRefresh() {
      if (confirm('New version available! Reload to update?')) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log('App is ready to work offline.');
    },
  });
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const showInstallPrompt = () => {
  // This will be handled by the browser's install prompt
  // The beforeinstallprompt event should be captured in the app
};
