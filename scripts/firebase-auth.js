(function () {
    "use strict";

    const REQUIRED_CONFIG_KEYS = [
        "apiKey",
        "authDomain",
        "projectId",
        "storageBucket",
        "messagingSenderId",
        "appId"
    ];
    const PLACEHOLDER_PREFIX = "REPLACE_WITH_";

    const state = {
        initialized: false,
        configured: false,
        reason: "not-initialized",
        auth: null,
        initPromise: null
    };

    const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

    const isRealConfigValue = (value) => {
        return hasValue(value) && !String(value).trim().startsWith(PLACEHOLDER_PREFIX);
    };

    const hasValidConfig = (config) => {
        if (!config || typeof config !== "object") {
            return false;
        }

        return REQUIRED_CONFIG_KEYS.every((key) => isRealConfigValue(config[key]));
    };

    const setState = (updates) => {
        Object.assign(state, updates);
        return state;
    };

    const getErrorMessage = (error) => {
        const code = String(error?.code ?? "");

        switch (code) {
        case "auth/email-already-in-use":
            return "This email is already registered. Please log in instead.";
        case "auth/invalid-email":
            return "Enter a valid email address.";
        case "auth/missing-password":
            return "Password is required.";
        case "auth/weak-password":
            return "Password is too weak. Use at least 8 characters with mixed case and a number.";
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Invalid email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again in a few minutes.";
        case "auth/network-request-failed":
            return "Network error. Check your connection and try again.";
        case "auth/not-configured":
            return "Firebase is not configured. Update scripts/firebase-config.js with your project keys.";
        default:
            return String(error?.message ?? "Authentication failed. Please try again.");
        }
    };

    const initialize = () => {
        if (state.initPromise) {
            return state.initPromise;
        }

        state.initPromise = Promise.resolve().then(() => {
            if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
                setState({
                    initialized: true,
                    configured: false,
                    reason: "sdk-missing",
                    auth: null
                });
                return null;
            }

            const config = window.__ECOCART_FIREBASE_CONFIG__;

            if (!hasValidConfig(config)) {
                setState({
                    initialized: true,
                    configured: false,
                    reason: "config-missing",
                    auth: null
                });
                return null;
            }

            try {
                if (!window.firebase.apps.length) {
                    window.firebase.initializeApp(config);
                }

                const auth = window.firebase.auth();
                setState({
                    initialized: true,
                    configured: true,
                    reason: "ready",
                    auth
                });

                return auth
                    .setPersistence(window.firebase.auth.Auth.Persistence.LOCAL)
                    .then(() => auth)
                    .catch(() => auth);
            } catch (error) {
                setState({
                    initialized: true,
                    configured: false,
                    reason: "init-failed",
                    auth: null
                });
                return null;
            }
        });

        return state.initPromise;
    };

    const ensureAuth = async () => {
        const auth = await initialize();

        if (auth) {
            return auth;
        }

        const error = new Error(
            "Firebase is not configured. Update scripts/firebase-config.js with your project keys."
        );
        error.code = "auth/not-configured";
        throw error;
    };

    const onAuthStateChanged = (callback) => {
        let isSubscribed = true;
        let unsubscribe = () => {};

        initialize().then((auth) => {
            if (!isSubscribed) {
                return;
            }

            if (!auth) {
                callback(null);
                return;
            }

            unsubscribe = auth.onAuthStateChanged(
                (user) => {
                    callback(user ?? null);
                },
                () => {
                    callback(null);
                }
            );
        });

        return () => {
            isSubscribed = false;
            unsubscribe();
        };
    };

    const createUserWithEmailAndPassword = async (email, password) => {
        const auth = await ensureAuth();
        return auth.createUserWithEmailAndPassword(email, password);
    };

    const signInWithEmailAndPassword = async (email, password) => {
        const auth = await ensureAuth();
        return auth.signInWithEmailAndPassword(email, password);
    };

    const signOut = async () => {
        const auth = await ensureAuth();
        return auth.signOut();
    };

    const sendPasswordResetEmail = async (email) => {
        const auth = await ensureAuth();
        return auth.sendPasswordResetEmail(email);
    };

    const updateProfile = async (profile) => {
        const auth = await ensureAuth();
        const user = auth.currentUser;

        if (!user) {
            return null;
        }

        return user.updateProfile(profile ?? {});
    };

    const getCurrentUser = () => {
        return state.auth?.currentUser ?? null;
    };

    const isConfigured = () => state.configured;
    const getStatusReason = () => state.reason;

    window.EcoFirebaseAuth = {
        initialize,
        isConfigured,
        getStatusReason,
        getCurrentUser,
        onAuthStateChanged,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        sendPasswordResetEmail,
        updateProfile,
        getErrorMessage
    };

    initialize();
})();
