const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("primary-nav");
const productGrid = document.getElementById("product-grid");
const productsStatus = document.getElementById("products-status");
const productSearch = document.getElementById("product-search");

const PRODUCT_API_URL = "https://fakestoreapi.com/products?limit=8";
const store = window.EcoCartStore;

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

let allProducts = [];

const normalizeProduct = (rawProduct, index) => {
    if (store?.normalizeProduct) {
        return store.normalizeProduct(rawProduct, index);
    }

    if (!rawProduct) {
        return null;
    }

    const id = rawProduct.id ?? `item-${index}`;
    const title = String(rawProduct.title ?? "").trim();
    const price = Number(rawProduct.price);
    const image = String(rawProduct.image ?? "").trim();

    if (!title || !Number.isFinite(price) || !image) {
        return null;
    }

    return {
        id,
        title,
        price,
        image,
        description: String(rawProduct.description ?? ""),
        category: String(rawProduct.category ?? "General"),
        images: Array.isArray(rawProduct.images) && rawProduct.images.length
            ? rawProduct.images
            : [image]
    };
};

const setProductsStatus = (message, isError = false) => {
    if (!productsStatus) {
        return;
    }

    productsStatus.textContent = message;
    productsStatus.classList.toggle("error", isError);
};

const createProductCard = (product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = String(product.id);

    const productLink = document.createElement("a");
    productLink.className = "product-link";
    productLink.href = `product.html?id=${encodeURIComponent(String(product.id))}`;
    productLink.setAttribute("aria-label", `View details for ${product.title}`);

    const media = document.createElement("figure");
    media.className = "product-media";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 480;
    image.height = 480;
    media.appendChild(image);

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    const meta = document.createElement("div");
    meta.className = "product-meta";

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = currencyFormatter.format(product.price);

    const addToCartButton = document.createElement("button");
    addToCartButton.type = "button";
    addToCartButton.className = "add-cart";
    addToCartButton.textContent = "Add to Cart";
    addToCartButton.setAttribute("aria-label", `Add ${product.title} to cart`);

    productLink.append(media, title);
    meta.append(price, addToCartButton);
    card.append(productLink, meta);

    return card;
};

const renderProducts = (products, statusMessage, isError = false) => {
    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = "";

    if (!products.length) {
        setProductsStatus("No products are available right now.", true);
        return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
        fragment.appendChild(createProductCard(product));
    });

    productGrid.appendChild(fragment);
    setProductsStatus(statusMessage ?? `Showing ${products.length} products.`, isError);
};

const getProductsFromApi = async () => {
    const response = await fetch(PRODUCT_API_URL, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const products = payload
        .map((item, index) => normalizeProduct(item, index))
        .filter(Boolean);

    if (!products.length) {
        throw new Error("API payload did not include valid products.");
    }

    return products;
};

const getProductsFromLocalJson = async () => {
    const response = await fetch("assets/data/products.json", { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Local JSON request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const products = payload
        .map((item, index) => normalizeProduct(item, index))
        .filter(Boolean);

    if (!products.length) {
        throw new Error("Local JSON did not include valid products.");
    }

    return products;
};

const applySearchFilter = () => {
    const query = String(productSearch?.value ?? "").trim().toLowerCase();

    if (!query) {
        renderProducts(allProducts, `Showing ${allProducts.length} products.`);
        return;
    }

    const filteredProducts = allProducts.filter((product) =>
        product.title.toLowerCase().includes(query)
    );

    renderProducts(
        filteredProducts,
        filteredProducts.length
            ? `Showing ${filteredProducts.length} result(s) for "${query}".`
            : `No products found for "${query}".`,
        !filteredProducts.length
    );
};

const initializeProductGrid = async () => {
    if (!productGrid) {
        return;
    }

    setProductsStatus("Loading products...");

    try {
        allProducts = await getProductsFromApi();
        renderProducts(allProducts, "Live products loaded from API.");
    } catch (apiError) {
        try {
            allProducts = await getProductsFromLocalJson();
            renderProducts(allProducts, "Products loaded from local catalog.");
        } catch (localJsonError) {
            allProducts = FALLBACK_PRODUCTS
                .map((product, index) => normalizeProduct(product, index))
                .filter(Boolean);
            renderProducts(allProducts, "Using fallback products due to a loading issue.");
        }
    }

    if (store?.saveCatalogCache) {
        store.saveCatalogCache(allProducts);
    }

    const queryParam = new URLSearchParams(window.location.search).get("q");

    if (queryParam && productSearch) {
        productSearch.value = queryParam;
        applySearchFilter();
    }
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

const setupSearchInput = () => {
    if (!productSearch) {
        return;
    }

    productSearch.addEventListener("input", applySearchFilter);

    const searchForm = productSearch.closest("form");

    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            applySearchFilter();
        });
    }
};

const setupCartButtons = () => {
    if (!productGrid) {
        return;
    }

    productGrid.addEventListener("click", (event) => {
        const addToCartButton = event.target.closest(".add-cart");

        if (!addToCartButton) {
            return;
        }

        const card = addToCartButton.closest(".product-card");
        const productId = card?.dataset.productId;
        const selectedProduct = allProducts.find(
            (product) => String(product.id) === String(productId)
        );

        if (!selectedProduct || !store?.addItemToCart) {
            return;
        }

        store.addItemToCart(selectedProduct, { quantity: 1 });
        store.updateCartBadge(document);

        const originalLabel = addToCartButton.textContent;
        addToCartButton.textContent = "Added";
        addToCartButton.disabled = true;

        window.setTimeout(() => {
            addToCartButton.textContent = originalLabel;
            addToCartButton.disabled = false;
        }, 800);
    });
};

if (store?.bindCartBadge) {
    store.bindCartBadge(document);
} else if (store?.updateCartBadge) {
    store.updateCartBadge(document);
}

setupMobileNavigation();
setupSearchInput();
setupCartButtons();
initializeProductGrid();

console.log("E-Commerce Website Loaded");
