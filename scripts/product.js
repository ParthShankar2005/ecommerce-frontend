const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("primary-nav");
const productSearch = document.getElementById("product-search");
const productSearchForm = document.getElementById("product-search-form");

const detailStatus = document.getElementById("detail-status");
const detailBreadcrumbName = document.getElementById("detail-breadcrumb-name");
const detailCategory = document.getElementById("detail-category");
const detailName = document.getElementById("detail-name");
const detailPrice = document.getElementById("detail-price");
const detailTotal = document.getElementById("detail-total");
const detailPriceHint = document.getElementById("detail-price-hint");
const detailDescription = document.getElementById("detail-description");
const detailImageStage = document.getElementById("detail-image-stage");
const detailMainImage = document.getElementById("detail-main-image");
const detailThumbs = document.getElementById("detail-thumbs");

const detailSizeOptions = document.getElementById("detail-size-options");
const detailColorOptions = document.getElementById("detail-color-options");
const detailMaterialOptions = document.getElementById("detail-material-options");

const quantityDecrease = document.getElementById("qty-decrease");
const quantityIncrease = document.getElementById("qty-increase");
const detailQuantity = document.getElementById("detail-quantity");
const detailAddCart = document.getElementById("detail-add-cart");
const detailFeedback = document.getElementById("detail-feedback");

const store = window.EcoCartStore;
const PRODUCT_API_ROOT = "https://fakestoreapi.com/products";
const LOCAL_PRODUCTS_URL = "assets/data/products.json";

const MIN_QTY = 1;
const MAX_QTY = 10;

const FALLBACK_PRODUCTS = [
    {
        id: "local-1",
        title: "Wireless Noise-Canceling Headphones",
        price: 129.0,
        description: "Studio-inspired over-ear headphones with adaptive noise control.",
        category: "Electronics",
        image: "https://picsum.photos/seed/ecocart-headphones-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-headphones-main/900/900",
            "https://picsum.photos/seed/ecocart-headphones-side/900/900",
            "https://picsum.photos/seed/ecocart-headphones-lifestyle/900/900"
        ]
    },
    {
        id: "local-2",
        title: "Smart Fitness Watch",
        price: 89.0,
        description: "Track workouts, sleep, and heart rate with a bright AMOLED display.",
        category: "Electronics",
        image: "https://picsum.photos/seed/ecocart-watch-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-watch-main/900/900",
            "https://picsum.photos/seed/ecocart-watch-angle/900/900",
            "https://picsum.photos/seed/ecocart-watch-run/900/900"
        ]
    },
    {
        id: "local-3",
        title: "Minimalist Travel Backpack",
        price: 64.0,
        description: "Weather-ready backpack with padded laptop sleeve and hidden pockets.",
        category: "Travel",
        image: "https://picsum.photos/seed/ecocart-backpack-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-backpack-main/900/900",
            "https://picsum.photos/seed/ecocart-backpack-open/900/900",
            "https://picsum.photos/seed/ecocart-backpack-outdoor/900/900"
        ]
    },
    {
        id: "local-4",
        title: "Portable Bluetooth Speaker",
        price: 72.0,
        description: "Compact speaker with rich bass, splash protection, and 14-hour battery.",
        category: "Electronics",
        image: "https://picsum.photos/seed/ecocart-speaker-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-speaker-main/900/900",
            "https://picsum.photos/seed/ecocart-speaker-buttons/900/900",
            "https://picsum.photos/seed/ecocart-speaker-outdoor/900/900"
        ]
    },
    {
        id: "local-5",
        title: "Ceramic Pour-Over Coffee Set",
        price: 39.0,
        description: "Elegant brewing set including dripper, server, and filter papers.",
        category: "Home",
        image: "https://picsum.photos/seed/ecocart-coffee-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-coffee-main/900/900",
            "https://picsum.photos/seed/ecocart-coffee-close/900/900",
            "https://picsum.photos/seed/ecocart-coffee-brew/900/900"
        ]
    },
    {
        id: "local-6",
        title: "Lightweight Running Shoes",
        price: 95.0,
        description: "Responsive cushioning and breathable knit upper for everyday runs.",
        category: "Fashion",
        image: "https://picsum.photos/seed/ecocart-shoes-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-shoes-main/900/900",
            "https://picsum.photos/seed/ecocart-shoes-side/900/900",
            "https://picsum.photos/seed/ecocart-shoes-track/900/900"
        ]
    },
    {
        id: "local-7",
        title: "Organic Cotton Hoodie",
        price: 54.0,
        description: "Relaxed-fit hoodie made from organic brushed cotton fleece.",
        category: "Fashion",
        image: "https://picsum.photos/seed/ecocart-hoodie-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-hoodie-main/900/900",
            "https://picsum.photos/seed/ecocart-hoodie-back/900/900",
            "https://picsum.photos/seed/ecocart-hoodie-street/900/900"
        ]
    },
    {
        id: "local-8",
        title: "Glass Desk Lamp",
        price: 47.0,
        description: "Space-saving lamp with warm glow and touch dimmer controls.",
        category: "Home",
        image: "https://picsum.photos/seed/ecocart-lamp-main/480/480",
        images: [
            "https://picsum.photos/seed/ecocart-lamp-main/900/900",
            "https://picsum.photos/seed/ecocart-lamp-glass/900/900",
            "https://picsum.photos/seed/ecocart-lamp-desk/900/900"
        ]
    }
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

const CATEGORY_VARIATIONS = {
    default: {
        size: [
            { value: "Compact", label: "Compact", delta: -4 },
            { value: "Standard", label: "Standard", delta: 0 },
            { value: "Large", label: "Large", delta: 8 }
        ],
        color: [
            { value: "Midnight", label: "Midnight", delta: 0, tone: "rgba(45, 68, 112, 0.22)" },
            { value: "Stone", label: "Stone", delta: 0, tone: "rgba(140, 151, 173, 0.2)" },
            { value: "Sunset", label: "Sunset", delta: 2, tone: "rgba(255, 140, 94, 0.2)" }
        ],
        material: [
            { value: "Core", label: "Core", delta: 0 },
            { value: "Plus", label: "Plus", delta: 6 },
            { value: "Premium", label: "Premium", delta: 14 }
        ]
    },
    electronics: {
        size: [
            { value: "128 GB", label: "128 GB", delta: 0 },
            { value: "256 GB", label: "256 GB", delta: 24 },
            { value: "512 GB", label: "512 GB", delta: 58 }
        ],
        color: [
            { value: "Space Gray", label: "Space Gray", delta: 0, tone: "rgba(72, 84, 109, 0.2)" },
            { value: "Silver", label: "Silver", delta: 0, tone: "rgba(163, 172, 190, 0.2)" },
            { value: "Graphite", label: "Graphite", delta: 5, tone: "rgba(51, 58, 79, 0.22)" }
        ],
        material: [
            { value: "Polycarbonate", label: "Polycarbonate", delta: 0 },
            { value: "Aluminum", label: "Aluminum", delta: 12 },
            { value: "Carbon Fiber", label: "Carbon Fiber", delta: 26 }
        ]
    },
    fashion: {
        size: [
            { value: "S", label: "S", delta: 0 },
            { value: "M", label: "M", delta: 0 },
            { value: "L", label: "L", delta: 4 },
            { value: "XL", label: "XL", delta: 7 }
        ],
        color: [
            { value: "Black", label: "Black", delta: 0, tone: "rgba(41, 41, 52, 0.2)" },
            { value: "Navy", label: "Navy", delta: 0, tone: "rgba(49, 68, 130, 0.2)" },
            { value: "Sage", label: "Sage", delta: 3, tone: "rgba(131, 164, 128, 0.2)" }
        ],
        material: [
            { value: "Cotton Blend", label: "Cotton Blend", delta: 0 },
            { value: "Organic Cotton", label: "Organic Cotton", delta: 9 },
            { value: "Performance Knit", label: "Performance Knit", delta: 15 }
        ]
    }
};

let currentProduct = null;
let currentQuantity = MIN_QTY;
let selectedVariations = {
    size: null,
    color: null,
    material: null
};
let variationOptions = {
    size: [],
    color: [],
    material: []
};
let imageZoomLocked = false;

const variationContainers = {
    size: detailSizeOptions,
    color: detailColorOptions,
    material: detailMaterialOptions
};

const normalizeProduct = (rawProduct, index = 0) => {
    if (store?.normalizeProduct) {
        return store.normalizeProduct(rawProduct, index);
    }

    if (!rawProduct) {
        return null;
    }

    const id = rawProduct.id ?? `item-${index}`;
    const title = String(rawProduct.title ?? "").trim();
    const description = String(rawProduct.description ?? "").trim();
    const category = String(rawProduct.category ?? "General").trim();
    const price = Number(rawProduct.price);
    const images = Array.isArray(rawProduct.images) && rawProduct.images.length
        ? rawProduct.images
        : [String(rawProduct.image ?? "").trim()].filter(Boolean);
    const image = images[0] ?? "";

    if (!title || !Number.isFinite(price) || !image) {
        return null;
    }

    return {
        id,
        title,
        description,
        category,
        price,
        image,
        images
    };
};

const setDetailStatus = (message, isError = false) => {
    if (!detailStatus) {
        return;
    }

    detailStatus.textContent = message;
    detailStatus.classList.toggle("error", isError);
};

const getVariationProfile = (product) => {
    const category = String(product.category ?? "").toLowerCase();

    if (category.includes("electronic")) {
        return CATEGORY_VARIATIONS.electronics;
    }

    if (category.includes("fashion") || category.includes("clothing")) {
        return CATEGORY_VARIATIONS.fashion;
    }

    return CATEGORY_VARIATIONS.default;
};

const isOptionAvailable = (product, type, index) => {
    if (index === 0) {
        return true;
    }

    const seed = String(product.id)
        .split("")
        .reduce((total, char) => total + char.charCodeAt(0), 0);

    return (seed + (index + 1) * (type.length + 3)) % 7 !== 0;
};

const formatDelta = (delta) => {
    if (!delta) {
        return "";
    }

    return delta > 0 ? ` +${currencyFormatter.format(delta)}` : ` ${currencyFormatter.format(delta)}`;
};

const getSelectedOption = (type) => {
    return variationOptions[type].find((option) => option.value === selectedVariations[type]) ?? null;
};

const getVariationDelta = () => {
    return ["size", "color", "material"].reduce((total, type) => {
        const option = getSelectedOption(type);
        return total + (option ? option.delta : 0);
    }, 0);
};

const updatePreviewTint = () => {
    if (!detailImageStage) {
        return;
    }

    const colorOption = getSelectedOption("color");
    const tone = colorOption?.tone ?? "rgba(255, 255, 255, 0)";
    detailImageStage.style.setProperty("--preview-tint", tone);
};

const updatePriceDisplay = () => {
    if (!currentProduct || !detailPrice || !detailTotal) {
        return;
    }

    const variationDelta = getVariationDelta();
    const unitPrice = Math.max(0, currentProduct.price + variationDelta);
    const totalPrice = unitPrice * currentQuantity;

    detailPrice.textContent = `${currencyFormatter.format(unitPrice)} per item`;
    detailTotal.textContent = `Total: ${currencyFormatter.format(totalPrice)}`;

    if (!detailPriceHint) {
        return;
    }

    if (variationDelta > 0) {
        detailPriceHint.textContent = `Selected options add ${currencyFormatter.format(variationDelta)} per item.`;
    } else if (variationDelta < 0) {
        detailPriceHint.textContent = `Selected options save ${currencyFormatter.format(Math.abs(variationDelta))} per item.`;
    } else {
        detailPriceHint.textContent = "Standard pricing applies.";
    }
};

const renderVariationOptions = (type, options) => {
    const container = variationContainers[type];

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const fragment = document.createDocumentFragment();

    options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "variation-chip";
        button.dataset.variationType = type;
        button.dataset.value = option.value;
        button.dataset.available = String(option.available);
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", `${option.label}${formatDelta(option.delta)}`);

        if (!option.available) {
            button.disabled = true;
            button.classList.add("is-unavailable");
            button.title = "Currently unavailable";
        }

        const label = document.createElement("span");
        label.className = "chip-label";
        label.textContent = option.label;

        const delta = document.createElement("span");
        delta.className = "chip-delta";
        delta.textContent = formatDelta(option.delta);

        button.append(label, delta);
        fragment.appendChild(button);
    });

    container.appendChild(fragment);
};

const syncSelectedChipStyles = () => {
    Object.entries(variationContainers).forEach(([type, container]) => {
        if (!container) {
            return;
        }

        container.querySelectorAll(".variation-chip").forEach((chip) => {
            const isSelected = chip.dataset.value === selectedVariations[type];
            chip.classList.toggle("is-selected", isSelected);
            chip.setAttribute("aria-pressed", String(isSelected));
        });
    });
};

const initializeVariationState = (product) => {
    const profile = getVariationProfile(product);

    variationOptions = {
        size: profile.size.map((option, index) => ({
            ...option,
            available: isOptionAvailable(product, "size", index)
        })),
        color: profile.color.map((option, index) => ({
            ...option,
            available: isOptionAvailable(product, "color", index)
        })),
        material: profile.material.map((option, index) => ({
            ...option,
            available: isOptionAvailable(product, "material", index)
        }))
    };

    selectedVariations = {
        size: variationOptions.size.find((option) => option.available)?.value ?? variationOptions.size[0].value,
        color: variationOptions.color.find((option) => option.available)?.value ?? variationOptions.color[0].value,
        material: variationOptions.material.find((option) => option.available)?.value ?? variationOptions.material[0].value
    };

    renderVariationOptions("size", variationOptions.size);
    renderVariationOptions("color", variationOptions.color);
    renderVariationOptions("material", variationOptions.material);
    syncSelectedChipStyles();
    updatePreviewTint();
    updatePriceDisplay();
};

const setActiveImage = (imageUrl, imageIndex) => {
    if (!detailMainImage || !detailThumbs) {
        return;
    }

    detailMainImage.src = imageUrl;
    detailThumbs.querySelectorAll(".detail-thumb").forEach((thumb, index) => {
        thumb.classList.toggle("is-active", index === imageIndex);
    });
};

const renderGallery = (images) => {
    if (!detailMainImage || !detailThumbs) {
        return;
    }

    const imageList = Array.isArray(images) && images.length
        ? images
        : [currentProduct?.image].filter(Boolean);

    if (!imageList.length) {
        return;
    }

    detailThumbs.innerHTML = "";
    detailMainImage.alt = currentProduct?.title ?? "Selected product";
    setActiveImage(imageList[0], 0);

    const fragment = document.createDocumentFragment();

    imageList.forEach((imageUrl, index) => {
        const thumbButton = document.createElement("button");
        thumbButton.type = "button";
        thumbButton.className = "detail-thumb";
        thumbButton.dataset.imageIndex = String(index);
        thumbButton.setAttribute("aria-label", `View product image ${index + 1}`);

        const thumbImage = document.createElement("img");
        thumbImage.src = imageUrl;
        thumbImage.alt = "";
        thumbImage.loading = "lazy";
        thumbImage.decoding = "async";
        thumbImage.width = 180;
        thumbImage.height = 180;

        thumbButton.appendChild(thumbImage);
        fragment.appendChild(thumbButton);
    });

    detailThumbs.appendChild(fragment);
    detailThumbs.querySelector(".detail-thumb")?.classList.add("is-active");
};

const updateFeedback = (message, isVisible = true) => {
    if (!detailFeedback) {
        return;
    }

    detailFeedback.textContent = message;
    detailFeedback.classList.toggle("is-visible", isVisible);
};

const clampQuantity = (value) => {
    const parsed = Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed)) {
        return MIN_QTY;
    }

    return Math.min(MAX_QTY, Math.max(MIN_QTY, parsed));
};

const setQuantity = (nextQuantity) => {
    currentQuantity = clampQuantity(nextQuantity);

    if (detailQuantity) {
        detailQuantity.value = String(currentQuantity);
    }

    if (quantityDecrease) {
        quantityDecrease.disabled = currentQuantity <= MIN_QTY;
    }

    if (quantityIncrease) {
        quantityIncrease.disabled = currentQuantity >= MAX_QTY;
    }

    updatePriceDisplay();
};

const setupQuantityControls = () => {
    quantityDecrease?.addEventListener("click", () => {
        setQuantity(currentQuantity - 1);
    });

    quantityIncrease?.addEventListener("click", () => {
        setQuantity(currentQuantity + 1);
    });

    detailQuantity?.addEventListener("change", () => {
        setQuantity(detailQuantity.value);
    });
};

const setupVariationInteractions = () => {
    Object.entries(variationContainers).forEach(([type, container]) => {
        if (!container) {
            return;
        }

        container.addEventListener("click", (event) => {
            const chip = event.target.closest(".variation-chip");

            if (!chip || chip.disabled) {
                return;
            }

            selectedVariations[type] = chip.dataset.value;
            syncSelectedChipStyles();
            updatePreviewTint();
            updatePriceDisplay();
        });
    });
};

const updateZoomOrigin = (clientX, clientY) => {
    if (!detailImageStage || !detailMainImage) {
        return;
    }

    const bounds = detailImageStage.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width) * 100;
    const y = ((clientY - bounds.top) / bounds.height) * 100;
    detailMainImage.style.transformOrigin = `${x}% ${y}%`;
};

const setupImageZoom = () => {
    if (!detailImageStage || !detailMainImage) {
        return;
    }

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    detailImageStage.addEventListener("mouseenter", () => {
        if (!hasFinePointer || imageZoomLocked) {
            return;
        }

        detailImageStage.classList.add("is-zoomed");
    });

    detailImageStage.addEventListener("mousemove", (event) => {
        if (!hasFinePointer) {
            return;
        }

        updateZoomOrigin(event.clientX, event.clientY);
    });

    detailImageStage.addEventListener("mouseleave", () => {
        if (imageZoomLocked) {
            return;
        }

        detailImageStage.classList.remove("is-zoomed");
        detailMainImage.style.transformOrigin = "50% 50%";
    });

    detailImageStage.addEventListener("click", (event) => {
        if (hasFinePointer) {
            return;
        }

        imageZoomLocked = !imageZoomLocked;
        detailImageStage.classList.toggle("is-zoomed", imageZoomLocked);
        updateZoomOrigin(event.clientX, event.clientY);
    });
};

const renderProduct = (product) => {
    currentProduct = product;

    if (detailBreadcrumbName) {
        detailBreadcrumbName.textContent = product.title;
    }

    if (detailCategory) {
        detailCategory.textContent = product.category || "General";
    }

    if (detailName) {
        detailName.textContent = product.title;
    }

    if (detailDescription) {
        detailDescription.textContent = product.description;
    }

    setQuantity(MIN_QTY);
    initializeVariationState(product);
    renderGallery(product.images);
    setDetailStatus("Product loaded successfully.");
};

const findById = (products, productId) => {
    return products.find((product) => String(product.id) === String(productId)) ?? null;
};

const fetchProductFromApi = async (productId) => {
    if (!/^\d+$/.test(String(productId))) {
        return null;
    }

    const response = await fetch(
        `${PRODUCT_API_ROOT}/${encodeURIComponent(String(productId))}`,
        { cache: "no-store" }
    );

    if (!response.ok) {
        return null;
    }

    const payload = await response.json();
    return normalizeProduct(payload, 0);
};

const fetchProductsFromLocalJson = async () => {
    const response = await fetch(LOCAL_PRODUCTS_URL, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Local JSON request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return payload
        .map((product, index) => normalizeProduct(product, index))
        .filter(Boolean);
};

const setupMobileNavigation = () => {
    if (!menuToggle || !navMenu) {
        return;
    }

    const closeMenu = () => {
        navMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 900) {
                closeMenu();
            }
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
};

const setupSearchForm = () => {
    if (!productSearchForm) {
        return;
    }

    productSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = String(productSearch?.value ?? "").trim();
        const destination = query
            ? `index.html?q=${encodeURIComponent(query)}#products`
            : "index.html#products";
        window.location.href = destination;
    });
};

const setupGalleryInteractions = () => {
    if (!detailThumbs) {
        return;
    }

    detailThumbs.addEventListener("click", (event) => {
        const thumbButton = event.target.closest(".detail-thumb");

        if (!thumbButton || !currentProduct) {
            return;
        }

        const imageIndex = Number.parseInt(thumbButton.dataset.imageIndex ?? "0", 10);
        const imageList = currentProduct.images?.length ? currentProduct.images : [currentProduct.image];
        const nextImage = imageList[imageIndex];

        if (!nextImage) {
            return;
        }

        setActiveImage(nextImage, imageIndex);
    });
};

const setupAddToCart = () => {
    if (!detailAddCart) {
        return;
    }

    detailAddCart.addEventListener("click", () => {
        if (!currentProduct || !store?.addItemToCart) {
            return;
        }

        const selectedSize = selectedVariations.size ?? "";
        const selectedColor = selectedVariations.color ?? "";
        const selectedMaterial = selectedVariations.material ?? "";

        store.addItemToCart(currentProduct, {
            quantity: currentQuantity,
            size: selectedSize,
            color: selectedColor,
            material: selectedMaterial
        });
        store.updateCartBadge(document);

        const optionSummary = [selectedSize, selectedColor, selectedMaterial]
            .filter(Boolean)
            .join(" • ");
        updateFeedback(
            `Added ${currentQuantity} item${currentQuantity > 1 ? "s" : ""}${optionSummary ? ` (${optionSummary})` : ""}.`
        );

        const originalLabel = detailAddCart.textContent;
        detailAddCart.textContent = "Added to Cart";
        detailAddCart.disabled = true;
        detailAddCart.classList.add("is-success");

        window.setTimeout(() => {
            detailAddCart.textContent = originalLabel;
            detailAddCart.disabled = false;
            detailAddCart.classList.remove("is-success");
        }, 900);
    });
};

const loadProductDetails = async () => {
    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
        setDetailStatus("Product ID is missing in the URL.", true);
        detailAddCart?.setAttribute("disabled", "true");
        return;
    }

    let product = store?.findCachedProductById
        ? store.findCachedProductById(productId)
        : null;

    if (!product) {
        product = await fetchProductFromApi(productId);
    }

    if (!product) {
        try {
            const localProducts = await fetchProductsFromLocalJson();
            product = findById(localProducts, productId);
        } catch (error) {
            product = null;
        }
    }

    if (!product) {
        const fallbackProducts = FALLBACK_PRODUCTS
            .map((item, index) => normalizeProduct(item, index))
            .filter(Boolean);
        product = findById(fallbackProducts, productId);
    }

    if (!product) {
        setDetailStatus("Product not found. Please return to the products page.", true);
        detailAddCart?.setAttribute("disabled", "true");
        return;
    }

    renderProduct(product);

    if (store?.saveCatalogCache) {
        const cachedProducts = store.readCatalogCache?.() ?? [];
        const mergedProducts = [...cachedProducts];
        const existingIndex = mergedProducts.findIndex(
            (cachedProduct) => String(cachedProduct.id) === String(product.id)
        );

        if (existingIndex >= 0) {
            mergedProducts[existingIndex] = product;
        } else {
            mergedProducts.push(product);
        }

        store.saveCatalogCache(mergedProducts);
    }
};

if (store?.updateCartBadge) {
    store.updateCartBadge(document);
}

setupMobileNavigation();
setupSearchForm();
setupQuantityControls();
setupVariationInteractions();
setupGalleryInteractions();
setupImageZoom();
setupAddToCart();
loadProductDetails();
