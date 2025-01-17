let refreshing = false;

export async function registerServiceWorker() {
  // Only register service worker in production
  if (import.meta.env.DEV) {
    console.log('Service worker registration skipped in development');
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      console.log('Starting service worker registration process...');

      // First, unregister any existing service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Found existing service workers:', registrations.length);
      
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Unregistered service worker');
      }

      // Register service worker with correct path
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('ServiceWorker registration successful:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        console.log('New service worker update found!');
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          console.log('Service worker state:', newWorker.state);
          if (newWorker.state === 'activated' && !refreshing) {
            refreshing = true;
            // Instead of automatic reload, dispatch an event that the app can handle
            window.dispatchEvent(new CustomEvent('swUpdated'));
          }
        });
      });

    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('Service worker controller changed, update available');
        // Instead of reloading, dispatch an event
        window.dispatchEvent(new CustomEvent('swControllerChange'));
      }
    });

    // Log current controller
    if (navigator.serviceWorker.controller) {
      console.log('Current controller:', navigator.serviceWorker.controller);
    } else {
      console.log('No controller found');
    }
  } else {
    console.log('Service workers are not supported');
  }
}
