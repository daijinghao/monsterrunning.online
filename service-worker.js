/**
 * Monster Running - Service Worker
 * 
 * This Service Worker provides offline capabilities and performance optimizations through caching.
 */

// Cache name - update version when content changes
const CACHE_NAME = 'monster-running-cache-v1';

// Resources to pre-cache
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
  '/images/favicon.png',
  // Add more core assets here
];

// Assets that should be cached when visited
const DYNAMIC_CACHE_RESOURCES = [
  '/css/',
  '/js/',
  '/images/',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
];

// Install event - pre-cache core assets
self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  // Claim clients to ensure that this service worker controls all pages within scope
  event.waitUntil(clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }
  
  // For HTML requests - network first, cache as fallback
  if (event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response clone
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache and network fails, return offline fallback
            return caches.match('/offline.html') || new Response('You are offline');
          });
        })
    );
    return;
  }
  
  // For assets that should be dynamically cached
  const shouldCache = DYNAMIC_CACHE_RESOURCES.some(resource => 
    event.request.url.includes(resource)
  );
  
  if (shouldCache) {
    // Cache-first strategy for assets
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Cache the response if valid
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // For all other resources - network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache errored responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New content available!',
      icon: data.icon || '/images/favicon.png',
      badge: data.badge || '/images/badge.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Monster Running Update', 
        options
      )
    );
  } catch (error) {
    console.error('Push notification error:', error);
    
    // Fallback for simple text
    event.waitUntil(
      self.registration.showNotification('Monster Running Update', {
        body: event.data.text(),
        icon: '/images/favicon.png'
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        // Check if there is already a window focused
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  }
});

// Function to sync likes when back online
async function syncLikes() {
  try {
    // Get pending likes from IndexedDB
    const db = await openLikesDatabase();
    const pendingLikes = await getAllPendingLikes(db);
    
    // Process each pending like
    for (const like of pendingLikes) {
      try {
        // Send to server
        await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(like)
        });
        
        // Remove from pending if successful
        await removePendingLike(db, like.id);
      } catch (error) {
        console.error('Failed to sync like:', error);
        // Keep in pending for next sync attempt
      }
    }
  } catch (error) {
    console.error('Sync likes error:', error);
  }
}

// IndexedDB functions for offline likes storage
function openLikesDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('monster-running-likes', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-likes')) {
        db.createObjectStore('pending-likes', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function getAllPendingLikes(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-likes'], 'readonly');
    const store = transaction.objectStore('pending-likes');
    const request = store.getAll();
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function removePendingLike(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-likes'], 'readwrite');
    const store = transaction.objectStore('pending-likes');
    const request = store.delete(id);
    
    request.onsuccess = event => resolve();
    request.onerror = event => reject(event.target.error);
  });
} 