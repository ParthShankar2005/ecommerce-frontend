const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("primary-nav");
const authSearchForm = document.getElementById("auth-search-form");
const productSearch = document.getElementById("product-search");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authFeedback = document.getElementById("auth-feedback");
const forgotPasswordLink = document.getElementById("forgot-password-link");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupConfirmPassword = document.getElementById("signup-confirm-password");
const passwordStrengthBar = document.getElementById("password-strength-bar");
const passwordStrengthText = document.getElementById("password-strength-text");

const store = window.EcoCartStore;
const firebaseAuth = window.EcoFirebaseAuth;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULE_MESSAGE =
    "Password must be at least 8 characters and include uppercase, lowercase, and a number.";

const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

const sanitizeRedirect = (value) => {
    const raw = String(value ?? "").trim();

    if (!raw) {
        return "index.html#home";
    }

    if (/^(https?:)?\/\//i.test(raw)) {
        return "index.html#home";
    }

    if (/^[a-z]+:/i.test(raw)) {
        return "index.html#home";
    }

    return raw.startsWith("/") ? raw.slice(1) : raw;
};

const setError = (errorElementId, message) => {
    const node = document.getElementById(errorElementId);

    if (!node) {
        return;
    }

    node.textContent = message;
    node.classList.toggle("is-visible", Boolean(message));
};

const setFeedback = (message, isError = false) => {
    if (!authFeedback) {
        return;
    }

    authFeedback.textContent = message;
    authFeedback.classList.toggle("is-visible", Boolean(message));
    authFeedback.classList.toggle("is-error", isError);
};

const isPasswordValid = (password) => {
    const value = String(password ?? "");
    const hasLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasLength && hasUppercase && hasLowercase && hasNumber;
};

const getPasswordStrength = (password) => {
    const value = String(password ?? "");

    if (!value) {
        return { level: 0, text: "Use 8+ characters, uppercase, lowercase, and a number." };
    }

    const checks = [
        value.length >= 8,
        /[A-Z]/.test(value),
        /[a-z]/.test(value),
        /\d/.test(value),
        /[^A-Za-z0-9]/.test(value),
        value.length >= 12
    ];

    const score = checks.reduce((total, passed) => total + (passed ? 1 : 0), 0);

    if (score <= 2) {
        return { level: 1, text: "Weak password" };
    }

    if (score <= 4) {
        return { level: 2, text: "Medium password" };
    }

    if (score === 5) {
        return { level: 3, text: "Strong password" };
    }

    return { level: 4, text: "Very strong password" };
};

const updateStrengthIndicator = (password) => {
    if (!passwordStrengthBar || !passwordStrengthText) {
        return;
    }

    const strength = getPasswordStrength(password);
    passwordStrengthBar.dataset.level = String(strength.level);
    passwordStrengthText.textContent = strength.text;
};

const getAuthErrorMessage = (error) => {
    if (firebaseAuth?.getErrorMessage) {
        return firebaseAuth.getErrorMessage(error);
    }

    return "Authentication failed. Please try again.";
};

const ensureFirebaseReady = async () => {
    if (!firebaseAuth?.initialize) {
        setFeedback("Firebase SDK is missing on this page.", true);
        return false;
    }

    await firebaseAuth.initialize();

    if (!firebaseAuth.isConfigured()) {
        setFeedback(
            "Firebase is not configured. Add your keys in scripts/firebase-config.js.",
            true
        );
        return false;
    }

    return true;
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
    if (!authSearchForm) {
        return;
    }

    authSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = String(productSearch?.value ?? "").trim();
        const destination = query
            ? `index.html?q=${encodeURIComponent(query)}#products`
            : "index.html#products";
        window.location.href = destination;
    });
};

const setupPasswordToggles = () => {
    document.querySelectorAll(".password-toggle[data-target]").forEach((toggleButton) => {
        const inputId = toggleButton.dataset.target;
        const targetInput = inputId ? document.getElementById(inputId) : null;

        if (!targetInput) {
            return;
        }

        toggleButton.addEventListener("click", () => {
            const shouldShow = targetInput.type === "password";
            targetInput.type = shouldShow ? "text" : "password";
            toggleButton.textContent = shouldShow ? "Hide" : "Show";
            toggleButton.setAttribute(
                "aria-label",
                `${shouldShow ? "Hide" : "Show"} ${targetInput.name || "password"}`
            );
        });
    });
};

const validateLoginEmail = () => {
    const value = normalizeEmail(loginEmail?.value);

    if (!value) {
        setError("login-email-error", "Email is required.");
        return false;
    }

    if (!EMAIL_PATTERN.test(value)) {
        setError("login-email-error", "Enter a valid email address.");
        return false;
    }

    setError("login-email-error", "");
    return true;
};

const validateLoginPassword = () => {
    const value = String(loginPassword?.value ?? "");

    if (!value) {
        setError("login-password-error", "Password is required.");
        return false;
    }

    if (value.length < 8) {
        setError("login-password-error", "Password must be at least 8 characters.");
        return false;
    }

    setError("login-password-error", "");
    return true;
};

const validateSignupName = () => {
    const value = String(signupName?.value ?? "").trim();

    if (!value) {
        setError("signup-name-error", "Full name is required.");
        return false;
    }

    if (value.length < 2) {
        setError("signup-name-error", "Full name must be at least 2 characters.");
        return false;
    }

    setError("signup-name-error", "");
    return true;
};

const validateSignupEmail = () => {
    const value = normalizeEmail(signupEmail?.value);

    if (!value) {
        setError("signup-email-error", "Email is required.");
        return false;
    }

    if (!EMAIL_PATTERN.test(value)) {
        setError("signup-email-error", "Enter a valid email address.");
        return false;
    }

    setError("signup-email-error", "");
    return true;
};

const validateSignupPassword = () => {
    const value = String(signupPassword?.value ?? "");
    updateStrengthIndicator(value);

    if (!value) {
        setError("signup-password-error", "Password is required.");
        return false;
    }

    if (!isPasswordValid(value)) {
        setError("signup-password-error", PASSWORD_RULE_MESSAGE);
        return false;
    }

    setError("signup-password-error", "");
    return true;
};

const validateSignupConfirmPassword = () => {
    const password = String(signupPassword?.value ?? "");
    const confirmPassword = String(signupConfirmPassword?.value ?? "");

    if (!confirmPassword) {
        setError("signup-confirm-password-error", "Please confirm your password.");
        return false;
    }

    if (password !== confirmPassword) {
        setError("signup-confirm-password-error", "Passwords do not match.");
        return false;
    }

    setError("signup-confirm-password-error", "");
    return true;
};

const setupLoginValidation = () => {
    if (!loginForm) {
        return;
    }

    loginEmail?.addEventListener("input", validateLoginEmail);
    loginPassword?.addEventListener("input", validateLoginPassword);

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");

        const isEmailValid = validateLoginEmail();
        const isPasswordValidForSubmit = validateLoginPassword();

        if (!isEmailValid || !isPasswordValidForSubmit) {
            setFeedback("Fix the highlighted fields and try again.", true);
            return;
        }

        const canContinue = await ensureFirebaseReady();

        if (!canContinue) {
            return;
        }

        const email = normalizeEmail(loginEmail?.value);
        const password = String(loginPassword?.value ?? "");

        try {
            await firebaseAuth.signInWithEmailAndPassword(email, password);

            const params = new URLSearchParams(window.location.search);
            const next = sanitizeRedirect(params.get("next"));
            setFeedback("Login successful. Redirecting...");
            loginForm.reset();

            window.setTimeout(() => {
                window.location.href = next || "index.html#home";
            }, 650);
        } catch (error) {
            setFeedback(getAuthErrorMessage(error), true);
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const prefilledEmail = normalizeEmail(urlParams.get("email"));
    const signupFlag = urlParams.get("signup");
    const logoutFlag = urlParams.get("logout");

    if (prefilledEmail && loginEmail) {
        loginEmail.value = prefilledEmail;
    }

    if (signupFlag === "success") {
        setFeedback("Account created successfully. Please login.");
    } else if (logoutFlag === "success") {
        setFeedback("You have been logged out.");
    }
};

const setupForgotPassword = () => {
    if (!forgotPasswordLink) {
        return;
    }

    forgotPasswordLink.addEventListener("click", async (event) => {
        event.preventDefault();
        setFeedback("");

        const isEmailValid = validateLoginEmail();

        if (!isEmailValid) {
            setFeedback("Enter your email first to reset your password.", true);
            return;
        }

        const canContinue = await ensureFirebaseReady();

        if (!canContinue) {
            return;
        }

        try {
            const email = normalizeEmail(loginEmail?.value);
            await firebaseAuth.sendPasswordResetEmail(email);
            setFeedback("Password reset email sent. Please check your inbox.");
        } catch (error) {
            setFeedback(getAuthErrorMessage(error), true);
        }
    });
};

const setupSignupValidation = () => {
    if (!signupForm) {
        return;
    }

    updateStrengthIndicator("");

    signupName?.addEventListener("input", validateSignupName);
    signupEmail?.addEventListener("input", validateSignupEmail);
    signupPassword?.addEventListener("input", () => {
        validateSignupPassword();
        validateSignupConfirmPassword();
    });
    signupConfirmPassword?.addEventListener("input", validateSignupConfirmPassword);

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFeedback("");

        const isNameValid = validateSignupName();
        const isEmailValid = validateSignupEmail();
        const isPasswordValidForSubmit = validateSignupPassword();
        const isConfirmValid = validateSignupConfirmPassword();

        if (!isNameValid || !isEmailValid || !isPasswordValidForSubmit || !isConfirmValid) {
            setFeedback("Fix the highlighted fields and try again.", true);
            return;
        }

        const canContinue = await ensureFirebaseReady();

        if (!canContinue) {
            return;
        }

        const name = String(signupName?.value ?? "").trim();
        const email = normalizeEmail(signupEmail?.value);
        const password = String(signupPassword?.value ?? "");

        try {
            await firebaseAuth.createUserWithEmailAndPassword(email, password);
            await firebaseAuth.updateProfile({ displayName: name });
            await firebaseAuth.signOut();

            setFeedback("Account created successfully. Redirecting to login...");
            signupForm.reset();
            updateStrengthIndicator("");

            const destination = `login.html?signup=success&email=${encodeURIComponent(email)}`;
            window.setTimeout(() => {
                window.location.href = destination;
            }, 800);
        } catch (error) {
            setFeedback(getAuthErrorMessage(error), true);
        }
    });
};

if (store?.bindCartBadge) {
    store.bindCartBadge(document);
} else if (store?.updateCartBadge) {
    store.updateCartBadge(document);
}

setupMobileNavigation();
setupSearchForm();
setupPasswordToggles();
setupLoginValidation();
setupForgotPassword();
setupSignupValidation();
