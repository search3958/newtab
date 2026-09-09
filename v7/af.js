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
    const HISTORY_KEY = "searchHistory";
    const MAX_HISTORY = 40;

    /* =========================================================
       Pre-compiled Regex
    ========================================================= */

    const RE_FULL_WIDTH = /[０-９]/g;
    const RE_MULTIPLY = /[×✖️xX]/g;
    const RE_DIVIDE = /[÷➗]/g;
    const RE_MINUS = /[ー]/g;
    const RE_PLUS = /[＋]/g;
    const RE_INVALID = /[^0-9+\-*/().\s]/g;
    const RE_TRAIL_OPS = /[\s+\-*/().]*$/;
    const RE_MATH = /^[\d\s+\-*/().]+$/;
    const RE_OPERATOR = /[+\-*/]/;
    const RE_URL = /^(https?:\/\/|(([a-z0-9-]+\.)+[a-z]{2,}))/i;
    const RE_AT = /^@/;
    const RE_WHITESPACE_AT = /@.*\s/;

    /* =========================================================
       DOM Cache
    ========================================================= */

    const dom = {};
    const cachedElements = new Map();

    const getEl = (selector) => {
        if (cachedElements.has(selector)) return cachedElements.get(selector);
        const el = document.querySelector(selector);
        if (el) cachedElements.set(selector, el);
        return el;
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

    const idbGet = (db, key) => new Promise(resolve => {
        try {
            const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        } catch { resolve(null); }
    });

    const initWallpaper = () => {
        let request;
        try { request = indexedDB.open(DB_NAME, 1); } catch { return; }
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        };
        request.onsuccess = async () => {
            const db = request.result;
            try {
                const random = await idbGet(db, "newtabRandom");
                if (Array.isArray(random?.wallpapers) && random.wallpapers.length) {
                    const list = random.wallpapers.filter(item => item?.light || item?.dark);
                    if (list.length) {
                        const w = list[Math.floor(Math.random() * list.length)];
                        setWallpaper(w.light || w.dark, w.dark || w.light);
                        return;
                    }
                }
                const normal = await idbGet(db, "newtab");
                if (normal?.light || normal?.dark) { setWallpaper(normal.light || normal.dark, normal.dark || normal.light); return; }
                const light = await idbGet(db, "light");
                const dark = await idbGet(db, "dark");
                if (light?.light || dark?.dark) setWallpaper(light.light || dark.dark, dark.dark || light.light);
            } catch {} finally { db.close(); }
        };
    };

    /* =========================================================
       ZIP Reader
    ========================================================= */

    const findEOCD = (bytes) => {
        const min = 22, max = 0xffff, start = Math.max(0, bytes.length - min - max);
        for (let i = bytes.length - min; i >= start; i--) {
            if (bytes[i] === 0x50 && bytes[i+1] === 0x4b && bytes[i+2] === 0x05 && bytes[i+3] === 0x06) return i;
        }
        return -1;
    };

    const createZipReader = async (buffer) => {
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);
        const eocd = findEOCD(bytes);
        if (eocd < 0) throw new Error("ZIP EOCD not found");
        const cdSize = view.getUint32(eocd + 12, true);
        const cdOffset = view.getUint32(eocd + 16, true);
        const entries = new Map();
        let cursor = cdOffset;
        const end = cdOffset + cdSize;
        const dec = new TextDecoder();
        while (cursor < end) {
            if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Invalid ZIP entry");
            const cm = view.getUint16(cursor + 10, true);
            const cs = view.getUint32(cursor + 20, true);
            const us = view.getUint32(cursor + 24, true);
            const fnLen = view.getUint16(cursor + 28, true);
            const exLen = view.getUint16(cursor + 30, true);
            const coLen = view.getUint16(cursor + 32, true);
            const lho = view.getUint32(cursor + 42, true);
            const fn = dec.decode(bytes.subarray(cursor + 46, cursor + 46 + fnLen));
            entries.set(fn, { cm, cs, us, lho });
            cursor += 46 + fnLen + exLen + coLen;
        }
        const read = async (filename) => {
            const entry = entries.get(filename);
            if (!entry) return null;
            if (view.getUint32(entry.lho, true) !== 0x04034b50) throw new Error(`Invalid local header: ${filename}`);
            const lfn = view.getUint16(entry.lho + 26, true);
            const el = view.getUint16(entry.lho + 28, true);
            const doff = entry.lho + 30 + lfn + el;
            const comp = bytes.slice(doff, doff + entry.cs);
            if (entry.cm === 0) return comp;
            if (entry.cm !== 8) throw new Error(`Unsupported compression: ${entry.cm}`);
            if (typeof DecompressionStream === "undefined") throw new Error("DecompressionStream unsupported");
            return new Uint8Array(await new Response(new Blob([comp]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
        };
        return { entries, read };
    };

    /* =========================================================
       Icon Loader
    ========================================================= */

    const loadIconsFromZip = async () => {
        const res = await fetch(ICON_ZIP_URL, { cache: "force-cache" });
        if (!res.ok) throw new Error(`Icon ZIP failed: ${res.status}`);
        const zip = await createZipReader(await res.arrayBuffer());
        const urls = new Map();
        const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", avif: "image/avif" };
        for (const [filename] of zip.entries) {
            if (filename.endsWith("/") || filename.includes("../")) continue;
            try {
                const data = await zip.read(filename);
                if (!data) continue;
                const ext = filename.split(".").pop()?.toLowerCase();
                const blob = new Blob([data], { type: mimeMap[ext] || "application/octet-stream" });
                urls.set(filename, URL.createObjectURL(blob));
            } catch {}
        }
        return urls;
    };

    /* =========================================================
       Shortcut Data
    ========================================================= */

    const SHORTCUT_DATA = {
        categories: [
            {
                title: "Sentaro",
                links: [
                    { name: "私について", bg: "var(--iconbg)", url: "https://search3958.github.io/", icon: "3958.webp" },
                    { name: "文字カウンター", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/counter.html", icon: "counter.webp" },
                    { name: "タイマー", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/timer/ja.html", icon: "timer.webp" },
                    { name: "ストップウォッチ", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/stopwatch/ja.html", icon: "stopwatch.webp" },
                    { name: "デジタル時計", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/dclock/ja.html", icon: "dclock.webp" },
                    { name: "アナログ時計", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/aclock/ja.html", icon: "aclock.webp" },
                    { name: "記録ノート", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/girog/", icon: "girog.png" },
                    { name: "ToolBoard", bg: "var(--iconbg)", url: "https://search3958.github.io/toolboard", icon: "toolboard.webp" },
                    { name: "Baram Code", bg: "var(--iconbg)", url: "https://search3958.github.io/baram/", icon: "garam.webp" },
                    { name: "千里辞書", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/sajon/", icon: "cheonri.webp" }
                ]
            },
            {
                title: "学習と教育",
                links: [
                    { name: "Classroom", bg: "var(--iconbg)", url: "https://classroom.google.com/", icon: "classroom.webp" },
                    { name: "Monoxer", bg: "#0073ffbb", url: "https://app.monoxer.com/", icon: "monoxer.webp" },
                    { name: "MALU辞書", bg: "var(--iconbg)", url: "https://sy9-k.github.io/dictionary/", icon: "malu.png" },
                    { name: "Scratch", bg: "var(--iconbg)", url: "https://scratch.mit.edu/", icon: "scratch.webp" },
                    { name: "ロイロノート", bg: "var(--iconbg)", url: "https://loilonote.app/", icon: "-.png" },
                    { name: "Lit講座", bg: "var(--iconbg)", url: "https://member.lifeistech-lesson.jp/home", icon: "-.png" }
                ]
            },
            {
                title: "Google",
                links: [
                    { name: "Gmail", bg: "var(--iconbg)", url: "https://mail.google.com/", icon: "gmail.webp" },
                    { name: "Keep", bg: "var(--iconbg)", url: "https://keep.google.com/", icon: "keep.webp" },
                    { name: "ドキュメント", bg: "var(--iconbg)", url: "https://docs.google.com/document/", icon: "document.webp" },
                    { name: "スライド", bg: "var(--iconbg)", url: "https://docs.google.com/presentation/", icon: "slide.webp" },
                    { name: "スプレッドシート", bg: "var(--iconbg)", url: "https://docs.google.com/spreadsheets/", icon: "spreadsheet.webp" },
                    { name: "ドライブ", bg: "var(--iconbg)", url: "https://drive.google.com/", icon: "drive.webp" },
                    { name: "Photos", bg: "var(--iconbg)", url: "https://photos.google.com/", icon: "photos.webp" },
                    { name: "Forms", bg: "var(--iconbg)", url: "https://docs.google.com/forms/", icon: "forms.webp" },
                    { name: "リモート", bg: "var(--iconbg)", url: "https://remotedesktop.google.com/", icon: "remotedesktop.webp" }
                ]
            },
            {
                title: "作業効率化",
                links: [
                    { name: "ChatGPT", bg: "#fff9", url: "https://chatgpt.com/", icon: "chatgpt.webp" },
                    { name: "Qwen", bg: "var(--iconbg)", url: "https://chat.qwen.ai/", icon: "qwen.webp" },
                    { name: "TurboWarp", bg: "var(--iconbg)", url: "https://turbowarp.org/", icon: "turbowarp.webp" },
                    { name: "Copilot", bg: "var(--iconbg)", url: "https://copilot.microsoft.com/", icon: "copilot.webp" },
                    { name: "Claude", bg: "var(--iconbg)", url: "https://claude.ai/", icon: "claude.webp" },
                    { name: "NotebookLM", bg: "#fff9", url: "https://notebooklm.google.com/?icid=home_maincta", icon: "notebooklm.webp" },
                    { name: "Canva", bg: "var(--iconbg)", url: "https://www.canva.com/", icon: "canva.webp" },
                    { name: "Microsoft 365", bg: "var(--iconbg)", url: "https://www.microsoft365.com", icon: "microsodt.webp" },
                    { name: "翻訳", bg: "var(--iconbg)", url: "https://translate.google.com/", icon: "translate.webp" }
                ]
            },
            {
                title: "コミュニケーション",
                links: [
                    { name: "Discord", bg: "#5618ffbb", url: "https://discord.com/app", icon: "discord.webp" },
                    { name: "Snapchat", bg: "#fffc03bb", url: "https://www.snapchat.com/web/", icon: "snapchat.webp" },
                    { name: "TikTok", bg: "#000000bb", url: "https://www.tiktok.com/", icon: "tiktok.webp" },
                    { name: "Instagram", bg: "var(--iconbg)", url: "https://www.instagram.com/", icon: "instagram.webp" },
                    { name: "Weverse", bg: "#27ffbfbb", url: "https://weverse.io/", icon: "weverse.webp" },
                    { name: "WeChat", bg: "var(--iconbg)", url: "https://www.wechat.com/", icon: "wechat.webp" }
                ]
            },
            {
                title: "エンターテイメント",
                links: [
                    { name: "Youtube", bg: "var(--iconbg)", url: "https://www.youtube.com/", icon: "youtube.webp" },
                    { name: "Kahoot", bg: "#1b00a8bb", url: "https://kahoot.it/", icon: "kahoot.webp" },
                    { name: "Netflix", bg: "var(--iconbg)", url: "https://www.netflix.com/", icon: "netflix.webp" },
                    { name: "Prime Video", bg: "#0398ffbb", url: "https://www.amazon.co.jp/Prime-Video/", icon: "primevideo.webp" },
                    { name: "Apple Music", bg: "#FB4058bb", url: "https://music.apple.com/jp/new", icon: "applemusic.webp" },
                    { name: "Spotify", bg: "var(--iconbg)", url: "https://www.spotify.com/", icon: "spotify.webp" },
                    { name: "poki", bg: "rgba(255, 255, 255, 0.759)", url: "https://poki.com/", icon: "poki.webp" },
                    { name: "小红书", bg: "var(--iconbg)", url: "https://www.xiaohongshu.com/explore", icon: "xiaohongshu.webp" },
                    { name: "X.com", bg: "#0005", url: "https://x.com/", icon: "x.webp" }
                ]
            },
            {
                title: "開発・技術",
                links: [
                    { name: "GitHub", bg: "var(--iconbg)", url: "https://github.com/", icon: "github.webp" },
                    { name: "Figma", bg: "var(--iconbg)", url: "https://www.figma.com/", icon: "figma.webp" },
                    { name: "Firebase", bg: "var(--iconbg)", url: "https://firebase.google.com/", icon: "firebase.webp" },
                    { name: "Codepen", bg: "#000000bb", url: "https://codepen.io/", icon: "codepen.webp" },
                    { name: "AdSense", bg: "var(--iconbg)", url: "https://www.google.com/adsense/", icon: "adsense.webp" },
                    { name: "Fonts", bg: "var(--iconbg)", url: "https://fonts.google.com/", icon: "fonts.webp" },
                    { name: "Analytics", bg: "var(--iconbg)", url: "https://analytics.google.com/analytics/web/", icon: "analytics.webp" },
                    { name: "Search Console", bg: "var(--iconbg)", url: "https://search.google.com/search-console", icon: "searchconsole.webp" },
                    { name: "AdMob", bg: "var(--iconbg)", url: "https://admob.google.com/", icon: "admob.webp" }
                ]
            },
            {
                title: "ショッピング",
                links: [
                    { name: "Amazon", bg: "rgba(255, 255, 255, 0.759)", url: "https://www.amazon.co.jp/", icon: "amazon.webp" },
                    { name: "AliExpress", bg: "var(--iconbg)", url: "https://www.aliexpress.com/", icon: "aliexpress.webp" },
                    { name: "Mercari", bg: "var(--iconbg)", url: "https://www.mercari.com/jp/", icon: "mercari.webp" },
                    { name: "Yahoo!フリマ", bg: "var(--iconbg)", url: "https://paypayfleamarket.yahoo.co.jp/", icon: "pfm.webp" },
                    { name: "闲鱼", bg: "#FBE74F", url: "https://2.taobao.com/", icon: "xianyu.webp" }
                ]
            },
            {
                title: "情報収集と知識",
                links: [
                    { name: "Google AI検索", bg: "var(--iconbg)", url: "https://www.google.com/search?q=&sca_esv=b5f8bcc5c9e9d517&sxsrf=AE3TifOLFMGi2WEgIHToTWbz6pxHrjaJKA%3A1765700172965&source=hp&ei=THI-adCJOPefvr0PnN3g2Ak&iflsig=AOw8s4IAAAAAaT6AXAWcMaV5a1YrcKo_owUU2NFfS4yC&aep=22&udm=50&ved=0ahUKEwjQ39jc0byRAxX3j68BHZwuGJsQteYPCBQ&oq=&gs_lp=Egdnd3Mtd2l6IgBIAFAAWABwAHgAkAEAmAEAoAEAqgEAuAEByAEAmAIAoAIAmAMAkgcAoAcAsgcAuAcAwgcAyAcAgAgA&sclient=gws-wiz", icon: "products.webp" },
                    { name: "Wikipedia", bg: "#fff9", url: "https://ja.wikipedia.org/wiki/", icon: "wikipedia.webp" },
                    { name: "Zenn", bg: "var(--iconbg)", url: "https://zenn.dev//", icon: "zenn.webp" },
                    { name: "Qiita", bg: "var(--iconbg)", url: "https://qiita.com/", icon: "qitta.webp" },
                    { name: "NAVER", bg: "#07cd85", url: "https://www.naver.com/", icon: "naver.webp" },
                    { name: "Papago", bg: "var(--iconbg)", url: "https://papago.naver.com/", icon: "papago.webp" },
                    { name: "豆包", bg: "var(--iconbg)", url: "https://www.doubao.com/", icon: "doubao.webp" },
                    { name: "Kimi", bg: "#000b", url: "https://kimi.moonshot.cn/", icon: "kimi.webp" },
                    { name: "Perplexity", bg: "var(--iconbg)", url: "https://www.perplexity.ai/", icon: "perproxity.webp" }
                ]
            }
        ]
    };

    /* =========================================================
        App Search Data
    ========================================================= */

    const APP_SEARCH_DATA = [
        { name: "Scratch", icon: "scratch.webp", url: "https://scratch.mit.edu/search/projects?q=", placeholder: "q" },
        { name: "YouTube", icon: "youtube.webp", url: "https://www.youtube.com/results?search_query=", placeholder: "search_query" },
        { name: "X", icon: "x.webp", url: "https://x.com/search?q=", placeholder: "q" },
        { name: "ChatGPT", icon: "chatgpt.webp", url: "https://chatgpt.com?q=", placeholder: "q" },
        { name: "Mercari", icon: "mercari.webp", url: "https://jp.mercari.com/search?keyword=", placeholder: "keyword" },
        { name: "AliExpress", icon: "aliexpress.webp", url: "https://ja.aliexpress.com/w/wholesale-.html?spm=a2g0o.home.search.0", placeholder: null, pattern: "wholesale-*.html" },
        { name: "Amazon", icon: "amazon.webp", url: "https://www.amazon.co.jp/s?k=", placeholder: "k" },
        { name: "Qiita", icon: "qitta.webp", url: "https://qiita.com/search?q=", placeholder: "q" },
        { name: "PayPayフリマ", icon: "pfm.webp", url: "https://paypayfleamarket.yahoo.co.jp/search/?page=1", placeholder: null },
        { name: "Gmail", icon: "gmail.webp", url: "https://mail.google.com/mail/q=" }
    ];

    const APP_MAP = new Map(APP_SEARCH_DATA.map(a => [a.name.toLowerCase(), a]));

    /* =========================================================
       Utility Functions
    ========================================================= */

    const fullWidthToHalf = (str) => {
        const map = { '０':'0','１':'1','２':'2','３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9','＋':'+','－':'-','×':'*','÷':'/','＝':'=' };
        return str.split('').map(c => map[c] || c).join('');
    };

    const evaluateMath = (str) => {
        const cleaned = fullWidthToHalf(str).trim();
        if (!cleaned || !RE_MATH.test(cleaned) || !cleaned.includes('+') && !cleaned.includes('-') && !cleaned.includes('*') && !cleaned.includes('/')) return null;
        try {
            const r = Function('"use strict"; return (' + cleaned + ')')();
            if (typeof r === 'number' && isFinite(r)) return `${cleaned}=${r}`;
        } catch {}
        return null;
    };

    const resolveIconUrl = (iconName, iconMap) => {
        if (!iconName) return null;
        if (iconMap.has(iconName)) return iconMap.get(iconName);
        for (const [f, u] of iconMap) {
            if (f.endsWith("/" + iconName) || f.endsWith("\\" + iconName)) return u;
        }
        return null;
    };

    /* =========================================================
       History (cached localStorage)
    ========================================================= */

    let historyCache = null;

    const getHistory = () => {
        if (historyCache !== null) return historyCache;
        try { historyCache = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { historyCache = []; }
        return historyCache;
    };

    const updateHistory = (query) => {
        const h = getHistory().filter(s => s !== query);
        h.unshift({ query, time: Date.now() });
        if (h.length > MAX_HISTORY) h.length = MAX_HISTORY;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
        historyCache = h;
    };

    const formatDateTime = (date) => {
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const h = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return `${m}.${d} ${h}:${min}`;
    };

    /* =========================================================
        Search & Intelligence
    ========================================================= */

    let appSearchIconMap = null;
    let lastDropdownQuery = null;
    const iconCache = new Map();
    let searchEngine = "google";

    /* =========================================================
       Unified Main Suggestions
       - Normal input only
       - App home access + calculator are local/high-priority
       - Google suggestions are fetched after 150ms
       - @ app-search mode never calls Google autocomplete
       ========================================================= */

    const MAIN_SUGGESTION_ID = "mainSuggestionDropdown";
    const GOOGLE_SUGGESTION_DELAY = 120;
    let mainSuggestionTimer = null;
    let googleSuggestionController = null;
    let mainSuggestionItems = [];

    const ensureMainSuggestionDropdown = () => {
        let dropdown = getEl(`#${MAIN_SUGGESTION_ID}`);
        if (dropdown) return dropdown;

        if (!document.body) {
            console.error("[MainSuggestion] document.body not found.");
            return null;
        }

        dropdown = document.createElement("div");
        dropdown.id = MAIN_SUGGESTION_ID;
        dropdown.setAttribute("role", "listbox");
        Object.assign(dropdown.style, {
            position: "fixed",
            top: "130px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "413px",
            maxHeight: "300px",
            overflowY: "auto",
            background: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            backdropFilter: "blur(24px)",
            zIndex: "150",
            padding: "8px",
            boxSizing: "border-box",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            display: "none"
        });

        if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
            dropdown.style.background = "rgba(28,28,28,0.95)";
        }

        document.body.appendChild(dropdown);
        cachedElements.set(`#${MAIN_SUGGESTION_ID}`, dropdown);
        console.log("[MainSuggestion] Dropdown created.");
        return dropdown;
    };

    const setMainSuggestionVisibility = (visible) => {
        const dropdown = ensureMainSuggestionDropdown();
        if (!dropdown) return;
        dropdown.style.display = visible ? "block" : "none";
    };

    const hideMainSuggestions = (reason = "unknown") => {
        if (mainSuggestionTimer) {
            clearTimeout(mainSuggestionTimer);
            mainSuggestionTimer = null;
        }
        if (googleSuggestionController) {
            googleSuggestionController.abort();
            googleSuggestionController = null;
        }
        mainSuggestionItems = [];
        const dropdown = getEl(`#${MAIN_SUGGESTION_ID}`);
        if (dropdown) {
            dropdown.replaceChildren();
            dropdown.style.display = "none";
        }
        console.log(`[MainSuggestion] Hidden: ${reason}`);
    };

    const normalizeSuggestionText = (value) =>
        typeof value === "string" ? value.trim() : "";

    const getMainAccessCandidates = (query) => {
        const q = normalizeSuggestionText(query).toLowerCase();
        if (!q) return [];

        const seen = new Set();
        const matches = [];
        const categories = Array.isArray(SHORTCUT_DATA?.categories) ? SHORTCUT_DATA.categories : [];

        for (const category of categories) {
            if (!category || !Array.isArray(category.links)) continue;
            for (const link of category.links) {
                if (!link?.name || !link?.url) continue;
                const name = String(link.name);
                const key = name.toLowerCase();
                if (seen.has(key)) continue;
                if (key.startsWith(q)) {
                    seen.add(key);
                    matches.push(link);
                }
            }
        }

        return matches.slice(0, 2);
    };

    const createMainSuggestionItem = (item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "app-search-item";
        button.dataset.index = String(index);
        button.dataset.value = item.value || "";
        button.dataset.action = item.action || "insert";
        button.setAttribute("role", "option");
        Object.assign(button.style, {
            width: "100%",
            border: "0",
            textAlign: "left",
            background: "transparent",
            color: "inherit"
        });

        const icon = document.createElement("div");
        icon.className = "app-search-item-icon";
        icon.style.cssText = "width:32px;height:32px;border-radius:8px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;";

        if (item.icon) {
            const iconUrl = resolveAppIconUrlCached(item.icon, appSearchIconMap || new Map());
            if (iconUrl) {
                const img = document.createElement("img");
                img.src = iconUrl;
                img.alt = "";
                img.width = 32;
                img.height = 32;
                img.style.objectFit = "contain";
                img.addEventListener("error", () => {
                    console.error(`[MainSuggestion] Icon failed: ${item.icon}`);
                    img.remove();
                }, { once: true });
                icon.appendChild(img);
            }
        }

        if (!icon.firstChild) {
            icon.textContent = item.type === "math" ? "=" : item.type === "app" ? (item.label?.[0] || "A") : "G";
            icon.style.background = "rgba(24,90,242,0.12)";
            icon.style.fontSize = "15px";
        }

        const name = document.createElement("span");
        name.className = "app-search-item-name";
        name.textContent = item.label || item.value || "";

        const meta = document.createElement("span");
        meta.className = "app-search-item-url";
        meta.textContent = item.meta || (item.type === "math" ? "計算" : "Google候補");

        button.append(icon, name, meta);
        return button;
    };

    const renderMainSuggestions = (items) => {
        const dropdown = ensureMainSuggestionDropdown();
        if (!dropdown) return;

        mainSuggestionItems = Array.isArray(items) ? items.slice(0, 10) : [];
        dropdown.replaceChildren();

        if (!mainSuggestionItems.length) {
            dropdown.style.display = "none";
            console.log("[MainSuggestion] No candidates.");
            return;
        }

        const fragment = document.createDocumentFragment();
        mainSuggestionItems.forEach((item, index) => {
            const el = createMainSuggestionItem(item, index);
            if (el) fragment.appendChild(el);
        });
        dropdown.appendChild(fragment);
        dropdown.style.display = "block";
        console.log(`[MainSuggestion] Rendered ${mainSuggestionItems.length} candidate(s). Top: ${mainSuggestionItems[0]?.label || ""}`);
    };

    const fetchGoogleSuggestions = async (query) => {
        const q = normalizeSuggestionText(query);
        if (!q || q.startsWith("@")) {
            console.log("[GoogleSuggest] Skipped: app-search mode or empty query.");
            return [];
        }

        if (googleSuggestionController) googleSuggestionController.abort();
        googleSuggestionController = new AbortController();

        const uuid = localStorage.getItem("uuid") || "";
        const requestUrl = "https://search-helper.takesen2278.workers.dev/?q=" + encodeURIComponent(q) + "&uuid=" + uuid;
        console.log(`[GoogleSuggest] Request: ${q}`);

        try {
            const response = await fetch(requestUrl, {
                method: "GET",
                cache: "force-cache",
                signal: googleSuggestionController.signal
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const suggestions = Array.isArray(data?.[1])
                ? data[1].filter(value => typeof value === "string")
                    .map(normalizeSuggestionText)
                    .filter(Boolean)
                : [];

            console.log(`[GoogleSuggest] Received ${suggestions.length} candidate(s).`);
            return suggestions;
        } catch (error) {
            if (error?.name === "AbortError") {
                console.log("[GoogleSuggest] Request aborted.");
                return [];
            }
            console.error("[GoogleSuggest] Request failed:", error);
            return [];
        } finally {
            googleSuggestionController = null;
        }
    };

    const buildMainSuggestionList = async (query) => {
        const q = normalizeSuggestionText(query);
        if (!q || q.startsWith("@")) {
            hideMainSuggestions("@ mode or empty query");
            return;
        }

        const localItems = [];

        // 1. Main-page app access: only when there are 1-2 matches.
        const appMatches = getMainAccessCandidates(q);
        for (const app of appMatches) {
            localItems.push({
                type: "app",
                label: app.name,
                value: app.name,
                url: app.url,
                icon: app.icon,
                meta: "アプリを開く",
                action: "open"
            });
        }

        // 2. Calculator result is always before network candidates.
        const mathResult = evaluateMath(q);
        if (mathResult) {
            localItems.push({
                type: "math",
                label: mathResult,
                value: mathResult,
                meta: "計算結果",
                action: "insert"
            });
        }

        // Render local high-priority candidates immediately.
        if (localItems.length) renderMainSuggestions(localItems);
        else hideMainSuggestions("waiting for Google suggestions");

        // 3. Google autocomplete is intentionally delayed by 150ms.
        const googleSuggestions = await fetchGoogleSuggestions(q);
        const googleItems = googleSuggestions
            .filter(value => value.toLowerCase() !== q.toLowerCase())
            .filter(value => !localItems.some(item => item.label.toLowerCase() === value.toLowerCase()))
            .slice(0, 7)
            .map(value => ({
                type: "google",
                label: value,
                value,
                meta: "Google候補",
                action: "insert"
            }));

        if (q !== normalizeSuggestionText(getEl("#searchBox")?.value || "")) {
            console.log("[MainSuggestion] Query changed before Google response; result ignored.");
            return;
        }

        renderMainSuggestions([...localItems, ...googleItems]);
    };

    const scheduleMainSuggestions = (query) => {
        const q = normalizeSuggestionText(query);

        if (mainSuggestionTimer) {
            clearTimeout(mainSuggestionTimer);
            mainSuggestionTimer = null;
        }
        if (googleSuggestionController) {
            googleSuggestionController.abort();
            googleSuggestionController = null;
        }

        if (!q || q.startsWith("@")) {
            hideMainSuggestions(q.startsWith("@") ? "app-search active" : "empty query");
            return;
        }

        // Show local candidates without waiting for the network.
        const localItems = [];
        for (const app of getMainAccessCandidates(q)) {
            localItems.push({ type: "app", label: app.name, value: app.name, url: app.url, icon: app.icon, meta: "アプリを開く", action: "open" });
        }
        const mathResult = evaluateMath(q);
        if (mathResult) localItems.push({ type: "math", label: mathResult, value: mathResult, meta: "計算結果", action: "insert" });
        if (localItems.length) renderMainSuggestions(localItems);
        else hideMainSuggestions("no local candidate");

        mainSuggestionTimer = setTimeout(() => {
            mainSuggestionTimer = null;
            buildMainSuggestionList(q).catch(error => console.error("[MainSuggestion] Build failed:", error));
        }, GOOGLE_SUGGESTION_DELAY);
        console.log(`[MainSuggestion] Google request scheduled in ${GOOGLE_SUGGESTION_DELAY}ms: ${q}`);
    };

    const applyMainSuggestion = (index = 0, mode = "tab") => {
        const item = mainSuggestionItems[index];
        const sb = getEl("#searchBox");
        if (!item || !sb) {
            console.error("[MainSuggestion] Cannot apply candidate: item or searchBox missing.");
            return false;
        }

        if (mode === "enter" && item.action === "open" && item.url) {
            updateHistory(item.label);
            console.log(`[MainSuggestion] Opening app: ${item.label}`);
            window.location.href = item.url;
            return true;
        }

        sb.value = item.value || item.label || "";
        sb.focus();
        const end = sb.value.length;
        try { sb.setSelectionRange(end, end); } catch {}
        scheduleMainSuggestions(sb.value);
        console.log(`[MainSuggestion] Candidate applied (${mode}): ${sb.value}`);
        return true;
    };

    const showIntelBox = (text, url) => {
        const box = getEl("#intelBox");
        const ans = getEl("#intelAnswer");
        if (!box || !ans) {
            console.error("[Intel] Required element not found: #intelBox or #intelAnswer");
            return;
        }
        ans.textContent = text || "";
        ans.onclick = null;
        ans.classList.remove("hide");
        if (url) {
            ans.style.cursor = "pointer";
            ans.onclick = () => {
                console.log(`[Intel] Opening URL: ${url}`);
                window.location.href = url;
            };
        } else {
            ans.style.cursor = "default";
        }
        box.classList.add("visible");
        console.log(`[Intel] Shown: ${text || ""}`);
    };

    const hideIntelBox = () => {
        const box = getEl("#intelBox");
        const ans = getEl("#intelAnswer");
        if (box) box.classList.remove("visible");
        if (ans) { ans.classList.add("hide"); ans.onclick = null; }
    };

    const searchApp = (text) => {
        if (!text) return null;
        const q = text.replace(RE_AT, '').toLowerCase().trim();
        if (q.length < 1) return null;
        return APP_MAP.get(q) || null;
    };

    const resolveAppIconUrlCached = (iconName, iconMap) => {
        if (!iconName) return null;
        const key = `${iconName}_${iconMap.size}`;
        if (iconCache.has(key)) return iconCache.get(key);
        const url = resolveIconUrl(iconName, iconMap);
        if (url) iconCache.set(key, url);
        return url;
    };

    const updateIntelFromDropdown = (query) => {
        if (!query) { hideIntelBox(); return; }
        const match = APP_SEARCH_DATA.find(a => a.name.toLowerCase().includes(query.toLowerCase()));
        if (match) {
            const iconUrl = resolveAppIconUrlCached(match.icon, appSearchIconMap);
            const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="${match.name}" style="width:20px;height:20px;object-fit:contain">` : '';
            showIntelBox(`${iconHtml} ${match.name}`, match.url);
        } else { hideIntelBox(); }
    };

    const showAppSearchDropdown = (query) => {
        const dropdown = getEl("#appSearchDropdown");
        if (!dropdown) return;
        if (query === lastDropdownQuery) { updateIntelFromDropdown(query); return; }
        lastDropdownQuery = query;
        updateIntelFromDropdown(query);
        const filtered = query ? APP_SEARCH_DATA.filter(a => a.name.toLowerCase().includes(query.toLowerCase())) : APP_SEARCH_DATA;
        if (filtered.length === 0) {
            dropdown.innerHTML = '<div style="padding:12px;text-align:center;color:#999;font-size:14px">該当するアプリが見つかりません</div>';
        } else {
            dropdown.innerHTML = filtered.map(app => {
                const iconUrl = resolveAppIconUrlCached(app.icon, appSearchIconMap);
                const iconHtml = iconUrl
                    ? `<div class="app-search-item-icon"><img src="${iconUrl}" alt="${app.name}"></div>`
                    : `<div class="app-search-item-icon" style="background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:16px">${app.name[0]}</div>`;
                return `<div class="app-search-item" data-url="${app.url}" data-name="${app.name}" data-placeholder="${app.placeholder || ''}">${iconHtml}<span class="app-search-item-name">${app.name}</span><span class="app-search-item-url">${app.url.replace(/=$/, "")}…</span></div>`;
            }).join("");
        }
        dropdown.classList.add("visible");
    };

    const hideAppSearchDropdown = () => {
        const d = getEl("#appSearchDropdown");
        if (d) d.classList.remove("visible");
    };

    const performAppSearch = () => {
        const sb = getEl("#searchBox");
        if (!sb) return;
        const val = sb.value.trim();
        if (!val.startsWith("@")) return;
        const app = searchApp(val);
        if (app) {
            hideAppSearchDropdown(); hideIntelBox();
            let searchUrl;
            if (app.name === "AliExpress") searchUrl = app.url.replace("wholesale-", "wholesale-" + encodeURIComponent(""));
            else if (app.placeholder) searchUrl = app.url.replace(app.placeholder + "=", app.placeholder + "=" + encodeURIComponent(""));
            else searchUrl = app.url + encodeURIComponent("");
            updateHistory(`@${app.name}`);
            window.location.href = searchUrl;
        }
    };

    const handleAppSearchClick = () => {
        const sb = getEl("#searchBox");
        if (!sb) return;
        const val = sb.value;
        if (val === "") { sb.value = "@"; sb.focus(); showAppSearchDropdown(""); }
        else if (val === "@") { sb.value = ""; hideAppSearchDropdown(); hideIntelBox(); }
        else if (val.startsWith("@")) {
            const si = val.indexOf(" ");
            if (si > 0) sb.value = val.substring(0, si);
            else sb.value = "";
            hideAppSearchDropdown(); hideIntelBox();
        } else { sb.value = val + "@"; sb.focus(); showAppSearchDropdown(""); }
    };

    const selectFirstDropdownItem = () => {
        const dropdown = getEl("#appSearchDropdown");
        if (!dropdown || !dropdown.classList.contains("visible")) return false;
        const first = dropdown.querySelector(".app-search-item");
        if (!first) return false;
        const name = first.dataset.name;
        hideAppSearchDropdown(); hideIntelBox();
        const app = APP_SEARCH_DATA.find(a => a.name === name);
        if (app) {
            showIntelBox(app.name, app.url);
            const sb = getEl("#searchBox");
            if (sb) sb.focus();
            let searchUrl;
            if (app.name === "AliExpress") searchUrl = app.url.replace("wholesale-", "wholesale-" + encodeURIComponent(""));
            else if (app.placeholder) searchUrl = app.url.replace(app.placeholder + "=", app.placeholder + "=" + encodeURIComponent(""));
            else searchUrl = app.url + encodeURIComponent("");
            updateHistory(`@${name}`);
            window.location.href = searchUrl;
        }
        return true;
    };

    const filterAppDropdown = () => {
        const sb = getEl("#searchBox");
        if (!sb) return;
        const val = sb.value;
        const ai = val.lastIndexOf("@");
        if (ai >= 0) {
            const after = val.substring(ai + 1);
            if (!after.includes(" ")) showAppSearchDropdown(after);
            else hideAppSearchDropdown();
        } else { hideAppSearchDropdown(); }
    };

    const performSearch = (query) => {
        const q = query.trim();
        if (!q) return;
        updateHistory(q);
        let url = "";
        switch (searchEngine) {
            case "google": url = `https://www.google.com/search?q=${encodeURIComponent(q)}`; break;
            case "bing": url = `https://www.bing.com/search?q=${encodeURIComponent(q)}`; break;
            case "yahoo": url = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(q)}`; break;
            case "duckduckgo": url = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`; break;
            case "nenara": url = `https://www.naenara.com.kp/main/search_first?sVal=${encodeURIComponent(q)}`; break;
            case "neighb": url = `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`; break;
            default: url = `https://www.google.com/search?q=${encodeURIComponent(q)}`; break;
        }
        window.location.href = url;
    };

    const showHistoryDialog = () => {
        const history = getHistory();
        const existing = document.getElementById("historyDialog");
        if (existing) existing.remove();

        const dialog = document.createElement("div");
        dialog.id = "historyDialog";

        const header = document.createElement("div");
        header.className = "dialog-header";
        const title = document.createElement("h3");
        title.textContent = "検索履歴";
        header.appendChild(title);

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.addEventListener("click", () => dialog.remove());

        const content = document.createElement("div");
        content.className = "dialog-content";

        if (history.length === 0) {
            const empty = document.createElement("p");
            empty.className = "dialog-empty";
            empty.textContent = "履歴はありません";
            content.appendChild(empty);
        } else {
            const list = document.createElement("ul");
            history.slice(-40).reverse().forEach(item => {
                const li = document.createElement("li");
                const query = typeof item === "string" ? item : item.query;
                const time = typeof item === "string" ? null : item.time;
                const dateStr = time ? formatDateTime(new Date(time)) : "";
                li.innerHTML = `<span>${query}</span><span style="color:#999;font-size:12px;white-space:nowrap">${dateStr}</span>`;
                li.addEventListener("click", () => {
                    dialog.remove();
                    if (query.startsWith("http://") || query.startsWith("https://")) window.location.href = query;
                    else performSearch(query);
                });
                list.appendChild(li);
            });
            content.appendChild(list);
        }

        content.insertBefore(header, content.firstChild);
        content.appendChild(closeBtn);
        dialog.appendChild(content);
        dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.remove(); });
        document.body.appendChild(dialog);
    };

    /* =========================================================
        Shortcut Rendering
    ========================================================= */

    const getRequiredElement = (selector) => {
        const el = document.querySelector(selector);
        if (!el) console.error(`[Shortcut] Required element not found: ${selector}`);
        return el;
    };

    const createShortcut = (link, iconMap) => {
        if (!link || typeof link !== "object") return null;
        if (!link.name || !link.url) return null;
        const anchor = document.createElement("a");
        anchor.className = "main-shortcut-item";
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";

        const box = document.createElement("div");
        box.className = "main-shortcut-box";

        const iconContainer = document.createElement("div");
        iconContainer.className = "main-shortcut-icon";
        if (link.bg) iconContainer.style.background = link.bg;

        const iconUrl = resolveIconUrl(link.icon, iconMap);
        if (iconUrl) {
            const img = document.createElement("img");
            img.src = iconUrl;
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            img.addEventListener("error", () => { console.error(`[Shortcut] Icon failed: ${link.icon}`); img.remove(); }, { once: true });
            iconContainer.appendChild(img);
        }

        box.appendChild(iconContainer);
        const name = document.createElement("span");
        name.className = "main-shortcut-name";
        name.textContent = link.name;
        anchor.appendChild(box);
        anchor.appendChild(name);

        anchor.addEventListener("mousemove", (e) => {
            const rect = box.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            box.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
        });
        anchor.addEventListener("mouseleave", () => { box.style.transform = "rotateX(0deg) rotateY(0deg)"; });

        return anchor;
    };

    const renderShortcuts = (iconMap) => {
        const root = getRequiredElement("#mainShortcuts");
        if (!root) return;
        root.replaceChildren();
        const fragment = document.createDocumentFragment();
        const categories = Array.isArray(SHORTCUT_DATA.categories) ? SHORTCUT_DATA.categories : [];
        for (const category of categories) {
            if (!category || !Array.isArray(category.links)) continue;
            const section = document.createElement("section");
            section.className = "main-shortcut-category";
            const title = document.createElement("h2");
            title.className = "main-shortcut-title";
            title.textContent = category.title || "";
            const links = document.createElement("div");
            links.className = "main-shortcut-links";
            for (const link of category.links) {
                const sc = createShortcut(link, iconMap);
                if (sc) links.appendChild(sc);
            }
            section.appendChild(title);
            section.appendChild(links);
            fragment.appendChild(section);
        }
        root.appendChild(fragment);
        console.log(`[Shortcut] Rendered ${categories.length} categories.`);
    };

    /* =========================================================
        Setup Search & History (cached DOM, event delegation)
    ========================================================= */

    const setupSearchAndHistory = () => {
        const searchBox = getEl("#searchBox");
        const searchButton = getEl("#searchButton");
        const clearHistoryBtn = getEl("#clearHistory");
        const appSearchBtn = getEl("#appSearchBtn");

        if (!searchBox) console.error("[Search] Required element not found: #searchBox");
        if (!searchButton) console.error("[Search] Required element not found: #searchButton");
        if (!clearHistoryBtn) console.error("[Search] Required element not found: #clearHistory");
        if (!appSearchBtn) console.error("[Search] Required element not found: #appSearchBtn");

        appSearchIconMap = window._iconMap || new Map();
        console.log(`[Search] Icon map ready: ${appSearchIconMap.size} item(s).`);

        if (!searchBox) return;

        searchBox.addEventListener("keydown", (e) => {
            const dropdown = getEl("#appSearchDropdown");
            const mainDropdown = getEl(`#${MAIN_SUGGESTION_ID}`);
            const isAtMode = searchBox.value.trimStart().startsWith("@");

            // @ app-search mode is completely independent.
            if (isAtMode) {
                if (e.key === "Tab") {
                    e.preventDefault();
                    const atValue = searchBox.value.trim();
                    const appQuery = atValue.slice(1).trim();
                    const matches = APP_SEARCH_DATA.filter(app => app.name.toLowerCase().startsWith(appQuery.toLowerCase()));
                    if (matches.length > 0) {
                        searchBox.value = `@${matches[0].name} `;
                        searchBox.focus();
                        hideAppSearchDropdown();
                        hideMainSuggestions("@ Tab completed");
                        console.log(`[AppSearch] Tab completed: ${searchBox.value}`);
                    } else {
                        console.log("[AppSearch] Tab: no matching app.");
                    }
                    return;
                }

                if (e.key === "Enter") {
                    e.preventDefault();
                    hideMainSuggestions("@ Enter");
                    const value = searchBox.value.trim();
                    const si = value.indexOf(" ");
                    if (si > 0) {
                        const app = searchApp(value.slice(0, si));
                        if (app) {
                            performAppSearch();
                            return;
                        }
                    }
                    const app = searchApp(value);
                    if (app) {
                        performAppSearch();
                        return;
                    }
                    performSearch(value);
                    return;
                }

                if (e.key === "Escape") {
                    e.preventDefault();
                    hideAppSearchDropdown();
                    hideMainSuggestions("Escape in @ mode");
                    hideIntelBox();
                    console.log("[AppSearch] Escape closed suggestions.");
                    return;
                }

                return;
            }

            // Normal mode: @ candidates are disabled.
            hideAppSearchDropdown();

            if (e.key === "Tab") {
                if (mainSuggestionItems.length > 0) {
                    e.preventDefault();
                    applyMainSuggestion(0, "tab");
                } else {
                    console.log("[MainSuggestion] Tab: no visible candidate.");
                }
                return;
            }

            if (e.key === "Enter") {
                const top = mainSuggestionItems[0];
                if (top?.action === "open" && top.url) {
                    e.preventDefault();
                    applyMainSuggestion(0, "enter");
                    return;
                }

                e.preventDefault();
                const value = searchBox.value.trim();
                if (!value) {
                    console.log("[Search] Enter ignored: empty query.");
                    return;
                }
                performSearch(value);
                return;
            }

            if (e.key === "Escape") {
                if ((mainDropdown && mainDropdown.style.display !== "none") || (getEl("#intelBox")?.classList.contains("visible"))) {
                    e.preventDefault();
                    hideMainSuggestions("Escape");
                    hideIntelBox();
                    console.log("[MainSuggestion] Escape closed suggestions.");
                }
                return;
            }
        });

        searchBox.addEventListener("input", () => {
            const value = searchBox.value;
            const trimmed = value.trim();

            if (trimmed.startsWith("@")) {
                hideMainSuggestions("@ mode active");
                filterAppDropdown();
                console.log(`[Search] @ mode: ${value}`);
                return;
            }

            hideAppSearchDropdown();
            scheduleMainSuggestions(trimmed);
            hideIntelBox();
            console.log(`[Search] Normal input: ${trimmed}`);
        });

        searchBox.addEventListener("focus", () => {
            const trimmed = searchBox.value.trim();
            if (trimmed.startsWith("@")) {
                filterAppDropdown();
                hideMainSuggestions("@ focus");
            } else if (trimmed) {
                scheduleMainSuggestions(trimmed);
            }
            console.log(`[Search] Focus: ${trimmed}`);
        });

        searchBox.addEventListener("blur", () => {
            // Do not auto-close. Escape is the explicit close action.
            console.log("[Search] Blur: suggestions remain available.");
        });

        const dropdownEl = getEl("#appSearchDropdown");
        if (dropdownEl) {
            dropdownEl.addEventListener("mousedown", (e) => e.preventDefault());
        } else {
            console.error("[Search] Required element not found: #appSearchDropdown");
        }

        const mainDropdown = ensureMainSuggestionDropdown();
        if (mainDropdown) {
            mainDropdown.addEventListener("mousedown", (e) => e.preventDefault());
            mainDropdown.addEventListener("click", (e) => {
                const button = e.target.closest(".app-search-item");
                if (!button || !mainDropdown.contains(button)) return;
                const index = Number(button.dataset.index);
                if (!Number.isInteger(index)) {
                    console.error("[MainSuggestion] Invalid candidate index.");
                    return;
                }
                applyMainSuggestion(index, "click");
            });
        }

        if (searchButton) {
            searchButton.addEventListener("click", () => {
                const val = searchBox.value.trim();
                if (!val) {
                    console.log("[Search] Button ignored: empty query.");
                    return;
                }
                if (val.startsWith("@")) performAppSearch();
                else {
                    const top = mainSuggestionItems[0];
                    if (top?.action === "open" && top.url) applyMainSuggestion(0, "enter");
                    else performSearch(val);
                }
            });
        }

        if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", showHistoryDialog);

        if (appSearchBtn) {
            appSearchBtn.addEventListener("click", () => {
                hideMainSuggestions("manual app-search activation");
                handleAppSearchClick();
                console.log("[AppSearch] App-search button clicked.");
            });
        }

        document.addEventListener("click", (e) => {
            const dropdown = getEl("#appSearchDropdown");
            const appBtn = getEl("#appSearchBtn");
            const mainDropdown = getEl(`#${MAIN_SUGGESTION_ID}`);

            if (dropdown && !dropdown.contains(e.target) && appBtn && !appBtn.contains(e.target) && e.target !== searchBox && !e.target.closest(".app-search-item")) {
                // Intentionally do not close on outside click. Escape closes it.
                console.log("[AppSearch] Outside click ignored; suggestions remain visible.");
            }

            if (mainDropdown && !mainDropdown.contains(e.target) && e.target !== searchBox) {
                // Intentionally do not close on outside click. Escape closes it.
                console.log("[MainSuggestion] Outside click ignored; suggestions remain visible.");
            }
        });

        console.log("[Search] Search handlers initialized.");
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
            console.error("[Shortcut] Icon init failed.", error);
            window._iconMap = new Map();
        }

        await wallpaperTask;

        if (window.renderShortcuts && window._iconMap) {
            try { window.renderShortcuts(window._iconMap); }
            catch (e) { console.error("[Beta] renderShortcuts failed:", e); if (window.renderShortcuts) window.renderShortcuts(new Map()); }
        }
        if (window.setupSearchAndHistory) window.setupSearchAndHistory();

        console.log("[Wallpaper] Initialization completed.");
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    window.renderShortcuts = renderShortcuts;
    window.setupSearchAndHistory = setupSearchAndHistory;
})();
