(function () {
    "use strict";

    const SCRIPT_CHAIN = [
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js",
        "scripts/firebase-config.js",
        "scripts/firebase-auth.js",
        "scripts/auth-ui.js"
    ];

    let started = false;

    const loadScript = (source) => {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[data-eco-src="${source}"]`);

            if (existingScript) {
                if (existingScript.dataset.loaded === "true") {
                    resolve();
                    return;
                }

                existingScript.addEventListener("load", () => resolve(), { once: true });
                existingScript.addEventListener("error", () => reject(new Error(source)), { once: true });
                return;
            }

            const scriptNode = document.createElement("script");
            scriptNode.src = source;
            scriptNode.async = true;
            scriptNode.dataset.ecoSrc = source;
            scriptNode.addEventListener(
                "load",
                () => {
                    scriptNode.dataset.loaded = "true";
                    resolve();
                },
                { once: true }
            );
            scriptNode.addEventListener("error", () => reject(new Error(source)), { once: true });
            document.head.appendChild(scriptNode);
        });
    };

    const loadSequentially = async () => {
        for (const scriptSource of SCRIPT_CHAIN) {
            await loadScript(scriptSource);
        }
    };

    const startLoading = () => {
        if (started) {
            return;
        }

        started = true;
        loadSequentially().catch(() => {
            // Ignore load failures; auth UI falls back to public navigation.
        });
    };

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(startLoading, { timeout: 2200 });
    } else {
        window.setTimeout(startLoading, 1200);
    }

    window.addEventListener("pointerdown", startLoading, { once: true, passive: true });
    window.addEventListener("focus", startLoading, { once: true });
})();
