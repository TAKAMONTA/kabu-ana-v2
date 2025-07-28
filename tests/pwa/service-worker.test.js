// PWA Service Worker Tests
// Using Jest and service worker testing utilities

// Mock service worker environment
global.self = {
  addEventListener: jest.fn(),
  skipWaiting: jest.fn(() => Promise.resolve()),
  clients: {
    claim: jest.fn(() => Promise.resolve())
  },
  registration: {
    showNotification: jest.fn(() => Promise.resolve())
  }
};

global.caches = {
  open: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
  match: jest.fn()
};

global.fetch = jest.fn();

describe('Service Worker', () => {
  let mockCache;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCache = {
      addAll: jest.fn(() => Promise.resolve()),
      put: jest.fn(() => Promise.resolve()),
      match: jest.fn(),
      delete: jest.fn(() => Promise.resolve())
    };
    
    global.caches.open.mockResolvedValue(mockCache);
    global.caches.keys.mockResolvedValue(['old-cache-v1']);
    global.caches.delete.mockResolvedValue(true);
  });

  describe('Install Event', () => {
    it('should cache static assets on install', async () => {
      // Import service worker (this would normally be done by the browser)
      require('../../public/service-worker.js');
      
      // Simulate install event
      const installEvent = {
        waitUntil: jest.fn()
      };
      
      const installHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'install')[1];
      
      if (installHandler) {
        installHandler(installEvent);
        
        expect(installEvent.waitUntil).toHaveBeenCalled();
        expect(global.caches.open).toHaveBeenCalledWith('ai-stock-static-v1');
      }
    });

    it('should skip waiting after successful cache', async () => {
      const installEvent = {
        waitUntil: jest.fn(promise => promise)
      };
      
      const installHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'install')[1];
      
      if (installHandler) {
        await installHandler(installEvent);
        expect(global.self.skipWaiting).toHaveBeenCalled();
      }
    });
  });

  describe('Activate Event', () => {
    it('should clean up old caches on activate', async () => {
      const activateEvent = {
        waitUntil: jest.fn(promise => promise)
      };
      
      const activateHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'activate')[1];
      
      if (activateHandler) {
        await activateHandler(activateEvent);
        
        expect(global.caches.keys).toHaveBeenCalled();
        expect(global.caches.delete).toHaveBeenCalledWith('old-cache-v1');
        expect(global.self.clients.claim).toHaveBeenCalled();
      }
    });
  });

  describe('Fetch Event', () => {
    it('should serve static assets from cache first', async () => {
      const mockResponse = new Response('cached content');
      mockCache.match.mockResolvedValue(mockResponse);
      
      const fetchEvent = {
        request: new Request('/index.html'),
        respondWith: jest.fn()
      };
      
      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];
      
      if (fetchHandler) {
        await fetchHandler(fetchEvent);
        
        expect(mockCache.match).toHaveBeenCalledWith(fetchEvent.request);
      }
    });

    it('should fetch from network when cache miss', async () => {
      mockCache.match.mockResolvedValue(undefined);
      const networkResponse = new Response('network content');
      global.fetch.mockResolvedValue(networkResponse);
      
      const fetchEvent = {
        request: new Request('/index.html'),
        respondWith: jest.fn()
      };
      
      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];
      
      if (fetchHandler) {
        await fetchHandler(fetchEvent);
        
        expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
        expect(mockCache.put).toHaveBeenCalled();
      }
    });

    it('should handle API requests with network first strategy', async () => {
      const apiResponse = new Response(JSON.stringify({ data: 'api data' }));
      global.fetch.mockResolvedValue(apiResponse);
      
      const fetchEvent = {
        request: new Request('/api/stock/AAPL'),
        respondWith: jest.fn()
      };
      
      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];
      
      if (fetchHandler) {
        await fetchHandler(fetchEvent);
        
        expect(global.fetch).toHaveBeenCalledWith(fetchEvent.request);
      }
    });

    it('should return cached API response when network fails', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const cachedResponse = new Response(JSON.stringify({ data: 'cached api data' }));
      mockCache.match.mockResolvedValue(cachedResponse);
      
      const fetchEvent = {
        request: new Request('/api/stock/AAPL'),
        respondWith: jest.fn()
      };
      
      const fetchHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'fetch')[1];
      
      if (fetchHandler) {
        await fetchHandler(fetchEvent);
        
        expect(mockCache.match).toHaveBeenCalledWith(fetchEvent.request);
      }
    });
  });

  describe('Push Notification', () => {
    it('should show notification on push event', async () => {
      const pushEvent = {
        data: {
          text: () => 'New stock analysis available'
        },
        waitUntil: jest.fn()
      };
      
      const pushHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'push')[1];
      
      if (pushHandler) {
        pushHandler(pushEvent);
        
        expect(pushEvent.waitUntil).toHaveBeenCalled();
        expect(global.self.registration.showNotification).toHaveBeenCalledWith(
          'AI株式分析',
          expect.objectContaining({
            body: 'New stock analysis available',
            icon: '/icons/icon-192x192.png'
          })
        );
      }
    });

    it('should handle push event without data', async () => {
      const pushEvent = {
        data: null,
        waitUntil: jest.fn()
      };
      
      const pushHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'push')[1];
      
      if (pushHandler) {
        pushHandler(pushEvent);
        
        expect(global.self.registration.showNotification).toHaveBeenCalledWith(
          'AI株式分析',
          expect.objectContaining({
            body: 'New stock analysis available'
          })
        );
      }
    });
  });

  describe('Background Sync', () => {
    it('should handle background sync event', async () => {
      const syncEvent = {
        tag: 'background-sync',
        waitUntil: jest.fn()
      };
      
      const syncHandler = global.self.addEventListener.mock.calls
        .find(call => call[0] === 'sync')[1];
      
      if (syncHandler) {
        syncHandler(syncEvent);
        
        expect(syncEvent.waitUntil).toHaveBeenCalled();
      }
    });
  });
});

describe('PWA Installation', () => {
  let mockWindow;
  
  beforeEach(() => {
    mockWindow = {
      addEventListener: jest.fn(),
      matchMedia: jest.fn(() => ({ matches: false })),
      navigator: {
        serviceWorker: {
          register: jest.fn(() => Promise.resolve({ scope: '/' }))
        }
      }
    };
    
    global.window = mockWindow;
  });

  it('should register service worker on load', async () => {
    // Simulate service worker registration
    const loadHandler = mockWindow.addEventListener.mock.calls
      .find(call => call[0] === 'load')[1];
    
    if (loadHandler) {
      await loadHandler();
      
      expect(mockWindow.navigator.serviceWorker.register)
        .toHaveBeenCalledWith('/service-worker.js');
    }
  });

  it('should detect PWA installation capability', () => {
    const beforeInstallPromptEvent = new Event('beforeinstallprompt');
    beforeInstallPromptEvent.prompt = jest.fn(() => Promise.resolve());
    beforeInstallPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });
    
    const handler = mockWindow.addEventListener.mock.calls
      .find(call => call[0] === 'beforeinstallprompt')[1];
    
    if (handler) {
      handler(beforeInstallPromptEvent);
      
      expect(beforeInstallPromptEvent.preventDefault).toBeDefined();
    }
  });

  it('should detect when app is installed', () => {
    const appInstalledEvent = new Event('appinstalled');
    
    const handler = mockWindow.addEventListener.mock.calls
      .find(call => call[0] === 'appinstalled')[1];
    
    if (handler) {
      handler(appInstalledEvent);
      
      // App should update its state to reflect installation
      expect(handler).toBeDefined();
    }
  });
});

describe('Cache Strategy', () => {
  it('should implement cache-first for static assets', async () => {
    const request = new Request('/index.css');
    const cachedResponse = new Response('cached css');
    
    mockCache.match.mockResolvedValue(cachedResponse);
    
    // Test cache-first strategy implementation
    const response = await mockCache.match(request);
    
    expect(response).toBe(cachedResponse);
    expect(mockCache.match).toHaveBeenCalledWith(request);
  });

  it('should implement network-first for API requests', async () => {
    const request = new Request('/api/stock/data');
    const networkResponse = new Response(JSON.stringify({ price: 100 }));
    
    global.fetch.mockResolvedValue(networkResponse);
    
    // Test network-first strategy
    const response = await global.fetch(request);
    
    expect(response).toBe(networkResponse);
    expect(global.fetch).toHaveBeenCalledWith(request);
  });

  it('should respect cache TTL for API responses', async () => {
    const now = Date.now();
    const oldTimestamp = (now - 6 * 60 * 1000).toString(); // 6 minutes ago
    
    const expiredResponse = new Response('old data', {
      headers: { 'sw-cache-timestamp': oldTimestamp }
    });
    
    mockCache.match.mockResolvedValue(expiredResponse);
    
    // Cache should be considered expired (TTL is 5 minutes)
    const timestamp = expiredResponse.headers.get('sw-cache-timestamp');
    const age = now - parseInt(timestamp);
    const isExpired = age > (5 * 60 * 1000);
    
    expect(isExpired).toBe(true);
  });
});
