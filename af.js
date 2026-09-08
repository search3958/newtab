(() => {
    "use strict";

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
       Shortcut Rendering
    ========================================================= */

    const getRequiredElement = (selector) => {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`[Shortcut] Required element not found: ${selector}`);
            return null;
        }
        return element;
    };

    const createShortcut = (link, iconMap) => {
        if (!link || typeof link !== "object") {
            console.error("[Shortcut] Invalid shortcut item.", link);
            return null;
        }
        if (!link.name || !link.url) {
            console.error("[Shortcut] Shortcut requires name and url.", link);
            return null;
        }
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
            img.addEventListener("error", () => {
                console.error(`[Shortcut] Icon failed to display: ${link.icon}`);
                img.remove();
            }, { once: true });
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
        anchor.addEventListener("mouseleave", () => {
            box.style.transform = "rotateX(0deg) rotateY(0deg)";
        });

        return anchor;
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

    const renderShortcuts = (iconMap) => {
        const root = getRequiredElement("#mainShortcuts");
        if (!root) return;
        root.replaceChildren();
        const fragment = document.createDocumentFragment();
        const categories = Array.isArray(SHORTCUT_DATA.categories) ? SHORTCUT_DATA.categories : [];
        for (const category of categories) {
            if (!category || !Array.isArray(category.links)) {
                console.error("[Shortcut] Invalid category.", category);
                continue;
            }
            const section = document.createElement("section");
            section.className = "main-shortcut-category";
            const title = document.createElement("h2");
            title.className = "main-shortcut-title";
            title.textContent = category.title || "";
            const links = document.createElement("div");
            links.className = "main-shortcut-links";
            for (const link of category.links) {
                const shortcut = createShortcut(link, iconMap);
                if (shortcut) links.appendChild(shortcut);
            }
            section.appendChild(title);
            section.appendChild(links);
            fragment.appendChild(section);
        }
        root.appendChild(fragment);
        console.log(`[Shortcut] Rendered ${categories.length} categories.`);
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
        { name: "PayPayフリマ", icon: "pfm.webp", url: "https://paypayfleamarket.yahoo.co.jp/search/?page=1", placeholder: null }
    ];

    const resolveAppIconUrl = (iconName, iconMap) => {
        if (!iconName) return null;
        if (iconMap.has(iconName)) return iconMap.get(iconName);
        for (const [filename, url] of iconMap) {
            if (filename.endsWith("/" + iconName) || filename.endsWith("\\" + iconName)) return url;
        }
        return null;
    };

    let appSearchIconMap = null;

    const showAppSearchDropdown = (query) => {
        const dropdown = document.getElementById("appSearchDropdown");
        if (!dropdown) return;
        const filtered = query
            ? APP_SEARCH_DATA.filter(app => app.name.toLowerCase().includes(query.toLowerCase()))
            : APP_SEARCH_DATA;
        if (filtered.length === 0) {
            dropdown.innerHTML = '<div style="padding:12px;text-align:center;color:#999;font-size:14px">該当するアプリが見つかりません</div>';
        } else {
            dropdown.innerHTML = filtered.map(app => {
                const iconUrl = resolveAppIconUrl(app.icon, appSearchIconMap);
                const iconHtml = iconUrl
                    ? `<div class="app-search-item-icon"><img src="${iconUrl}" alt="${app.name}"></div>`
                    : `<div class="app-search-item-icon" style="background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:16px">${app.name[0]}</div>`;
                return `<div class="app-search-item" data-url="${app.url}" data-name="${app.name}" data-placeholder="${app.placeholder || ''}">${iconHtml}<span class="app-search-item-name">${app.name}</span><span class="app-search-item-url">${app.url.replace(/=$/, "")}…</span></div>`;
            }).join("");
        }
        dropdown.classList.add("visible");
        dropdown.querySelectorAll(".app-search-item").forEach(item => {
            item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                const name = item.dataset.name;
                const searchBox = document.getElementById("searchBox");
                if (searchBox) {
                    searchBox.value = `@${name} `;
                    hideAppSearchDropdown();
                    searchBox.focus();
                }
            });
        });
    };

    const hideAppSearchDropdown = () => {
        const dropdown = document.getElementById("appSearchDropdown");
        if (dropdown) dropdown.classList.remove("visible");
    };

    const handleAppSearchClick = () => {
        const searchBox = document.getElementById("searchBox");
        if (!searchBox) return;
        const val = searchBox.value;
        if (val === "") {
            searchBox.value = "@";
            searchBox.focus();
            showAppSearchDropdown("");
        } else if (val === "@") {
            searchBox.value = "";
            hideAppSearchDropdown();
        } else if (val.startsWith("@")) {
            const spaceIdx = val.indexOf(" ");
            if (spaceIdx > 0) {
                searchBox.value = val.substring(0, spaceIdx);
            } else {
                searchBox.value = "";
            }
            hideAppSearchDropdown();
        } else {
            searchBox.value = val + "@";
            searchBox.focus();
            showAppSearchDropdown("");
        }
    };

    const filterAppDropdown = () => {
        const searchBox = document.getElementById("searchBox");
        if (!searchBox) return;
        const val = searchBox.value;
        const atIndex = val.lastIndexOf("@");
        if (atIndex >= 0 && searchBox.selectionStart === val.length) {
            const afterAt = val.substring(atIndex + 1);
            if (afterAt.includes(" ")) {
                hideAppSearchDropdown();
            } else {
                showAppSearchDropdown(afterAt);
            }
        } else {
            hideAppSearchDropdown();
        }
    };

    const performAppSearch = () => {
        const searchBox = document.getElementById("searchBox");
        if (!searchBox) return;
        const val = searchBox.value.trim();
        if (!val.startsWith("@")) return;
        const parts = val.substring(1).split(/\s+/);
        const appName = parts[0];
        const query = parts.slice(1).join(" ");
        const app = APP_SEARCH_DATA.find(a => a.name === appName);
        if (app) {
            hideAppSearchDropdown();
            let searchUrl;
            if (app.name === "AliExpress") {
                searchUrl = app.url.replace("wholesale-", "wholesale-" + encodeURIComponent(query || ""));
            } else if (app.placeholder) {
                searchUrl = app.url.replace(app.placeholder + "=", app.placeholder + "=" + encodeURIComponent(query || ""));
            } else {
                searchUrl = app.url + encodeURIComponent(query || "");
            }
            updateHistory(`@${appName} ${query}`.trim());
            window.location.href = searchUrl;
        }
    };

    const selectFirstDropdownItem = () => {
        const dropdown = document.getElementById("appSearchDropdown");
        if (!dropdown || !dropdown.classList.contains("visible")) return false;
        const firstItem = dropdown.querySelector(".app-search-item");
        if (firstItem) {
            const name = firstItem.dataset.name;
            const searchBox = document.getElementById("searchBox");
            if (searchBox) {
                searchBox.value = `@${name} `;
                hideAppSearchDropdown();
                searchBox.focus();
            }
            return true;
        }
        return false;
    };

/* =========================================================
        Search & History
    ========================================================= */

    let searchEngine = "google";

    const setSearchEngine = (engine) => { searchEngine = engine; };

    const formatDateTime = (date) => {
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const h = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return `${m}.${d} ${h}:${min}`;
    };

    const updateHistory = (query) => {
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        history.unshift({ query, time: Date.now() });
        if (history.length > 40) history.length = 40;
        localStorage.setItem("searchHistory", JSON.stringify(history));
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
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
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
            const displayHistory = history.slice(-40).reverse();
            const list = document.createElement("ul");
            displayHistory.forEach((item) => {
                const li = document.createElement("li");
                const query = typeof item === "string" ? item : item.query;
                const time = typeof item === "string" ? null : item.time;
                const dateStr = time ? formatDateTime(new Date(time)) : "";
                li.innerHTML = `<span>${query}</span><span style="color:#999;font-size:12px;white-space:nowrap">${dateStr}</span>`;
                li.addEventListener("click", () => {
                    dialog.remove();
                    if (query.startsWith("http://") || query.startsWith("https://")) {
                        window.location.href = query;
                    } else {
                        performSearch(query);
                    }
                });
                list.appendChild(li);
            });
            content.appendChild(list);
        }

        content.insertBefore(header, content.firstChild);
        content.appendChild(closeBtn);
        dialog.appendChild(content);

        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) dialog.remove();
        });

        document.body.appendChild(dialog);
    };

    const setupSearchAndHistory = () => {
        const searchBox = document.getElementById("searchBox");
        const searchButton = document.getElementById("searchButton");
        const clearHistoryBtn = document.getElementById("clearHistory");
        const appSearchBtn = document.getElementById("appSearchBtn");

        appSearchIconMap = window._iconMap || new Map();

        if (appSearchBtn) {
            appSearchBtn.addEventListener("click", handleAppSearchClick);
        }

        if (searchBox) {
            searchBox.addEventListener("keydown", (e) => {
                const dropdown = document.getElementById("appSearchDropdown");
                if (dropdown && dropdown.classList.contains("visible")) {
                    if (e.key === "Enter" || e.key === "Tab") {
                        e.preventDefault();
                        selectFirstDropdownItem();
                    }
                }
            });

            searchBox.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    const val = searchBox.value.trim();
                    if (val.startsWith("@")) {
                        performAppSearch();
                    } else {
                        performSearch(val);
                    }
                }
            });

            searchBox.addEventListener("input", () => {
                filterAppDropdown();
            });

            searchBox.addEventListener("focus", () => {
                const val = searchBox.value;
                const atIndex = val.lastIndexOf("@");
                if (atIndex >= 0 && searchBox.selectionStart === val.length) {
                    const afterAt = val.substring(atIndex + 1);
                    if (!afterAt.includes(" ")) {
                        showAppSearchDropdown(afterAt);
                    }
                }
            });

            searchBox.addEventListener("blur", () => {
                setTimeout(() => {
                    if (!document.getElementById("appSearchDropdown")?.matches(":hover")) {
                        hideAppSearchDropdown();
                    }
                }, 200);
            });

            const dropdown = document.getElementById("appSearchDropdown");
            if (dropdown) {
                dropdown.addEventListener("mousedown", (e) => e.preventDefault());
            }
        }

        if (searchButton) {
            searchButton.addEventListener("click", () => {
                const val = searchBox?.value || "";
                if (val.trim().startsWith("@")) {
                    performAppSearch();
                } else {
                    performSearch(val);
                }
            });
        }

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener("click", showHistoryDialog);
        }

        document.addEventListener("click", (e) => {
            const dropdown = document.getElementById("appSearchDropdown");
            const appBtn = document.getElementById("appSearchBtn");
            if (dropdown && !dropdown.contains(e.target) && appBtn && !appBtn.contains(e.target) && e.target !== searchBox && !e.target.closest(".app-search-item")) {
                hideAppSearchDropdown();
            }
        });
    };

    /* =========================================================
       Expose to global scope for beta.js
    ========================================================= */

    window.renderShortcuts = renderShortcuts;
    window.setupSearchAndHistory = setupSearchAndHistory;
})();
