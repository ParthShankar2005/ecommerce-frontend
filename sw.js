const STATIC_CACHE = "ecocart-static-v2";
const RUNTIME_CACHE = "ecocart-runtime-v2";
const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_PATH = SCOPE_URL.pathname.endsWith("/")
    ? SCOPE_URL.pathname
    : `${SCOPE_URL.pathname}/`;

const STATIC_ASSETS = [
    "./",
    "index.html",
    "product.html",
    "cart.html",
    "checkout.html",
    "login.html",
    "signup.html",
    "styles/main.css",
    "assets/data/products.json",
    "scripts/store.js",
    "scripts/app.js",
    "scripts/product.js",
    "scripts/cart.js",
    "scripts/checkout.js",
    "scripts/auth.js",
    "scripts/auth-ui.js",
    "scripts/auth-ui-lazy.js",
    "scripts/image-optimizer.js",
    "scripts/sw-register.js",
    "scripts/firebase-auth.js",
    "scripts/firebase-config.js"
];

const asRequestUrl = (path) => {
    return new URL(path, self.registration.scope).toString();
};

const toScopeRelativePath = (pathname) => {
    if (SCOPE_PATH === "/") {
        return pathname;
    }

    if (!pathname.startsWith(SCOPE_PATH)) {
        return pathname;
    }

    const scoped = pathname.slice(SCOPE_PATH.length);
    return `/${scoped}`;
};

const shouldHandleAsStatic = (requestUrl) => {
    const path = toScopeRelativePath(requestUrl.pathname);

    return (
        path.endsWith(".css") ||
        path.endsWith(".js") ||
        path.endsWith(".json") ||
        path.endsWith(".svg") ||
        path.endsWith(".png") ||
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".webp") ||
        path.startsWith("/assets/")
    );
};

const shouldUseRuntimeImageCache = (requestUrl) => {
    const host = requestUrl.hostname;
    return host.includes("picsum.photos") || host.includes("fakestoreapi.com");
};

const cleanupOldCaches = async () => {
    const keep = new Set([STATIC_CACHE, RUNTIME_CACHE]);
    const cacheNames = await caches.keys();

    await Promise.all(
        cacheNames.map((cacheName) => {
            if (keep.has(cacheName)) {
                return Promise.resolve();
            }

            return caches.delete(cacheName);
        })
    );
};

const networkFirst = async (request, cacheName, options = {}) => {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request, {
            ignoreSearch: options.ignoreSearch === true
        });
        return cachedResponse || Response.error();
    }
};

const staleWhileRevalidate = async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const networkPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }

            return networkResponse;
        })
        .catch(() => null);

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse = await networkPromise;
    return networkResponse || Response.error();
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS.map((path) => asRequestUrl(path))))
            .catch(() => null)
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(cleanupOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request, STATIC_CACHE, { ignoreSearch: true }));
        return;
    }

    if (isSameOrigin && shouldHandleAsStatic(requestUrl)) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    if (shouldUseRuntimeImageCache(requestUrl)) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    }
});
