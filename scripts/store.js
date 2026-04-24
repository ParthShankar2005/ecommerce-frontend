(function () {
    "use strict";

    const CART_STORAGE_KEY = "ecocart_cart";
    const CATALOG_CACHE_KEY = "ecocart_catalog_cache";
    const CART_UPDATED_EVENT = "ecocart:cart-updated";

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

    const emitCartUpdated = () => {
        try {
            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, {
                detail: { count: getCartCount() }
            }));
        } catch (error) {
            // Ignore event dispatch failures in unsupported environments.
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

        if (!Array.isArray(cartItems)) {
            return [];
        }

        return cartItems
            .map((item) => {
                if (!item || typeof item !== "object") {
                    return null;
                }

                const id = item.id;
                const title = String(item.title ?? "").trim();
                const image = String(item.image ?? "").trim();
                const price = Number(item.price);
                const quantity = Math.max(1, Number.parseInt(item.quantity ?? 1, 10) || 1);

                if (!String(id).trim() || !title || !image || !Number.isFinite(price)) {
                    return null;
                }

                return {
                    id,
                    title,
                    image,
                    price,
                    quantity,
                    selectedSize: String(item.selectedSize ?? "").trim(),
                    selectedColor: String(item.selectedColor ?? "").trim(),
                    selectedMaterial: String(item.selectedMaterial ?? "").trim()
                };
            })
            .filter(Boolean);
    };

    const writeCart = (cartItems) => {
        const normalizedItems = Array.isArray(cartItems) ? cartItems : [];
        safeWriteStorage(CART_STORAGE_KEY, normalizedItems);
        emitCartUpdated();
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
        const unitPrice = Number(options.unitPrice);
        const resolvedPrice = Number.isFinite(unitPrice)
            ? Math.max(0, unitPrice)
            : normalizedProduct.price;
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
            existingItem.price = resolvedPrice;
        } else {
            cartItems.push({
                id: normalizedProduct.id,
                title: normalizedProduct.title,
                price: resolvedPrice,
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

    const findCartItemIndex = (items, target = {}) => {
        return items.findIndex((item) => {
            return (
                String(item.id) === String(target.id) &&
                String(item.selectedSize ?? "") === String(target.size ?? "").trim() &&
                String(item.selectedColor ?? "") === String(target.color ?? "").trim() &&
                String(item.selectedMaterial ?? "") === String(target.material ?? "").trim()
            );
        });
    };

    const setItemQuantity = (target, quantity) => {
        const cartItems = readCart();
        const itemIndex = findCartItemIndex(cartItems, target);

        if (itemIndex < 0) {
            return getCartCount();
        }

        const nextQuantity = Number.parseInt(quantity, 10);

        if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
            cartItems.splice(itemIndex, 1);
        } else {
            cartItems[itemIndex].quantity = Math.max(1, nextQuantity);
        }

        writeCart(cartItems);
        return getCartCount();
    };

    const removeItemFromCart = (target) => {
        return setItemQuantity(target, 0);
    };

    const clearCart = () => {
        writeCart([]);
        return 0;
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

    const bindCartBadge = (root = document) => {
        const refresh = () => updateCartBadge(root);
        const onStorage = (event) => {
            if (!event || event.key === CART_STORAGE_KEY) {
                refresh();
            }
        };

        refresh();
        window.addEventListener("storage", onStorage);
        window.addEventListener(CART_UPDATED_EVENT, refresh);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener(CART_UPDATED_EVENT, refresh);
        };
    };

    window.EcoCartStore = {
        normalizeProduct,
        readCart,
        writeCart,
        getCartCount,
        addItemToCart,
        setItemQuantity,
        removeItemFromCart,
        clearCart,
        updateCartBadge,
        bindCartBadge,
        saveCatalogCache,
        readCatalogCache,
        findCachedProductById
    };
})();
