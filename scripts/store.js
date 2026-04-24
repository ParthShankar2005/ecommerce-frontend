(function () {
    "use strict";

    const CART_STORAGE_KEY = "ecocart_cart";
    const CATALOG_CACHE_KEY = "ecocart_catalog_cache";

    const safeParseJson = (value, fallbackValue) => {
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallbackValue;
        }
    };

    const safeReadStorage = (key, fallbackValue) => {
        try {
            const rawValue = window.localStorage.getItem(key);

            if (rawValue === null) {
                return fallbackValue;
            }

            return safeParseJson(rawValue, fallbackValue);
        } catch (error) {
            return fallbackValue;
        }
    };

    const safeWriteStorage = (key, value) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    };

    const normalizeImages = (rawProduct) => {
        const imageList = Array.isArray(rawProduct?.images)
            ? rawProduct.images.filter((entry) => typeof entry === "string" && entry.trim())
            : [];

        if (imageList.length) {
            return imageList;
        }

        const mainImage = String(rawProduct?.image ?? "").trim();
        return mainImage ? [mainImage] : [];
    };

    const normalizeProduct = (rawProduct, index = 0) => {
        if (!rawProduct) {
            return null;
        }

        const id = rawProduct.id ?? `item-${index}`;
        const title = String(rawProduct.title ?? "").trim();
        const description = String(rawProduct.description ?? "").trim();
        const category = String(rawProduct.category ?? "General").trim();
        const price = Number(rawProduct.price);
        const images = normalizeImages(rawProduct);
        const image = images[0] ?? "";

        if (!title || !Number.isFinite(price) || !image) {
            return null;
        }

        return {
            id,
            title,
            description: description || "Product details are currently unavailable.",
            category,
            price,
            image,
            images
        };
    };

    const readCart = () => {
        const cartItems = safeReadStorage(CART_STORAGE_KEY, []);
        return Array.isArray(cartItems) ? cartItems : [];
    };

    const writeCart = (cartItems) => {
        const normalizedItems = Array.isArray(cartItems) ? cartItems : [];
        safeWriteStorage(CART_STORAGE_KEY, normalizedItems);
    };

    const getCartCount = () => {
        return readCart().reduce((total, item) => {
            const quantity = Number(item?.quantity);
            return total + (Number.isFinite(quantity) ? Math.max(0, quantity) : 0);
        }, 0);
    };

    const addItemToCart = (product, options = {}) => {
        const normalizedProduct = normalizeProduct(product);

        if (!normalizedProduct) {
            return getCartCount();
        }

        const quantity = Math.max(1, Number.parseInt(options.quantity ?? 1, 10) || 1);
        const selectedSize = String(options.size ?? "").trim();
        const selectedColor = String(options.color ?? "").trim();
        const selectedMaterial = String(options.material ?? "").trim();
        const cartItems = readCart();

        const existingItem = cartItems.find((item) => {
            return (
                String(item.id) === String(normalizedProduct.id) &&
                String(item.selectedSize ?? "") === selectedSize &&
                String(item.selectedColor ?? "") === selectedColor &&
                String(item.selectedMaterial ?? "") === selectedMaterial
            );
        });

        if (existingItem) {
            existingItem.quantity = Math.max(
                1,
                Number.parseInt(existingItem.quantity ?? 1, 10) + quantity
            );
        } else {
            cartItems.push({
                id: normalizedProduct.id,
                title: normalizedProduct.title,
                price: normalizedProduct.price,
                image: normalizedProduct.image,
                quantity,
                selectedSize,
                selectedColor,
                selectedMaterial
            });
        }

        writeCart(cartItems);
        return getCartCount();
    };

    const updateCartBadge = (root = document) => {
        const count = getCartCount();
        const itemWord = count === 1 ? "item" : "items";

        root.querySelectorAll(".cart-count").forEach((countNode) => {
            countNode.textContent = String(count);
            countNode.classList.remove("is-bump");

            // Trigger a tiny pulse each time the count changes.
            void countNode.offsetWidth;
            countNode.classList.add("is-bump");

            window.setTimeout(() => {
                countNode.classList.remove("is-bump");
            }, 260);
        });

        root.querySelectorAll(".cart-button").forEach((buttonNode) => {
            buttonNode.setAttribute("aria-label", `Shopping cart with ${count} ${itemWord}`);
        });
    };

    const saveCatalogCache = (products) => {
        const productList = Array.isArray(products) ? products : [];
        const normalizedProducts = productList
            .map((product, index) => normalizeProduct(product, index))
            .filter(Boolean);

        safeWriteStorage(CATALOG_CACHE_KEY, normalizedProducts);
    };

    const readCatalogCache = () => {
        const cachedProducts = safeReadStorage(CATALOG_CACHE_KEY, []);

        if (!Array.isArray(cachedProducts)) {
            return [];
        }

        return cachedProducts
            .map((product, index) => normalizeProduct(product, index))
            .filter(Boolean);
    };

    const findCachedProductById = (id) => {
        return readCatalogCache().find((product) => String(product.id) === String(id)) ?? null;
    };

    window.EcoCartStore = {
        normalizeProduct,
        readCart,
        writeCart,
        getCartCount,
        addItemToCart,
        updateCartBadge,
        saveCatalogCache,
        readCatalogCache,
        findCachedProductById
    };
})();
