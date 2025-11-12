const HISTORY_KEY = 'shortcut_history';
const MAX_HISTORY = 4;
let isAppSearchMode = !1;
let linksData = null;
const DEFAULT_ITEMS = [
    { name: "TechPick 10", url: "https://search3958.github.io/techpick10/", icon: "techpick10.webp", bg: "rgba(255, 255, 255, 0.759)" },
    { name: "Gmail", url: "https://mail.google.com/", icon: "gmail.webp", bg: "var(--iconbg)" },
    { name: "About me", url: "https://search3958.github.io/", icon: "3958.webp", bg: "var(--iconbg)" },
    { name: "Tools", url: "https://search3958.github.io/tools", icon: "tools.webp", bg: "var(--iconbg)" }
];

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
        // 検索履歴保存はliquid.jsに移行
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
        if (!res.ok) throw new Error(`Failed to fetch icons-4-5.zip: ${res.status}`);
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
                linksDiv.insertAdjacentHTML('beforeend', `
                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874" crossorigin="anonymous"></script>
                    <ins class="adsbygoogle" style="display:inline-block;width:244px;height:110px;margin:0px;" data-ad-client="ca-pub-6151036058675874" data-ad-slot="2788469305"></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                `);
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

document.addEventListener('DOMContentLoaded', function () {
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
        domCache.searchInputBox.addEventListener('keydown', function (e) {
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
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            performSearch();
        });
    }
    const searchButton = document.querySelector('.searchbutton');
    if (searchButton) {
        searchButton.addEventListener('click', function (e) {
            e.preventDefault();
            performSearch();
        });
    }
    window.addEventListener('scroll', handleScroll, { passive: !0 });
    
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
    const { styles: typescaleStyles } = await import('@material/web/typography/md-typescale-styles.js');
    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
    console.log("Material Web modules loaded");
}