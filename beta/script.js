const HISTORY_KEY = 'shortcut_history';
const MAX_HISTORY = 4;
let isAppSearchMode = !1;
let linksData = null;
const DEFAULT_ITEMS = [{
    name: "TechPick 10",
    url: "https://search3958.github.io/techpick10/",
    icon: "techpick10.webp",
    bg: "rgba(255,255,255,0.759)"
}, {
    name: "Gmail",
    url: "https://mail.google.com/",
    icon: "gmail.webp",
    bg: "var(--iconbg)"
}, {
    name: "Search3958",
    url: "https://search3958.github.io",
    icon: "3958.webp",
    bg: "var(--iconbg)"
}, {
    name: "Tools",
    url: "https://search3958.github.io/tools",
    icon: "tools.webp",
    bg: "var(--iconbg)"
}];
const domCache = {
    searchInputBox: null,
    appSwitchIcon: null,
    bottomBar: null,
    shortcuts: null,
    bg: null,
    historyContainer: null
};
const iconsMap = {};
let iconsReady = !1;
const iconWaiters = [];

function cacheDOMElements() {
    domCache.searchInputBox = document.querySelector('.searchinput') || document.getElementById('mainSearchInput');
    domCache.appSwitchIcon = document.querySelector('.appswitchicon');
    domCache.bottomBar = document.querySelector('.bottombar');
    domCache.shortcuts = document.querySelector('.shortcuts');
    domCache.bg = document.querySelector('.bg');
    domCache.historyContainer = document.querySelector('.shortcuthistory');
}

function initializeDefaultHistory() {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_ITEMS));
    }
}

function saveToHistory(linkData) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history = history.filter(item => item.url !== linkData.url);
    history.unshift(linkData);
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (!domCache.historyContainer) return;
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) {
        history = DEFAULT_ITEMS;
    }
    const fragment = document.createDocumentFragment();
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'history-icon-wrapper';
        iconWrapper.style.backgroundColor = item.bg;
        const img = document.createElement('img');
        img.className = 'history-icon';
        img.src = iconsMap[item.icon] || 'data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="%23ccc"/><text x="50%" y="50%" font-size="12" text-anchor="middle" fill="%23666" dy=".3em">NoIcon</text></svg>';
        img.alt = item.name;
        img.loading = 'lazy';
        iconWrapper.appendChild(img);
        historyItem.appendChild(iconWrapper);
        historyItem.addEventListener('click', () => {
            saveToHistory(item);
            window.location.href = item.url;
        });
        fragment.appendChild(historyItem);
    });
    domCache.historyContainer.innerHTML = '';
    domCache.historyContainer.appendChild(fragment);
}

function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.add('show');
    const currentBg = document.body.style.backgroundImage;
    const urlMatch = currentBg.match(/url\(['"]?([^'"]+)['"]?\)/);
    const wallpaperInput = document.getElementById('wallpaper-input');
    if (urlMatch && wallpaperInput) {
        wallpaperInput.value = urlMatch[1];
    }
}

function hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.remove('show');
}

function setupModalEventListeners() {
    const closeSettingsBtn = document.querySelector('.close-settings');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', hideSettingsModal);
    }
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                hideSettingsModal();
            }
        });
    }
    const applyWallpaperBtn = document.getElementById('apply-wallpaper');
    if (applyWallpaperBtn) {
        applyWallpaperBtn.addEventListener('click', () => {
            const wallpaperUrl = document.getElementById('wallpaper-input').value.trim();
            if (wallpaperUrl) {
                document.body.style.backgroundImage = `url('${wallpaperUrl}')`;
                localStorage.setItem('custom_wallpaper', wallpaperUrl);
            } else {
                document.body.style.backgroundImage = "url('bgimg/liquidglass1.webp')";
                localStorage.removeItem('custom_wallpaper');
            }
        });
    }
}
let searchCache = new Map();

function searchAppAndDisplay() {
    if (!domCache.searchInputBox || !domCache.appSwitchIcon || !linksData) return;
    const query = domCache.searchInputBox.value.trim().toLowerCase();
    if (query.length === 0) {
        domCache.appSwitchIcon.style.backgroundImage = 'none';
        domCache.appSwitchIcon.classList.remove('show');
        return;
    }
    if (searchCache.has(query)) {
        const foundApp = searchCache.get(query);
        if (foundApp) {
            showAppIcon(foundApp);
        } else {
            hideAppIcon();
        }
        return;
    }
    let foundApp = null;
    outer: for (const category of linksData.categories) {
        for (const link of category.links) {
            if (link.name.toLowerCase().includes(query)) {
                foundApp = link;
                break outer;
            }
        }
    }
    searchCache.set(query, foundApp);
    if (foundApp) {
        showAppIcon(foundApp);
    } else {
        hideAppIcon();
    }
}

function showAppIcon(app) {
    const iconUrl = iconsMap[app.icon];
    if (iconUrl) {
        domCache.appSwitchIcon.style.backgroundImage = `url('${iconUrl}')`;
        domCache.appSwitchIcon.style.backgroundSize = 'cover';
        domCache.appSwitchIcon.style.backgroundPosition = 'center';
        domCache.appSwitchIcon.classList.add('show');
    }
}

function hideAppIcon() {
    domCache.appSwitchIcon.style.backgroundImage = 'none';
    domCache.appSwitchIcon.classList.remove('show');
}

function performSearch() {
    if (!domCache.searchInputBox) return;
    const query = domCache.searchInputBox.value.trim();
    if (!query) return;
    if (isAppSearchMode) {
        let foundApp = searchCache.get(query.toLowerCase()) || null;
        if (!foundApp) {
            outer: for (const category of linksData.categories) {
                for (const link of category.links) {
                    if (link.name.toLowerCase().includes(query.toLowerCase())) {
                        foundApp = link;
                        break outer;
                    }
                }
            }
        }
        if (foundApp) {
            saveToHistory(foundApp);
            window.location.href = foundApp.url;
        } else {
            const chatgptUrl = `https://chatgpt.com/?hints=search&openaicom_referred=true&prompt=${encodeURIComponent(query)}`;
            window.location.href = chatgptUrl;
        }
    } else {
        const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
        if (window.saveSearchHistory) {
            window.saveSearchHistory(query);
        }
        window.location.href = url;
    }
}
let scrollTimeout;

function handleScroll() {
    if (scrollTimeout) return;
    scrollTimeout = requestAnimationFrame(() => {
        if (domCache.shortcuts && domCache.bg && domCache.bottomBar) {
            if (window.scrollY >= 1) {
                domCache.shortcuts.classList.add('show');
                domCache.bottomBar.classList.add('top');
                domCache.bg.classList.add('show');
            } else {
                domCache.shortcuts.classList.remove('show');
                domCache.bottomBar.classList.remove('top');
                domCache.bg.classList.remove('show');
            }
        }
        scrollTimeout = null;
    });
}
async function loadIconsZip() {
    try {
        if (typeof JSZip === 'undefined') {
            console.error("JSZipが読み込まれていません。アイコンの読み込みをスキップします。");
            return;
        }
        const zipUrl = 'https://search3958.github.io/newtab/lsr/icons-4-5.zip';
        const res = await fetch(zipUrl);
        if (!res.ok) throw new Error(`Failed to fetch icons-4-5.zip:${res.status}`);
        const blob = await res.blob();
        const zip = await JSZip.loadAsync(blob);
        const tasks = [];
        zip.forEach((relativePath, file) => {
            if (file.name.endsWith('.webp')) {
                const task = file.async('blob').then(blobData => {
                    const objectURL = URL.createObjectURL(blobData);
                    const fileName = file.name.split('/').pop();
                    iconsMap[fileName] = objectURL;
                });
                tasks.push(task);
            }
        });
        await Promise.all(tasks);
        iconsReady = !0;
        iconWaiters.forEach(fn => fn());
        updateHistoryDisplay();
    } catch (error) {
        console.error("アイコンzipの読み込みに失敗しました:", error);
    }
}
async function loadIconsAndGenerateLinks() {
    if (!iconsReady) {
        await new Promise(resolve => iconWaiters.push(resolve));
    }
    try {
        const res = await fetch('links.json');
        linksData = await res.json();
        if (!domCache.shortcuts) return;
        const fragment = document.createDocumentFragment();
        linksData.categories.forEach(category => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'linkbg';
            const titleDiv = document.createElement('div');
            titleDiv.className = 'linktext';
            titleDiv.textContent = category.title;
            groupDiv.appendChild(titleDiv);
            const linksDiv = document.createElement('div');
            linksDiv.className = 'links';
            category.links.forEach(link => {
                const a = document.createElement('a');
                a.className = 'linkbox-anchor';
                a.href = link.url;
                a.rel = 'noopener noreferrer';
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    saveToHistory(link);
                    window.location.href = link.url;
                });
                const box = document.createElement('div');
                box.className = 'linkbox';
                const iconWrapper = document.createElement('div');
                iconWrapper.className = 'icon-wrapper';
                iconWrapper.style.backgroundColor = link.bg;
                const ripple = document.createElement('md-ripple');
                iconWrapper.appendChild(ripple);
                const img = document.createElement('img');
                img.className = 'linkbox-img';
                img.src = iconsMap[link.icon] || 'data:image/svg+xml;utf8,<svg width="110" height="110" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="110" fill="%23ccc"/><text x="50%" y="50%" font-size="18" text-anchor="middle" fill="%23666" dy=".3em">NoIcon</text></svg>';
                img.alt = link.name;
                img.loading = 'lazy';
                iconWrapper.appendChild(img);
                let mouseTimeout;
                iconWrapper.addEventListener('mousemove', e => {
                    if (mouseTimeout) return;
                    mouseTimeout = requestAnimationFrame(() => {
                        const box = iconWrapper.getBoundingClientRect();
                        const mouseX = e.clientX - box.left;
                        const mouseY = e.clientY - box.top;
                        const rotateY = ((mouseX - box.width / 2) / (box.width / 2)) * 15;
                        const rotateX = ((mouseY - box.height / 2) / (box.height / 2)) * -15;
                        const moveX = ((mouseX - box.width / 2) / (box.width / 2)) * 10;
                        const moveY = ((mouseY - box.height / 2) / (box.height / 2)) * 10;
                        iconWrapper.style.setProperty('--rotateX', `${rotateX}deg`);
                        iconWrapper.style.setProperty('--rotateY', `${rotateY}deg`);
                        iconWrapper.style.setProperty('--moveX', `${moveX}px`);
                        iconWrapper.style.setProperty('--moveY', `${moveY}px`);
                        img.style.setProperty('--moveX', `${moveX * 1.2}px`);
                        img.style.setProperty('--moveY', `${moveY * 1.2}px`);
                        mouseTimeout = null;
                    });
                });
                iconWrapper.addEventListener('mouseleave', () => {
                    iconWrapper.style.setProperty('--rotateX', '0deg');
                    iconWrapper.style.setProperty('--rotateY', '0deg');
                    iconWrapper.style.setProperty('--moveX', '0px');
                    iconWrapper.style.setProperty('--moveY', '0px');
                    img.style.setProperty('--moveX', '0px');
                    img.style.setProperty('--moveY', '0px');
                });
                const label = document.createElement('div');
                label.className = 'linkbox-label';
                label.textContent = link.name;
                box.appendChild(iconWrapper);
                box.appendChild(label);
                a.appendChild(box);
                linksDiv.appendChild(a);
            });
            if (category.title === 'ショッピング') {
                linksDiv.insertAdjacentHTML('beforeend', ` <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874" crossorigin="anonymous">\<\/script\> <ins class="adsbygoogle" style="display:inline-block;width:244px;height:110px;margin:0px;" data-ad-client="ca-pub-6151036058675874" data-ad-slot="2788469305"></ins> <script>(adsbygoogle = window.adsbygoogle || []).push({});\<\/script\> `);
            }
            groupDiv.appendChild(linksDiv);
            fragment.appendChild(groupDiv);
        });
        domCache.shortcuts.innerHTML = '';
        domCache.shortcuts.appendChild(fragment);
        const allImages = domCache.shortcuts.querySelectorAll('img');
        let loadedCount = 0;
        const totalImages = allImages.length;
        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount >= totalImages) {
                setTimeout(() => {
                    if (domCache.bottomBar) {
                        domCache.bottomBar.classList.add('show');
                    }
                }, 100);
            }
        };
        allImages.forEach(img => {
            if (img.complete) {
                checkAllLoaded();
            } else {
                img.addEventListener('load', checkAllLoaded);
                img.addEventListener('error', checkAllLoaded);
            }
        });
        if (totalImages === 0) {
            if (domCache.bottomBar) {
                domCache.bottomBar.classList.add('show');
            }
        }
        loadLiquidJS();
        loadMaterialWeb();
    } catch (e) {
        console.error('アプリアイコンリストの取得に失敗:', e);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    cacheDOMElements();
    if (domCache.shortcuts) {
        domCache.shortcuts.classList.remove('show');
    }
    initializeDefaultHistory();
    const savedWallpaper = localStorage.getItem('custom_wallpaper');
    if (savedWallpaper) {
        document.body.style.backgroundImage = `url('${savedWallpaper}')`;
    }
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsModal);
    }
    const appSwitchBtn = document.querySelector('.appswitch');
    const pulseBtn = document.querySelector('#pulse');
    if (appSwitchBtn && domCache.searchInputBox) {
        appSwitchBtn.addEventListener('click', () => {
            isAppSearchMode = !isAppSearchMode;
            if (isAppSearchMode) {
                domCache.searchInputBox.placeholder = "アプリ&AI";
                if (pulseBtn) pulseBtn.click();
                searchAppAndDisplay();
            } else {
                domCache.searchInputBox.placeholder = "検索";
                if (domCache.appSwitchIcon) {
                    domCache.appSwitchIcon.style.backgroundImage = 'none';
                }
            }
            domCache.searchInputBox.focus();
        });
    }
    if (domCache.searchInputBox) {
        domCache.searchInputBox.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        let inputTimeout;
        domCache.searchInputBox.addEventListener('input', () => {
            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                if (isAppSearchMode) {
                    searchAppAndDisplay();
                }
            }, 100);
        });
    }
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
    const searchButton = document.querySelector('.searchbutton');
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
    window.addEventListener('scroll', handleScroll, {
        passive: !0
    });
    Promise.all([loadIconsZip()]).then(() => {
        loadIconsAndGenerateLinks();
        updateHistoryDisplay();
        setupModalEventListeners();
    });
});

function loadLiquidJS() {
    if (window.liquidLoaded) return;
    const script = document.createElement('script');
    script.src = 'beta/liquid.js';
    script.onload = () => {
        window.liquidLoaded = !0;
    };
    document.body.appendChild(script);
}
async function loadMaterialWeb() {
    await import('@material/web/ripple/ripple.js');
    const {
        styles: typescaleStyles
    } = await import('@material/web/typography/md-typescale-styles.js');
    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
    console.log("Material Web modules loaded");
}


const SEARCH_HISTORY_KEY = 'search_history';
const MAX_SEARCH_HISTORY = 3;
const HISTORY_COLLECTION = 'newtab-history';
const SEARCH_HISTORY_DOCUMENT_ID = 'search_history_compressed';
const HISTORY_DOCUMENT_ID = 'shortcut_history_compressed';
const TEST_DOCUMENT_ID = 'test';
const TEST_RAW_DATA = 'これはFirestoreの/newtab-history/testに保存されるテストデータです。圧縮されて保存されます。';
const firebaseConfig = {
    apiKey: "AIzaSyAYSzOAmqY_IJCEUNb-cJNQfp4AKt93a_A",
    authDomain: "couud-dashboard.firebaseapp.com",
    databaseURL: "https://couud-dashboard-default-rtdb.firebaseio.com",
    projectId: "couud-dashboard",
    storageBucket: "couud-dashboard.appspot.com",
    messagingSenderId: "163996109972",
    appId: "1:163996109972:web:e806be3a622a4da2a33881",
    measurementId: "G-XCX2C68FM6"
};
let auth;
let db;
let currentUser = null;
let pakoLoaded = !1;

function loadPakoScript() {
    return new Promise((resolve) => {
        if (typeof pako !== 'undefined') {
            pakoLoaded = !0;
            return resolve();
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js';
        script.onload = () => {
            pakoLoaded = !0;
            console.log("pakoライブラリを読み込みました。");
            resolve();
        };
        script.onerror = () => {
            console.error("pakoライブラリの読み込みに失敗しました。");
            resolve();
        };
        document.head.appendChild(script);
    });
}
async function compressData(data) {
    const uint8Array = new TextEncoder().encode(data);
    if (window.CompressionStream) {
        try {
            const stream = new Blob([uint8Array]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
            const compressedBlob = await new Response(compressedStream).blob();
            console.log(`Compression:Native Deflateを使用しました。`);
            return new Uint8Array(await compressedBlob.arrayBuffer());
        } catch (e) {
            console.warn(`Compression:Native Deflateが失敗しました。pako(gzip)にフォールバックします。エラー:${e.message}`);
        }
    }
    if (pakoLoaded) {
        try {
            const compressed = pako.gzip(uint8Array);
            console.log(`Compression:pako(gzip)を使用しました。`);
            return compressed;
        } catch (e) {
            console.error("Compression:pakoによる圧縮に失敗しました。非圧縮データを返します:", e);
        }
    }
    console.warn('Compression:圧縮機能が利用できませんでした。非圧縮データを返します。');
    return uint8Array;
}
async function decompressData(compressedData) {
    if (window.DecompressionStream) {
        const blob = new Blob([compressedData]);
        const stream = blob.stream();
        try {
            const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate'));
            const decompressedText = await new Response(decompressedStream).text();
            console.log(`Decompression:Native Deflateを使用しました。`);
            return decompressedText;
        } catch (e) {
            console.warn(`Decompression:Native Deflateが失敗しました。pako(gzip)にフォールバックを試みます。エラー:${e.message}`);
        }
    }
    if (pakoLoaded) {
        try {
            const result = pako.ungzip(compressedData, {
                to: 'string'
            });
            console.log(`Decompression:pako(gzip/deflate)を使用しました。`);
            return result;
        } catch (e) {
            console.warn("Decompression:pakoによる解凍に失敗しました。データを非圧縮としてデコードします。", e);
        }
    }
    console.warn('Decompression:解凍機能が利用できませんでした。非圧縮データとしてデコードを試みます。');
    return new TextDecoder().decode(compressedData);
}

function getShortTimestamp() {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + month + day;
}

function loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            console.log("Firebase SDKは既に読み込まれています。");
            return resolve();
        }
        const sdkUrls = ['https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js', 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js'];
        const loadScript = (url) => {
            return new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = url;
                script.defer = true;
                script.onload = res;
                script.onerror = () => {
                    console.error(`Firebase SDKの読み込みに失敗しました:${url}`);
                    rej(new Error(`Failed to load Firebase script:${url}`));
                };
                document.head.appendChild(script);
            });
        };
        loadScript(sdkUrls[0]).then(() => loadScript(sdkUrls[1])).then(() => loadScript(sdkUrls[2])).then(() => {
            console.log("Firebase SDKの動的読み込みが完了しました。");
            resolve();
        }).catch(reject);
    });
}

function updateAuthStatusDisplay(user) {
    const loginMessage = document.getElementById('loginMessage');
    const loggedinMessage = document.getElementById('loggedinMessage');
    if (user) {
        if (loginMessage) loginMessage.classList.add('hide');
        if (loggedinMessage) loggedinMessage.classList.remove('hide');
        console.log("ログイン済み");
    } else {
        if (loginMessage) loginMessage.classList.remove('hide');
        if (loggedinMessage) loggedinMessage.classList.add('hide');
        console.log("まだログインしていません");
    }
}
async function initializeFirebaseAndMonitorAuth() {
    try {
        await loadFirebaseScripts();
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        auth.onAuthStateChanged(async (user) => {
            currentUser = user;
            updateAuthStatusDisplay(user);
            if (user) {
                console.log("Firebase:ユーザーログイン済み. UID:", user.uid);
            } else {
                console.log("Firebase:ユーザーログアウト済み.");
            }
        });
    } catch (error) {
        console.error("Firebaseの初期化または読み込みに失敗しました:", error);
        updateAuthStatusDisplay(null);
    }
}
window.saveSearchHistory = function(query) {
    if (!query || query.trim() === '') return;
    let searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    searchHistory = searchHistory.filter(item => item !== query.trim());
    searchHistory.unshift(query.trim());
    if (searchHistory.length > MAX_SEARCH_HISTORY) {
        searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
    }
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
};

function updateSearchHistoryList() {
    const container = document.getElementById('searchhistory-list');
    if (!container) return;
    const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    container.innerHTML = '';
    if (searchHistory.length === 0) {
        container.innerHTML = '<div class="empty-message">検索履歴がありません</div>';
        return;
    }
    const fragment = document.createDocumentFragment();
    searchHistory.forEach((query) => {
        const link = document.createElement('a');
        link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        link.textContent = query;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.addEventListener('click', () => {
            window.saveSearchHistory(query);
        });
        fragment.appendChild(link);
    });
    container.appendChild(fragment);
}

function showSearchHistory() {
    const panel = document.getElementById('search-history-panel');
    if (!panel) return;
    panel.classList.add('show');
    updateSearchHistoryList();
}

function hideSearchHistory() {
    const panel = document.getElementById('search-history-panel');
    if (!panel) return;
    panel.classList.remove('show');
}

function updateSearchHistoryDisplay() {
    const container = document.querySelector('.search-history-list');
    if (!container) return;
    const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    container.innerHTML = '';
    if (searchHistory.length === 0) {
        container.innerHTML = '<p style="color:#666;font-style:italic;">検索履歴がありません</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    searchHistory.forEach((query, index) => {
        const item = document.createElement('div');
        item.className = 'search-history-item';
        item.innerHTML = ` <span>${query}</span> <button class="delete-search-item" data-index="${index}">削除</button> `;
        item.querySelector('.delete-search-item').addEventListener('click', () => {
            const currentHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
            currentHistory.splice(index, 1);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(currentHistory));
            updateSearchHistoryDisplay();
            updateSearchHistoryList();
        });
        fragment.appendChild(item);
    });
    container.appendChild(fragment);
}
async function saveSearchHistoryToFirestore() {
    if (!currentUser || !db) return;
    try {
        const searchHistoryData = localStorage.getItem(SEARCH_HISTORY_KEY) || '[]';
        const compressedData = await compressData(searchHistoryData);
        const base64Data = btoa(String.fromCharCode(...compressedData));
        const shortTimestamp = getShortTimestamp();
        await db.collection(HISTORY_COLLECTION).doc(currentUser.uid).set({
            [SEARCH_HISTORY_DOCUMENT_ID]: base64Data,
            searchTimestamp: shortTimestamp
        }, {
            merge: !0
        });
        console.log(`Firestore:検索履歴をユーザー ${currentUser.uid}に圧縮保存しました(Timestamp:${shortTimestamp})。`);
    } catch (error) {
        console.error("Firestoreへの検索履歴保存に失敗しました:", error);
    }
}
async function restoreSearchHistoryFromFirestore() {
    if (!currentUser || !db) return;
    try {
        const docRef = db.collection(HISTORY_COLLECTION).doc(currentUser.uid);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            const base64Data = data[SEARCH_HISTORY_DOCUMENT_ID];
            if (base64Data) {
                const binaryString = atob(base64Data);
                const compressedData = Uint8Array.from(binaryString, c => c.charCodeAt(0));
                const decompressedHistory = await decompressData(compressedData);
                localStorage.setItem(SEARCH_HISTORY_KEY, decompressedHistory);
                console.log(`Firestore:検索履歴をユーザー ${currentUser.uid}から復元しました。`);
                updateSearchHistoryList();
            } else {
                console.log("Firestore:検索履歴のデータフィールドが見つかりませんでした。");
            }
        } else {
            console.log("Firestore:ユーザーの検索履歴ドキュメントが見つかりませんでした。");
        }
    } catch (error) {
        console.error("Firestoreからの検索履歴復元に失敗しました:", error);
    }
}
async function saveHistoryToFirestore() {
    if (!currentUser || !db) return;
    try {
        const historyData = localStorage.getItem('shortcut_history') || '[]';
        const compressedData = await compressData(historyData);
        const base64Data = btoa(String.fromCharCode(...compressedData));
        const shortTimestamp = getShortTimestamp();
        await db.collection(HISTORY_COLLECTION).doc(currentUser.uid).set({
            [HISTORY_DOCUMENT_ID]: base64Data,
            historyTimestamp: shortTimestamp
        }, {
            merge: !0
        });
        console.log(`Firestore:ショートカット履歴をユーザー ${currentUser.uid}に圧縮保存しました(Timestamp:${shortTimestamp})。`);
    } catch (error) {
        console.error("Firestoreへのショートカット履歴保存に失敗しました:", error);
    }
}
async function restoreHistoryFromFirestore() {
    if (!currentUser || !db) return;
    try {
        const docRef = db.collection(HISTORY_COLLECTION).doc(currentUser.uid);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            const base64Data = data[HISTORY_DOCUMENT_ID];
            if (base64Data) {
                const binaryString = atob(base64Data);
                const compressedData = Uint8Array.from(binaryString, c => c.charCodeAt(0));
                const decompressedHistory = await decompressData(compressedData);
                localStorage.setItem('shortcut_history', decompressedHistory);
                console.log(`Firestore:ショートカット履歴をユーザー ${currentUser.uid}から復元しました。`);
                if (typeof updateHistoryDisplay === 'function') {
                    updateHistoryDisplay();
                }
            } else {
                console.log("Firestore:ショートカット履歴のデータフィールドが見つかりませんでした。");
            }
        } else {
            console.log("Firestore:ユーザーのショートカット履歴ドキュメントが見つかりませんでした。");
        }
    } catch (error) {
        console.error("Firestoreからのショートカット履歴復元に失敗しました:", error);
    }
}

function manualBackupHistory() {
    if (!currentUser) {
        alert("Firebaseにログインしていません。ログイン後に実行してください。");
        return;
    }
    saveSearchHistoryToFirestore();
    saveHistoryToFirestore();
    alert("履歴のバックアップを開始しました。\nコンソールを確認してください。");
}

function manualRestoreHistory() {
    if (!currentUser) {
        alert("Firebaseにログインしていません。ログイン後に実行してください。");
        return;
    }
    restoreSearchHistoryFromFirestore();
    restoreHistoryFromFirestore();
    alert("履歴の復元を開始しました。\n復元後、ページをリロードするとショートカットが更新されます。");
}
async function saveCompressedTestToFirestore() {
    if (!db) {
        console.error("Firestoreが初期化されていません。");
        return;
    }
    try {
        const compressedData = await compressData(TEST_RAW_DATA);
        console.log(`オリジナルデータのサイズ:${new TextEncoder().encode(TEST_RAW_DATA).length}bytes`);
        console.log(`圧縮後データのサイズ:${compressedData.length}bytes`);
        const base64Data = btoa(String.fromCharCode(...compressedData));
        await db.collection(HISTORY_COLLECTION).doc(TEST_DOCUMENT_ID).set({
            compressed_data: base64Data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            original_size: new TextEncoder().encode(TEST_RAW_DATA).length
        }, {
            merge: true
        });
        console.log(`✅ Firestoreにデータが保存されました。パス:${HISTORY_COLLECTION}/${TEST_DOCUMENT_ID}`);
    } catch (error) {
        console.error("Firestoreへの圧縮データ保存に失敗しました:", error);
    }
}(function() {
    const wrappers = document.querySelectorAll('.metaBall');
    let animationId;

    function syncLinkedBalls() {
        wrappers.forEach(metaBall => {
            const linked = document.getElementById('linkedBalls-' + metaBall.id);
            if (!linked) return;
            const rect = metaBall.getBoundingClientRect();
            const offset = 4;
            linked.style.cssText = ` width:${rect.width - offset}px;height:${rect.height - offset}px;left:${rect.left + offset/2}px;top:${rect.top + offset/2}px;position:fixed;line-height:${rect.height - offset}px;`;
            if (metaBall.classList.contains('hide')) {
                linked.classList.add('hide');
            } else {
                linked.classList.remove('hide');
            }
        });
    }
    window.addEventListener('resize', syncLinkedBalls);

    function syncLoop() {
        syncLinkedBalls();
        animationId = requestAnimationFrame(syncLoop);
    }
    syncLoop();
    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const container = document.querySelector('.metaballcontainer');
            if (searchInput.value.length > 0) {
                wrappers.forEach(metaBall => metaBall.classList.add('hide'));
                if (container) container.classList.add('hide');
            } else {
                wrappers.forEach(metaBall => metaBall.classList.remove('hide'));
                if (container) container.classList.remove('hide');
            }
            syncLinkedBalls();
        });
    }
    wrappers.forEach(metaBall => {
        let mouseTimeout;
        metaBall.addEventListener('mousemove', () => {
            if (mouseTimeout) return;
            mouseTimeout = requestAnimationFrame(() => {
                syncLinkedBalls();
                mouseTimeout = null;
            });
        });
        metaBall.addEventListener('mouseleave', syncLinkedBalls);
    });
    syncLinkedBalls();
})();

function setupExtendedEventListeners() {
    const historyBtn = document.querySelector('.history');
    if (historyBtn) {
        historyBtn.addEventListener('click', showSearchHistory);
    }
    const closeHistoryBtn = document.querySelector('.close-history');
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', hideSearchHistory);
    }
    const searchHistoryPanel = document.getElementById('search-history-panel');
    if (searchHistoryPanel) {
        searchHistoryPanel.addEventListener('click', (e) => {
            if (e.target === searchHistoryPanel) {
                hideSearchHistory();
            }
        });
    }
    const clearSearchHistoryBtn = document.getElementById('clear-search-history');
    if (clearSearchHistoryBtn) {
        clearSearchHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            updateSearchHistoryDisplay();
            updateSearchHistoryList();
        });
    }
    const backupBtn = document.getElementById('historyBackupFS');
    if (backupBtn) {
        backupBtn.addEventListener('click', manualBackupHistory);
    }
    const restoreBtn = document.getElementById('historyRestoreFS');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', manualRestoreHistory);
    }
}(async function initLiquid() {
    console.log("Liquid.js:遅延読み込みモジュールを初期化中...");
    await loadPakoScript();
    await initializeFirebaseAndMonitorAuth();
    setupExtendedEventListeners();
    updateSearchHistoryList();
    console.log("Liquid.js:初期化完了");
})();
let IMAGE_URL = 'https://search3958.github.io/newtab/bgimg/3958Glass1.webp';
const customWallpaper = localStorage.getItem('custom_wallpaper');
if (customWallpaper) {
    IMAGE_URL = customWallpaper;
}
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
}
const VERT_SRC = ` attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv = a_pos * 0.5 + 0.5;gl_Position = vec4(a_pos,0.0,1.0);}`;
const FRAG_SRC = ` precision mediump float;varying vec2 v_uv;uniform sampler2D u_tex;uniform float u_time;uniform float u_amp;uniform float u_freq;uniform float u_speed;uniform vec2 u_canvasSize;uniform vec2 u_imageSize;#define MAX_PULSES 8 uniform int u_pulseCount;uniform vec3 u_pulses[MAX_PULSES];vec2 coverUV(vec2 uv,vec2 canvasSize,vec2 imageSize){float canvasAspect = canvasSize.x / canvasSize.y;float imageAspect = imageSize.x / imageSize.y;vec2 scale;if(canvasAspect > imageAspect)scale = vec2(1.0,canvasAspect / imageAspect);else scale = vec2(imageAspect / canvasAspect,1.0);return(uv - 0.5)/ scale + 0.5;}float pulseHeight(vec2 uv,vec2 origin,float t0,float t,vec2 canvasSize){float elapsed = t - t0;if(elapsed <= 0.0)return 0.0;float aspect = canvasSize.x / canvasSize.y;vec2 correctedUV = vec2(uv.x * aspect,uv.y);vec2 correctedOrigin = vec2(origin.x * aspect,origin.y);float d = distance(correctedUV,correctedOrigin);float r = elapsed * u_speed;float diff = d - r;float phase = diff * u_freq;float env = exp(-1.5 * abs(diff))* exp(-0.8 * elapsed);float rise = smoothstep(0.0,0.3,elapsed);return sin(phase)* env * rise;}vec4 blurSample(sampler2D tex,vec2 uv,float strength){vec4 sum = vec4(0.0);float step = 0.003 * strength;const int RADIUS = 4;float count = 0.0;for(int x=-RADIUS;x<=RADIUS;x++){for(int y=-RADIUS;y<=RADIUS;y++){sum += texture2D(tex,uv + vec2(float(x)*step,float(y)*step));count += 1.0;}}return sum / count;}float gradientLayer(vec2 uv){float grad = smoothstep(-0.15,0.0,uv.y);return pow(grad,0.5);}void main(){vec2 uv = v_uv;vec2 coverUv = coverUV(uv,u_canvasSize,u_imageSize);vec4 baseColor = texture2D(u_tex,coverUv);if(u_pulseCount <= 0){gl_FragColor = baseColor;return;}float t = u_time;float h = 0.0;for(int i=0;i<MAX_PULSES;i++){if(i >= u_pulseCount)break;vec3 p = u_pulses[i];h += pulseHeight(uv,p.xy,p.z,t,u_canvasSize);}float disp = h * u_amp;vec2 displacedUv = coverUv + normalize(uv - vec2(0.5,-0.05))* disp * 0.06;float effect = clamp(abs(disp),0.0,1.0);if(effect < 0.015){gl_FragColor = baseColor;return;}vec2 offsetR = vec2(0.016,0.0)* effect;vec2 offsetB = vec2(-0.016,0.0)* effect;vec4 col;col.r = blurSample(u_tex,displacedUv + offsetR,effect).r;col.g = blurSample(u_tex,displacedUv,effect).g;col.b = blurSample(u_tex,displacedUv + offsetB,effect).b;col.a = 1.0;float gradEffect = smoothstep(0.0,1.0,abs(disp));float light = 1.0 + gradEffect * 0.6;float grad = gradientLayer(uv);baseColor.rgb = mix(baseColor.rgb,col.rgb * light,grad);gl_FragColor = baseColor;}`;

function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    }
    return s;
}

function createProgram(vsSrc, fsSrc) {
    const vs = compileShader(vsSrc, gl.VERTEX_SHADER);
    const fs = compileShader(fsSrc, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        throw new Error('Program link error');
    }
    return prog;
}
const prog = createProgram(VERT_SRC, FRAG_SRC);
gl.useProgram(prog);
const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
const a_pos = gl.getAttribLocation(prog, 'a_pos');
gl.enableVertexAttribArray(a_pos);
gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);
const u_time = gl.getUniformLocation(prog, 'u_time');
const u_tex = gl.getUniformLocation(prog, 'u_tex');
const u_amp = gl.getUniformLocation(prog, 'u_amp');
const u_freq = gl.getUniformLocation(prog, 'u_freq');
const u_speed = gl.getUniformLocation(prog, 'u_speed');
const u_pulseCount = gl.getUniformLocation(prog, 'u_pulseCount');
const u_pulses = gl.getUniformLocation(prog, 'u_pulses');
const u_canvasSize = gl.getUniformLocation(prog, 'u_canvasSize');
const u_imageSize = gl.getUniformLocation(prog, 'u_imageSize');
let texture = null;
let imageSize = {
    width: 1,
    height: 1
};

function loadTexture(url, cb) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        imageSize.width = img.naturalWidth;
        imageSize.height = img.naturalHeight;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        cb(tex);
    };
    img.onerror = () => {
        console.error('Image failed to load');
        cb(null);
    };
    img.src = url;
}
let pulse = null;
const MAX_P = 8;
const pulsesBuf = new Float32Array(MAX_P * 3);

function addPulse(x, y) {
    const now = performance.now() / 1000.0;
    pulse = {
        x: x,
        y: y,
        t0: now
    };
    drawFrame();
}
const btn = document.getElementById('pulse');
btn.addEventListener('click', () => addPulse(0.5, -0.05));

function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
window.addEventListener('resize', resize);
let raf = null;

function startLoop() {
    if (raf === null) raf = requestAnimationFrame(loop);
}

function loop() {
    drawFrame();
    raf = requestAnimationFrame(loop);
}

function stopLoop() {
    if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
    }
}

function drawFrame() {
    resize();
    const tNow = performance.now() / 1000.0;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u_time, tNow);
    gl.uniform1f(u_amp, 2);
    gl.uniform1f(u_freq, 2);
    gl.uniform1f(u_speed, 2.5);
    gl.uniform2f(u_canvasSize, canvas.width, canvas.height);
    gl.uniform2f(u_imageSize, imageSize.width, imageSize.height);
    if (pulse) {
        pulsesBuf[0] = pulse.x;
        pulsesBuf[1] = pulse.y;
        pulsesBuf[2] = pulse.t0;
    } else {
        pulsesBuf[0] = 0.0;
        pulsesBuf[1] = 0.0;
        pulsesBuf[2] = -9999.0;
    }
    gl.uniform1i(u_pulseCount, pulse ? 1 : 0);
    gl.uniform3fv(u_pulses, pulsesBuf);
    if (texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u_tex, 0);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
loadTexture(IMAGE_URL, (tex) => {
    if (!tex) {
        console.error('texture missing');
        return;
    }
    texture = tex;
    startLoop();
});