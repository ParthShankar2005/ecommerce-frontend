(function () {
    "use strict";

    const TRANSPARENT_PIXEL =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    const SUPPORTS_NATIVE_LAZY = "loading" in HTMLImageElement.prototype;
    const DEFAULT_WIDTH_STEPS = [240, 360, 480, 640, 900, 1200];

    let lazyObserver = null;

    const toNumber = (value, fallbackValue) => {
        const parsed = Number.parseInt(String(value ?? ""), 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
    };

    const parsePicsumUrl = (imageUrl) => {
        const source = String(imageUrl ?? "").trim();

        if (!source) {
            return null;
        }

        let parsedUrl = null;

        try {
            parsedUrl = new URL(source, window.location.href);
        } catch (error) {
            return null;
        }

        if (!parsedUrl.hostname.includes("picsum.photos")) {
            return null;
        }

        const seedMatch = parsedUrl.pathname.match(/^\/seed\/([^/]+)\/(\d+)\/(\d+)$/);

        if (seedMatch) {
            return {
                url: parsedUrl,
                seed: seedMatch[1],
                width: toNumber(seedMatch[2], 480),
                height: toNumber(seedMatch[3], 480),
                isSeeded: true
            };
        }

        const plainMatch = parsedUrl.pathname.match(/^\/(\d+)\/(\d+)$/);

        if (plainMatch) {
            return {
                url: parsedUrl,
                seed: "",
                width: toNumber(plainMatch[1], 480),
                height: toNumber(plainMatch[2], 480),
                isSeeded: false
            };
        }

        return null;
    };

    const formatPicsumUrl = (source, nextWidth, nextHeight) => {
        const { url, seed, isSeeded } = source;
        const pathname = isSeeded
            ? `/seed/${seed}/${nextWidth}/${nextHeight}`
            : `/${nextWidth}/${nextHeight}`;

        return `${url.origin}${pathname}${url.search}`;
    };

    const buildResponsiveSrcset = (imageUrl, widthSteps = DEFAULT_WIDTH_STEPS) => {
        const source = parsePicsumUrl(imageUrl);

        if (!source) {
            return "";
        }

        const ratio = source.height / source.width;
        const maxWidth = Math.max(source.width, ...widthSteps);
        const steps = widthSteps
            .filter((step) => Number.isFinite(step) && step > 0)
            .map((step) => Math.min(step, maxWidth));
        const uniqueSteps = Array.from(new Set([...steps, source.width])).sort((a, b) => a - b);

        return uniqueSteps
            .map((step) => {
                const computedHeight = Math.max(1, Math.round(step * ratio));
                const variantUrl = formatPicsumUrl(source, step, computedHeight);
                return `${variantUrl} ${step}w`;
            })
            .join(", ");
    };

    const revealLazyImage = (imageNode) => {
        const nextSrc = String(imageNode.dataset.src ?? "").trim();
        const nextSrcset = String(imageNode.dataset.srcset ?? "").trim();

        if (nextSrcset) {
            imageNode.srcset = nextSrcset;
        }

        if (nextSrc) {
            imageNode.src = nextSrc;
        }

        imageNode.removeAttribute("data-src");
        imageNode.removeAttribute("data-srcset");
    };

    const ensureLazyObserver = () => {
        if (lazyObserver || !("IntersectionObserver" in window)) {
            return lazyObserver;
        }

        lazyObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const imageNode = entry.target;
                    revealLazyImage(imageNode);
                    lazyObserver.unobserve(imageNode);
                });
            },
            { rootMargin: "220px 0px" }
        );

        return lazyObserver;
    };

    const queueLazyImage = (imageNode) => {
        const observer = ensureLazyObserver();

        if (observer) {
            observer.observe(imageNode);
            return;
        }

        revealLazyImage(imageNode);
    };

    const applyOptimizedImage = (imageNode, options = {}) => {
        if (!imageNode) {
            return imageNode;
        }

        const source = String(options.src ?? "").trim();

        if (!source) {
            return imageNode;
        }

        const srcset = buildResponsiveSrcset(source, options.widthSteps);
        const sizes = String(options.sizes ?? "").trim();
        const loading = options.loading === "eager" ? "eager" : "lazy";
        const width = toNumber(options.width, 0);
        const height = toNumber(options.height, 0);

        if (typeof options.alt === "string") {
            imageNode.alt = options.alt;
        }

        if (width > 0) {
            imageNode.width = width;
        }

        if (height > 0) {
            imageNode.height = height;
        }

        imageNode.decoding = "async";
        imageNode.loading = loading;
        imageNode.fetchPriority = loading === "eager" ? "high" : "low";

        if (sizes) {
            imageNode.sizes = sizes;
        }

        if (loading === "eager" || SUPPORTS_NATIVE_LAZY) {
            if (srcset) {
                imageNode.srcset = srcset;
            }

            imageNode.src = source;
            return imageNode;
        }

        imageNode.dataset.src = source;

        if (srcset) {
            imageNode.dataset.srcset = srcset;
        }

        imageNode.src = TRANSPARENT_PIXEL;
        queueLazyImage(imageNode);
        return imageNode;
    };

    const hydrateLazyImages = (root = document) => {
        root.querySelectorAll("img[data-src]").forEach((imageNode) => {
            queueLazyImage(imageNode);
        });
    };

    window.EcoImageOptimizer = {
        applyOptimizedImage,
        buildResponsiveSrcset,
        hydrateLazyImages
    };
})();
