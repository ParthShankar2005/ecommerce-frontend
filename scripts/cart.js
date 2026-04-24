const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("primary-nav");
const cartSearchForm = document.getElementById("cart-search-form");
const productSearch = document.getElementById("product-search");

const cartItemsContainer = document.getElementById("cart-items");
const cartEmptyState = document.getElementById("cart-empty");
const summaryItems = document.getElementById("summary-items");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTax = document.getElementById("summary-tax");
const summaryTotal = document.getElementById("summary-total");
const proceedCheckoutButton = document.getElementById("proceed-checkout");
const cartFeedback = document.getElementById("cart-feedback");

const store = window.EcoCartStore;
const CART_STORAGE_KEY = "ecocart_cart";
const CART_UPDATED_EVENT = "ecocart:cart-updated";
const MAX_QTY = 99;
const TAX_RATE = 0.08;

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

const formatCurrency = (value) => currencyFormatter.format(Math.max(0, value));

const clampQuantity = (value) => {
    const parsed = Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed)) {
        return 1;
    }

    return Math.max(1, Math.min(MAX_QTY, parsed));
};

const buildOptionLabel = (item) => {
    const options = [];

    if (item.selectedSize) {
        options.push(`Size: ${item.selectedSize}`);
    }

    if (item.selectedColor) {
        options.push(`Color: ${item.selectedColor}`);
    }

    if (item.selectedMaterial) {
        options.push(`Material: ${item.selectedMaterial}`);
    }

    return options.length ? options.join(" • ") : "Standard configuration";
};

const createCartItemElement = (item) => {
    const lineTotal = item.price * item.quantity;
    const quantity = clampQuantity(item.quantity);

    const row = document.createElement("li");
    row.className = "cart-item";
    row.dataset.id = String(item.id);
    row.dataset.size = item.selectedSize ?? "";
    row.dataset.color = item.selectedColor ?? "";
    row.dataset.material = item.selectedMaterial ?? "";
    row.dataset.quantity = String(quantity);

    row.innerHTML = `
        <div class="cart-item-media">
            <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async" width="280" height="280">
        </div>
        <div class="cart-item-info">
            <h3>${item.title}</h3>
            <p class="cart-item-options">${buildOptionLabel(item)}</p>
            <p class="cart-item-price">${formatCurrency(item.price)} each</p>
        </div>
        <div class="cart-item-controls">
            <div class="cart-qty" aria-label="Change quantity">
                <button
                    class="cart-qty-btn"
                    type="button"
                    data-action="decrease"
                    aria-label="Decrease quantity"
                    ${quantity <= 1 ? "disabled" : ""}
                >
                    -
                </button>
                <input class="cart-qty-input" type="text" value="${quantity}" aria-label="Quantity" readonly>
                <button
                    class="cart-qty-btn"
                    type="button"
                    data-action="increase"
                    aria-label="Increase quantity"
                    ${quantity >= MAX_QTY ? "disabled" : ""}
                >
                    +
                </button>
            </div>
            <p class="cart-line-total">${formatCurrency(lineTotal)}</p>
            <button class="cart-remove" type="button" data-action="remove">Remove</button>
        </div>
    `;

    return row;
};

const updateSummary = (items) => {
    const itemCount = items.reduce((total, item) => total + clampQuantity(item.quantity), 0);
    const subtotal = items.reduce((total, item) => total + item.price * clampQuantity(item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    if (summaryItems) {
        summaryItems.textContent = String(itemCount);
    }

    if (summarySubtotal) {
        summarySubtotal.textContent = formatCurrency(subtotal);
    }

    if (summaryTax) {
        summaryTax.textContent = formatCurrency(tax);
    }

    if (summaryTotal) {
        summaryTotal.textContent = formatCurrency(total);
    }
};

const showFeedback = (message) => {
    if (!cartFeedback) {
        return;
    }

    cartFeedback.textContent = message;
    cartFeedback.classList.add("is-visible");

    window.setTimeout(() => {
        cartFeedback.classList.remove("is-visible");
    }, 900);
};

const renderCart = () => {
    const items = store?.readCart ? store.readCart() : [];

    if (!cartItemsContainer) {
        return;
    }

    cartItemsContainer.innerHTML = "";

    if (!items.length) {
        if (cartEmptyState) {
            cartEmptyState.hidden = false;
        }

        if (proceedCheckoutButton) {
            proceedCheckoutButton.disabled = true;
        }

        updateSummary([]);
        return;
    }

    if (cartEmptyState) {
        cartEmptyState.hidden = true;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(createCartItemElement(item)));
    cartItemsContainer.appendChild(fragment);
    updateSummary(items);

    if (proceedCheckoutButton) {
        proceedCheckoutButton.disabled = false;
    }
};

const toCartTarget = (row) => {
    return {
        id: row.dataset.id,
        size: row.dataset.size,
        color: row.dataset.color,
        material: row.dataset.material
    };
};

const updateItemQuantity = (row, nextQuantity) => {
    if (!store?.setItemQuantity) {
        return;
    }

    const target = toCartTarget(row);
    store.setItemQuantity(target, clampQuantity(nextQuantity));
    renderCart();
};

const handleCartActions = () => {
    if (!cartItemsContainer) {
        return;
    }

    cartItemsContainer.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) {
            return;
        }

        const row = actionButton.closest(".cart-item");

        if (!row) {
            return;
        }

        const action = actionButton.dataset.action;
        const currentQuantity = clampQuantity(row.dataset.quantity);

        if (action === "decrease") {
            if (currentQuantity <= 1) {
                showFeedback("Quantity cannot be less than 1.");
                return;
            }

            updateItemQuantity(row, currentQuantity - 1);
            showFeedback("Item quantity updated.");
            return;
        }

        if (action === "increase") {
            if (currentQuantity >= MAX_QTY) {
                showFeedback(`Maximum quantity is ${MAX_QTY}.`);
                return;
            }

            updateItemQuantity(row, currentQuantity + 1);
            showFeedback("Item quantity updated.");
            return;
        }

        if (action === "remove" && store?.removeItemFromCart) {
            const target = toCartTarget(row);
            store.removeItemFromCart(target);
            renderCart();
            showFeedback("Item removed from cart.");
        }
    });
};

const setupSearchForm = () => {
    if (!cartSearchForm) {
        return;
    }

    cartSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = String(productSearch?.value ?? "").trim();
        const destination = query
            ? `index.html?q=${encodeURIComponent(query)}#products`
            : "index.html#products";
        window.location.href = destination;
    });
};

const setupProceedToCheckout = () => {
    if (!proceedCheckoutButton) {
        return;
    }

    proceedCheckoutButton.addEventListener("click", () => {
        if (proceedCheckoutButton.disabled) {
            return;
        }

        window.location.href = "checkout.html";
    });
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

const setupCartSync = () => {
    if (store?.bindCartBadge) {
        store.bindCartBadge(document);
    } else if (store?.updateCartBadge) {
        store.updateCartBadge(document);
    }

    window.addEventListener(CART_UPDATED_EVENT, renderCart);
    window.addEventListener("storage", (event) => {
        if (!event || event.key === CART_STORAGE_KEY) {
            renderCart();
        }
    });
};

setupMobileNavigation();
setupSearchForm();
setupProceedToCheckout();
handleCartActions();
setupCartSync();
renderCart();
