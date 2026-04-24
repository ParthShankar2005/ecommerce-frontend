const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("primary-nav");
const productGrid = document.getElementById("product-grid");
const productsStatus = document.getElementById("products-status");
const cartButton = document.querySelector(".cart-button");
const cartCountElement = document.querySelector(".cart-count");
const productSearch = document.getElementById("product-search");

const PRODUCT_API_URL = "https://fakestoreapi.com/products?limit=8";
const FALLBACK_PRODUCTS = [
    {
        id: "local-1",
        title: "Wireless Noise-Canceling Headphones",
        price: 129.0,
        image: "https://picsum.photos/seed/ecocart-headphones/480/480"
    },
    {
        id: "local-2",
        title: "Smart Fitness Watch",
        price: 89.0,
        image: "https://picsum.photos/seed/ecocart-watch/480/480"
    },
    {
        id: "local-3",
        title: "Minimalist Travel Backpack",
        price: 64.0,
        image: "https://picsum.photos/seed/ecocart-backpack/480/480"
    },
    {
        id: "local-4",
        title: "Portable Bluetooth Speaker",
        price: 72.0,
        image: "https://picsum.photos/seed/ecocart-speaker/480/480"
    },
    {
        id: "local-5",
        title: "Ceramic Pour-Over Coffee Set",
        price: 39.0,
        image: "https://picsum.photos/seed/ecocart-coffee/480/480"
    },
    {
        id: "local-6",
        title: "Lightweight Running Shoes",
        price: 95.0,
        image: "https://picsum.photos/seed/ecocart-shoes/480/480"
    },
    {
        id: "local-7",
        title: "Organic Cotton Hoodie",
        price: 54.0,
        image: "https://picsum.photos/seed/ecocart-hoodie/480/480"
    },
    {
        id: "local-8",
        title: "Glass Desk Lamp",
        price: 47.0,
        image: "https://picsum.photos/seed/ecocart-lamp/480/480"
    }
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

let allProducts = [];
let cartCount = Number.parseInt(cartCountElement?.textContent ?? "0", 10);

if (Number.isNaN(cartCount)) {
    cartCount = 0;
}

const updateCartCount = (nextCount) => {
    cartCount = Math.max(0, nextCount);

    if (cartCountElement) {
        cartCountElement.textContent = String(cartCount);
    }

    if (cartButton) {
        const itemText = cartCount === 1 ? "item" : "items";
        cartButton.setAttribute("aria-label", `Shopping cart with ${cartCount} ${itemText}`);
    }
};

const setProductsStatus = (message, isError = false) => {
    if (!productsStatus) {
        return;
    }

    productsStatus.textContent = message;
    productsStatus.classList.toggle("error", isError);
};

const toProductModel = (rawProduct, index) => {
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
        image
    };
};

const createProductCard = (product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = String(product.id);

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

    meta.append(price, addToCartButton);
    card.append(media, title, meta);

    return card;
};

const renderProducts = (products, statusMessage) => {
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
    setProductsStatus(statusMessage ?? `Showing ${products.length} products.`);
};

const getProductsFromApi = async () => {
    const response = await fetch(PRODUCT_API_URL, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const products = payload
        .map((item, index) => toProductModel(item, index))
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
        .map((item, index) => toProductModel(item, index))
        .filter(Boolean);

    if (!products.length) {
        throw new Error("Local JSON did not include valid products.");
    }

    return products;
};

const applySearchFilter = () => {
    const query = String(productSearch?.value ?? "").trim().toLowerCase();

    if (!query) {
        renderProducts(allProducts);
        return;
    }

    const filteredProducts = allProducts.filter((product) =>
        product.title.toLowerCase().includes(query)
    );

    renderProducts(
        filteredProducts,
        filteredProducts.length
            ? `Showing ${filteredProducts.length} result(s) for "${query}".`
            : `No products found for "${query}".`
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
            allProducts = FALLBACK_PRODUCTS;
            renderProducts(allProducts, "Using fallback products due to a loading issue.");
        }
    }

    if (productSearch) {
        productSearch.addEventListener("input", applySearchFilter);
    }
};

if (menuToggle && navMenu) {
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
}

if (productGrid) {
    productGrid.addEventListener("click", (event) => {
        const addToCartButton = event.target.closest(".add-cart");

        if (!addToCartButton) {
            return;
        }

        updateCartCount(cartCount + 1);
        const originalLabel = addToCartButton.textContent;

        addToCartButton.textContent = "Added";
        addToCartButton.disabled = true;

        window.setTimeout(() => {
            addToCartButton.textContent = originalLabel;
            addToCartButton.disabled = false;
        }, 800);
    });
}

updateCartCount(cartCount);
initializeProductGrid();

console.log("E-Commerce Website Loaded");
