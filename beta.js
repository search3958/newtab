(() => {
    "use strict";

    /* =========================================================
       Constants
    ========================================================= */

    const DB_NAME = "WallpaperDB";
    const STORE = "images";
    const ICON_ZIP_URL = "https://search3958.github.io/newtab/lsr/icons-6-2.zip";
    const FALLBACK_LIGHT = "bgimg/baram1.webp";
    const FALLBACK_DARK = "bgimg/baram1_dark.webp";

    /* =========================================================
       DOM
    ========================================================= */

    const getRequiredElement = (selector) => {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`[Wallpaper] Required element not found: ${selector}`);
            return null;
        }
        return element;
    };

    /* =========================================================
       Wallpaper
    ========================================================= */

    const setWallpaper = (light, dark) => {
        if (!document.body) return;
        const lightUrl = light ? URL.createObjectURL(light) : FALLBACK_LIGHT;
        const darkUrl = dark ? URL.createObjectURL(dark) : lightUrl;
        document.body.style.setProperty("--wallpaper-light", `url("${lightUrl}")`);
        document.body.style.setProperty("--wallpaper-dark", `url("${darkUrl}")`);
    };

    const get = (db, key) => new Promise(resolve => {
        let request;
        try {
            request = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
        } catch (error) {
            console.error(`[Wallpaper] Failed to create request for "${key}".`, error);
            resolve(null);
            return;
        }
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error(`[Wallpaper] Failed to read "${key}".`, request.error);
            resolve(null);
        };
    });

    const initWallpaper = () => {
        let request;
        try {
            request = indexedDB.open(DB_NAME, 1);
        } catch (error) {
            console.error("[Wallpaper] IndexedDB open failed.", error);
            return;
        }
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };
        request.onsuccess = async () => {
            const db = request.result;
            try {
                const random = await get(db, "newtabRandom");
                if (Array.isArray(random?.wallpapers) && random.wallpapers.length) {
                    const list = random.wallpapers.filter(item => item?.light || item?.dark);
                    if (list.length) {
                        const wallpaper = list[Math.floor(Math.random() * list.length)];
                        setWallpaper(wallpaper.light || wallpaper.dark, wallpaper.dark || wallpaper.light);
                        return;
                    }
                }
                const normal = await get(db, "newtab");
                if (normal?.light || normal?.dark) {
                    setWallpaper(normal.light || normal.dark, normal.dark || normal.light);
                    return;
                }
                const light = await get(db, "light");
                const dark = await get(db, "dark");
                if (light?.light || dark?.dark) {
                    setWallpaper(light?.light || dark?.dark, dark?.dark || light?.light);
                }
            } catch (error) {
                console.error("[Wallpaper] Load failed.", error);
            } finally {
                db.close();
            }
        };
        request.onerror = () => console.error("[Wallpaper] IndexedDB open failed:", request.error);
    };

    /* =========================================================
       ZIP Reader
    ========================================================= */

    const findEndOfCentralDirectory = (bytes) => {
        const minimumSize = 22;
        const maximumComment = 0xffff;
        const start = Math.max(0, bytes.length - minimumSize - maximumComment);
        for (let offset = bytes.length - minimumSize; offset >= start; offset--) {
            if (bytes[offset] === 0x50 && bytes[offset + 1] === 0x4b && bytes[offset + 2] === 0x05 && bytes[offset + 3] === 0x06) {
                return offset;
            }
        }
        return -1;
    };

    const createZipReader = async (arrayBuffer) => {
        const bytes = new Uint8Array(arrayBuffer);
        const view = new DataView(arrayBuffer);
        const eocdOffset = findEndOfCentralDirectory(bytes);
        if (eocdOffset < 0) throw new Error("ZIP end-of-central-directory record was not found.");
        const centralDirectorySize = view.getUint32(eocdOffset + 12, true);
        const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
        const entries = new Map();
        let cursor = centralDirectoryOffset;
        const centralEnd = centralDirectoryOffset + centralDirectorySize;
        const decoder = new TextDecoder();
        while (cursor < centralEnd) {
            if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Invalid ZIP central directory entry.");
            const compressionMethod = view.getUint16(cursor + 10, true);
            const compressedSize = view.getUint32(cursor + 20, true);
            const uncompressedSize = view.getUint32(cursor + 24, true);
            const filenameLength = view.getUint16(cursor + 28, true);
            const extraLength = view.getUint16(cursor + 30, true);
            const commentLength = view.getUint16(cursor + 32, true);
            const localHeaderOffset = view.getUint32(cursor + 42, true);
            const filenameBytes = bytes.subarray(cursor + 46, cursor + 46 + filenameLength);
            const filename = decoder.decode(filenameBytes);
            entries.set(filename, { compressionMethod, compressedSize, uncompressedSize, localHeaderOffset });
            cursor += 46 + filenameLength + extraLength + commentLength;
        }
        const read = async (filename) => {
            const entry = entries.get(filename);
            if (!entry) return null;
            const localOffset = entry.localHeaderOffset;
            if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error(`Invalid local header: ${filename}`);
            const localFilenameLength = view.getUint16(localOffset + 26, true);
            const localExtraLength = view.getUint16(localOffset + 28, true);
            const dataOffset = localOffset + 30 + localFilenameLength + localExtraLength;
            const compressedData = bytes.slice(dataOffset, dataOffset + entry.compressedSize);
            if (entry.compressionMethod === 0) return compressedData;
            if (entry.compressionMethod !== 8) throw new Error(`Unsupported ZIP compression method for ${filename}: ${entry.compressionMethod}`);
            if (typeof DecompressionStream === "undefined") throw new Error("DecompressionStream is not supported by this browser.");
            const stream = new Blob([compressedData]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
            return new Uint8Array(await new Response(stream).arrayBuffer());
        };
        return { entries, read };
    };

    /* =========================================================
       Icon Loader
    ========================================================= */

    const loadIconsFromZip = async () => {
        console.log("[Shortcut] Loading icon ZIP...");
        const response = await fetch(ICON_ZIP_URL, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Icon ZIP request failed: ${response.status}`);
        const buffer = await response.arrayBuffer();
        const zip = await createZipReader(buffer);
        const objectUrls = new Map();
        for (const [filename] of zip.entries) {
            if (filename.endsWith("/") || filename.includes("../")) continue;
            try {
                const data = await zip.read(filename);
                if (!data) continue;
                const extension = filename.split(".").pop()?.toLowerCase();
                const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", avif: "image/avif" };
                const mime = mimeMap[extension] || "application/octet-stream";
                const blob = new Blob([data], { type: mime });
                objectUrls.set(filename, URL.createObjectURL(blob));
            } catch (error) {
                console.error(`[Shortcut] Failed to extract icon: ${filename}`, error);
            }
        }
        console.log(`[Shortcut] Loaded ${objectUrls.size} icons from ZIP.`);
        return objectUrls;
    };

    const resolveIconUrl = (iconName, iconMap) => {
        if (!iconName) {
            console.error("[Shortcut] Icon name is missing.");
            return null;
        }
        if (iconMap.has(iconName)) return iconMap.get(iconName);
        for (const [filename, url] of iconMap) {
            if (filename.endsWith("/" + iconName) || filename.endsWith("\\" + iconName)) return url;
        }
        console.error(`[Shortcut] Icon not found in ZIP: ${iconName}`);
        return null;
    };

    /* =========================================================
       Clock
    ========================================================= */

    const updateClock = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const clockEl = document.getElementById("clock");
        if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    };

    /* =========================================================
       Initialize
    ========================================================= */

    const init = async () => {
        console.log("[Wallpaper] Initializing...");

        const wallpaperTask = Promise.resolve().then(initWallpaper);
        const iconTask = loadIconsFromZip();

        try {
            const iconMap = await iconTask;
            window._iconMap = iconMap;
        } catch (error) {
            console.error("[Shortcut] Icon initialization failed.", error);
            window._iconMap = new Map();
        }

        await wallpaperTask;

        /* Load af.js after 2 seconds */
        setTimeout(() => {
            console.log("[Beta] Loading af.js...");
            const script = document.createElement("script");
            script.src = "af.js";
            script.onload = () => {
                console.log("[Beta] af.js loaded.");
                if (window.renderShortcuts && window._iconMap) {
                    try {
                        window.renderShortcuts(window._iconMap);
                    } catch (e) {
                        console.error("[Beta] renderShortcuts failed:", e);
                        if (window.renderShortcuts) window.renderShortcuts(new Map());
                    }
                }
                if (window.setupSearchAndHistory) {
                    window.setupSearchAndHistory();
                }
                window.updateClock();
                setInterval(window.updateClock, 1000);
            };
            script.onerror = () => {
                console.error("[Beta] Failed to load af.js");
            };
            document.head.appendChild(script);
        }, 2000);

        console.log("[Wallpaper] Initialization completed.");
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
