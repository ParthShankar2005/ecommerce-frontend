(function () {
    "use strict";

    if (!("serviceWorker" in navigator)) {
        return;
    }

    if (!window.isSecureContext) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
            // Ignore registration errors in unsupported hosting setups.
        });
    });
})();
