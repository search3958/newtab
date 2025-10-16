const HISTORY_KEY = 'shortcut_history';
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 4;
const MAX_SEARCH_HISTORY = 3;
let isAppSearchMode = !1;
let linksData = null;
const DEFAULT_ITEMS = [{ name: "TechPick 10", url: "https://search3958.github.io/techpick10/", icon: "techpick10.webp", bg: "rgba(255, 255, 255, 0.759)" }, { name: "Gmail", url: "https://mail.google.com/", icon: "gmail.webp", bg: "var(--iconbg)" }, { name: "ChatGPT", url: "https://chat.openai.com/", icon: "chatgpt.webp", bg: "#000000bb" }, { name: "Tools", url: "https://search3958.github.io/tools", icon: "tools.webp", bg: "var(--iconbg)" }];
const domCache = { searchInputBox: null, appSwitchIcon: null, bottomBar: null, shortcuts: null, bg: null, historyContainer: null, today: null, authStatusDisplay: null };
const iconsMap = {};
let iconsReady = !1;
const iconWaiters = [];
const firebaseConfig = { apiKey: "AIzaSyAYSzOAmqY_IJCEUNb-cJNQfp4AKt93a_A", authDomain: "couud-dashboard.firebaseapp.com", databaseURL: "https://couud-dashboard-default-rtdb.firebaseio.com", projectId: "couud-dashboard", storageBucket: "couud-dashboard.appspot.com", messagingSenderId: "163996109972", appId: "1:163996109972:web:e806be3a622a4da2a33881", measurementId: "G-XCX2C68FM6" };
let auth;
let db;
let currentUser = null;
const HISTORY_COLLECTION = 'newtab-history';
const SEARCH_HISTORY_DOCUMENT_ID = 'search_history_compressed';
const HISTORY_DOCUMENT_ID = 'shortcut_history_compressed';
const TEST_DOCUMENT_ID = 'test';

// 修正後の compressData 関数
async function compressData(data) {
    // 互換性チェック（Brotliは非対応の場合でも実行を試みる）
    if (!window.CompressionStream) {
        console.warn('CompressionStream (Brotli) is not supported in this browser. Returning uncompressed data.');
        return new TextEncoder().encode(data);
    }
    
    // データをUint8Arrayにエンコード
    const uint8Array = new TextEncoder().encode(data);
    
    // Blobにラップしてから stream() を呼び出すことで、互換性を確保
    const stream = new Blob([uint8Array]).stream(); // ★修正ポイント: Blobを経由

    try {
        const compressedStream = stream.pipeThrough(new CompressionStream('brotli-default'));
        
        // Responseを使ってストリーム全体をBlobとして取得し、ArrayBufferに変換
        const compressedBlob = await new Response(compressedStream).blob();
        
        return new Uint8Array(await compressedBlob.arrayBuffer());

    } catch (e) {
        // CompressionStreamが「存在する」と判断されたにもかかわらずエラーが発生した場合（例: 
        // 'brotli-default'がサポートされていない場合など）
        console.error("Compression Stream処理中にエラーが発生しました。非圧縮データを返します:", e);
        return uint8Array; // エラー時は非圧縮データを返すか、エラーを再throwする
    }
}
// 修正後の decompressData 関数
async function decompressData(compressedData) {
    if (!window.DecompressionStream) {
        console.warn('DecompressionStream (Brotli) is not supported in this browser. Returning original Uint8Array decoded as text.');
        // DecompressionStreamがない場合は、圧縮されていない（または圧縮形式が不明な）データをそのままテキストとして返します。
        return new TextDecoder().decode(compressedData);
    }

    // compressedDataはUint8ArrayまたはArrayBufferであることを想定
    const blob = new Blob([compressedData]);
    const stream = blob.stream(); // Blobからストリームを取得

    try {
        const decompressedStream = stream.pipeThrough(new DecompressionStream('brotli-with-params'));
        
        // Responseを使ってストリーム全体をテキストとして取得
        const decompressedText = await new Response(decompressedStream).text();
        
        return decompressedText;
        
    } catch (e) {
        // DecompressionStream処理中にエラーが発生した場合（例: データが破損している、または形式が不正な場合）
        console.error("Decompression Stream処理中にエラーが発生しました。非圧縮/破損データを返します:", e);
        // エラー時は、Uint8Arrayを強制的にテキストとしてデコードしたものを返します
        return new TextDecoder().decode(compressedData);
    }
}

/**
 * Firebase SDK (App, Auth, Firestore) を動的に読み込みます。
 * @returns {Promise<void>} SDKの読み込みが完了したら解決
 */
function loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
        // 既にFirebaseが読み込まれているか、アプリが初期化されているかを確認
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            console.log("Firebase SDKは既に読み込まれています。");
            return resolve();
        }

        const sdkUrls = [
            'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js'
        ];

        const loadScript = (url) => {
            return new Promise((res, rej) => {
                const script = document.createElement('script');
                script.src = url;
                script.defer = true;
                script.onload = res;
                script.onerror = () => {
                    console.error(`Firebase SDKの読み込みに失敗しました: ${url}`);
                    rej(new Error(`Failed to load Firebase script: ${url}`));
                };
                document.head.appendChild(script);
            });
        };

        // SDKを順番に読み込む (App -> Auth -> Firestore)
        loadScript(sdkUrls[0])
            .then(() => loadScript(sdkUrls[1]))
            .then(() => loadScript(sdkUrls[2]))
            .then(() => {
                console.log("Firebase SDKの動的読み込みが完了しました。");
                resolve();
            })
            .catch(reject);
    });
}


function updateAuthStatusDisplay(user) {
    if (!domCache.authStatusDisplay) return;
    if (user) {
        domCache.authStatusDisplay.textContent = `✅ Logged in: ${user.uid.substring(0, 8)}...`;
        domCache.authStatusDisplay.style.backgroundColor = 'rgba(46, 204, 113, 0.9)'
    } else {
        domCache.authStatusDisplay.textContent = '❌ Logged out (Local mode)';
        domCache.authStatusDisplay.style.backgroundColor = 'rgba(231, 76, 60, 0.9)'
    }
}

async function initializeFirebaseAndMonitorAuth() {
    try {
        await loadFirebaseScripts();

        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig)
        }
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged(async (user) => {
            currentUser = user;
            updateAuthStatusDisplay(user);
            if (user) {
                console.log("Firebase: ユーザーログイン済み. UID:", user.uid);
                // ★修正: 認証時の履歴自動復元を削除
                // await restoreHistoryFromFirestore(); 
                // await restoreSearchHistoryFromFirestore();
            } else {
                console.log("Firebase: ユーザーログアウト済み.")
            }
        })
    } catch (error) {
        console.error("Firebaseの初期化または読み込みに失敗しました:", error);
        updateAuthStatusDisplay(null)
    }
}

/**
 * ローカルの検索履歴 (SEARCH_HISTORY_KEY) を圧縮し、Firestoreに保存します。
 */
async function saveSearchHistoryToFirestore() {
    if (!currentUser || !db) return;
    try {
        const searchHistoryData = localStorage.getItem(SEARCH_HISTORY_KEY) || '[]';
        const compressedData = await compressData(searchHistoryData);
        const base64Data = btoa(String.fromCharCode(...compressedData));
        await db.collection(HISTORY_COLLECTION).doc(currentUser.uid).set({
            [SEARCH_HISTORY_DOCUMENT_ID]: base64Data,
            searchTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: !0 });
        console.log(`Firestore: 検索履歴をユーザー ${currentUser.uid} に圧縮保存しました。`)
    } catch (error) {
        console.error("Firestoreへの検索履歴保存に失敗しました:", error)
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
                console.log(`Firestore: 検索履歴をユーザー ${currentUser.uid} から復元しました。`);
                updateSearchHistoryList()
            } else {
                console.log("Firestore: 検索履歴のデータフィールドが見つかりませんでした。")
            }
        } else {
            console.log("Firestore: ユーザーの検索履歴ドキュメントが見つかりませんでした。")
        }
    } catch (error) {
        console.error("Firestoreからの検索履歴復元に失敗しました:", error)
    }
}

/**
 * ローカルのショートカット履歴 (HISTORY_KEY) を圧縮し、Firestoreに保存します。
 */
async function saveHistoryToFirestore() {
    if (!currentUser || !db) return;
    try {
        const historyData = localStorage.getItem(HISTORY_KEY) || '[]';
        const compressedData = await compressData(historyData);
        const base64Data = btoa(String.fromCharCode(...compressedData));
        await db.collection(HISTORY_COLLECTION).doc(currentUser.uid).set({
            [HISTORY_DOCUMENT_ID]: base64Data,
            historyTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: !0 });
        console.log(`Firestore: ショートカット履歴をユーザー ${currentUser.uid} に圧縮保存しました。`);
    } catch (error) {
        console.error("Firestoreへのショートカット履歴保存に失敗しました:", error);
    }
}

/**
 * Firestoreからショートカット履歴を復元し、ローカルストレージを更新します。
 */
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
                localStorage.setItem(HISTORY_KEY, decompressedHistory);
                console.log(`Firestore: ショートカット履歴をユーザー ${currentUser.uid} から復元しました。`);
                updateHistoryDisplay(); // 復元後、表示を更新
            } else {
                console.log("Firestore: ショートカット履歴のデータフィールドが見つかりませんでした。");
            }
        } else {
            console.log("Firestore: ユーザーのショートカット履歴ドキュメントが見つかりませんでした。");
        }
    } catch (error) {
        console.error("Firestoreからのショートカット履歴復元に失敗しました:", error);
    }
}

/**
 * ★追加: ボタンクリックで手動で全履歴をFirestoreに保存する関数
 */
function manualBackupHistory() {
    if (!currentUser) {
        alert("Firebaseにログインしていません。ログイン後に実行してください。");
        return;
    }
    // 検索履歴とショートカット履歴の両方を保存
    saveSearchHistoryToFirestore();
    saveHistoryToFirestore();
    alert("履歴のバックアップを開始しました。\nコンソールを確認してください。");
}

/**
 * ★追加: ボタンクリックで手動で全履歴をFirestoreから復元する関数
 */
function manualRestoreHistory() {
    if (!currentUser) {
        alert("Firebaseにログインしていません。ログイン後に実行してください。");
        return;
    }
    // 検索履歴とショートカット履歴の両方を復元
    restoreSearchHistoryFromFirestore();
    restoreHistoryFromFirestore();
    alert("履歴の復元を開始しました。\n復元後、ページをリロードするとショートカットが更新されます。");
}

function cacheDOMElements() {
    domCache.searchInputBox = document.querySelector('.searchinput') || document.getElementById('mainSearchInput');
    domCache.appSwitchIcon = document.querySelector('.appswitchicon');
    domCache.bottomBar = document.querySelector('.bottombar');
    domCache.shortcuts = document.querySelector('.shortcuts');
    domCache.bg = document.querySelector('.bg');
    domCache.historyContainer = document.querySelector('.shortcuthistory');
    domCache.authStatusDisplay = document.getElementById('auth-status-display');
    if (!domCache.authStatusDisplay && document.body) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'auth-status-display';
        statusDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; background: rgba(0,0,0,0.7); color: white; border-radius: 5px; font-size: 12px; z-index: 1000; transition: background-color 0.3s;';
        document.body.appendChild(statusDiv);
        domCache.authStatusDisplay = statusDiv;
        updateAuthStatusDisplay(null)
    }
}
function initializeDefaultHistory() {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_ITEMS))
    }
}
function saveSearchHistory(query) {
    if (!query || query.trim() === '') return;
    let searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    searchHistory = searchHistory.filter(item => item !== query.trim());
    searchHistory.unshift(query.trim());
    if (searchHistory.length > MAX_SEARCH_HISTORY) {
        searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY)
    }
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    // ★修正: 自動保存を削除
    // if (currentUser) {
    //     saveSearchHistoryToFirestore()
    // }
}
function saveToHistory(linkData) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history = history.filter(item => item.url !== linkData.url);
    history.unshift(linkData);
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY)
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateHistoryDisplay();
    // ★修正: 自動保存を削除
    // if (currentUser) { 
    //     saveHistoryToFirestore();
    // }
}
function updateHistoryDisplay() {
    if (!domCache.historyContainer) return;
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) {
        history = DEFAULT_ITEMS
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
            window.location.href = item.url
        });
        fragment.appendChild(historyItem)
    });
    domCache.historyContainer.innerHTML = '';
    domCache.historyContainer.appendChild(fragment)
}
function updateSearchHistoryList() {
    const container = document.getElementById('searchhistory-list');
    if (!container) return;
    const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    container.innerHTML = '';
    if (searchHistory.length === 0) {
        container.innerHTML = '<div class="empty-message">検索履歴がありません</div>';
        return
    }
    const fragment = document.createDocumentFragment();
    searchHistory.forEach((query) => {
        const link = document.createElement('a');
        link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        link.textContent = query;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.addEventListener('click', () => {
            saveSearchHistory(query)
        });
        fragment.appendChild(link)
    });
    container.appendChild(fragment)
}
function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.add('show');
    const currentBg = document.body.style.backgroundImage;
    const urlMatch = currentBg.match(/url\(['"]?([^'"]+)['"]?\)/);
    const wallpaperInput = document.getElementById('wallpaper-input');
    if (urlMatch && wallpaperInput) {
        wallpaperInput.value = urlMatch[1]
    }
    updateSearchHistoryDisplay()
}
function hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.remove('show')
}
function showSearchHistory() {
    const panel = document.getElementById('search-history-panel');
    if (!panel) return;
    panel.classList.add('show');
    updateSearchHistoryList()
}
function hideSearchHistory() {
    const panel = document.getElementById('search-history-panel');
    if (!panel) return;
    panel.classList.remove('show')
}
function updateSearchHistoryDisplay() {
    const container = document.querySelector('.search-history-list');
    if (!container) return;
    const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    container.innerHTML = '';
    if (searchHistory.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">検索履歴がありません</p>';
        return
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
            // ★修正: 自動保存を削除
            // if (currentUser) {
            //     saveSearchHistoryToFirestore()
            // }
            updateSearchHistoryDisplay();
            updateSearchHistoryList()
        });
        fragment.appendChild(item)
    });
    container.appendChild(fragment)
}
let searchCache = new Map();
function searchAppAndDisplay() {
    if (!domCache.searchInputBox || !domCache.appSwitchIcon || !linksData) return;
    const query = domCache.searchInputBox.value.trim().toLowerCase();
    if (query.length === 0) {
        domCache.appSwitchIcon.style.backgroundImage = 'none';
        domCache.appSwitchIcon.classList.remove('show');
        return
    }
    if (searchCache.has(query)) {
        const foundApp = searchCache.get(query);
        if (foundApp) {
            showAppIcon(foundApp)
        } else {
            hideAppIcon()
        }
        return
    }
    let foundApp = null;
    outer: for (const category of linksData.categories) {
        for (const link of category.links) {
            if (link.name.toLowerCase().includes(query)) {
                foundApp = link;
                break outer
            }
        }
    }
    searchCache.set(query, foundApp);
    if (foundApp) {
        showAppIcon(foundApp)
    } else {
        hideAppIcon()
    }
}
function showAppIcon(app) {
    const iconUrl = iconsMap[app.icon];
    if (iconUrl) {
        domCache.appSwitchIcon.style.backgroundImage = `url('${iconUrl}')`;
        domCache.appSwitchIcon.style.backgroundSize = 'cover';
        domCache.appSwitchIcon.style.backgroundPosition = 'center';
        domCache.appSwitchIcon.classList.add('show')
    }
}
function hideAppIcon() {
    domCache.appSwitchIcon.style.backgroundImage = 'none';
    domCache.appSwitchIcon.classList.remove('show')
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
                        break outer
                    }
                }
            }
        }
        if (foundApp) {
            saveToHistory(foundApp);
            window.location.href = foundApp.url
        } else {
            const chatgptUrl = `https://chatgpt.com/?hints=search&openaicom_referred=true&prompt=${encodeURIComponent(query)}`;
            window.location.href = chatgptUrl
        }
    } else {
        const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
        saveSearchHistory(query);
        window.location.href = url
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
                domCache.bg.classList.add('show')
            } else {
                domCache.shortcuts.classList.remove('show');
                domCache.bottomBar.classList.remove('top');
                domCache.bg.classList.remove('show')
            }
        }
        scrollTimeout = null
    })
}
function setupModalEventListeners() {
    const closeSettingsBtn = document.querySelector('.close-settings');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', hideSettingsModal)
    }
    const closeHistoryBtn = document.querySelector('.close-history');
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', hideSearchHistory)
    }
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                hideSettingsModal()
            }
        })
    }
    const searchHistoryPanel = document.getElementById('search-history-panel');
    if (searchHistoryPanel) {
        searchHistoryPanel.addEventListener('click', (e) => {
            if (e.target === searchHistoryPanel) {
                hideSearchHistory()
            }
        })
    }
    const applyWallpaperBtn = document.getElementById('apply-wallpaper');
    if (applyWallpaperBtn) {
        applyWallpaperBtn.addEventListener('click', () => {
            const wallpaperUrl = document.getElementById('wallpaper-input').value.trim();
            if (wallpaperUrl) {
                document.body.style.backgroundImage = `url('${wallpaperUrl}')`;
                localStorage.setItem('custom_wallpaper', wallpaperUrl)
            } else {
                document.body.style.backgroundImage = "url('bgimg/liquidglass1.webp')";
                localStorage.removeItem('custom_wallpaper')
            }
        })
    }
    const clearSearchHistoryBtn = document.getElementById('clear-search-history');
    if (clearSearchHistoryBtn) {
        clearSearchHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            // ★修正: 自動保存を削除
            // if (currentUser) {
            //     saveSearchHistoryToFirestore()
            // }
            updateSearchHistoryDisplay();
            updateSearchHistoryList()
        })
    }
    
    // ★追加: 手動同期ボタンのイベントリスナー
    const backupBtn = document.getElementById('historyBackupFS');
    if (backupBtn) {
        backupBtn.addEventListener('click', manualBackupHistory);
    }
    const restoreBtn = document.getElementById('historyRestoreFS');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', manualRestoreHistory);
    }
}
async function loadIconsZip() {
    try {
        if (typeof JSZip === 'undefined') {
            console.error("JSZipが読み込まれていません。アイコンの読み込みをスキップします。");
            return
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
                    iconsMap[fileName] = objectURL
                });
                tasks.push(task)
            }
        });
        await Promise.all(tasks);
        iconsReady = !0;
        iconWaiters.forEach(fn => fn());
        updateHistoryDisplay()
    } catch (error) {
        console.error("アイコンzipの読み込みに失敗しました:", error)
    }
}
async function loadIconsAndGenerateLinks() {
    if (!iconsReady) {
        await new Promise(resolve => iconWaiters.push(resolve))
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
                    window.location.href = link.url
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
                        mouseTimeout = null
                    })
                });
                iconWrapper.addEventListener('mouseleave', () => {
                    iconWrapper.style.setProperty('--rotateX', '0deg');
                    iconWrapper.style.setProperty('--rotateY', '0deg');
                    iconWrapper.style.setProperty('--moveX', '0px');
                    iconWrapper.style.setProperty('--moveY', '0px');
                    img.style.setProperty('--moveX', '0px');
                    img.style.setProperty('--moveY', '0px')
                });
                const label = document.createElement('div');
                label.className = 'linkbox-label';
                label.textContent = link.name;
                box.appendChild(iconWrapper);
                box.appendChild(label);
                a.appendChild(box);
                linksDiv.appendChild(a)
            });
            if (category.title === 'ショッピング') {
                linksDiv.insertAdjacentHTML('beforeend', ` <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874" crossorigin="anonymous"></script> <ins class="adsbygoogle" style="display:inline-block;width:244px;height:110px;margin:0px;" data-ad-client="ca-pub-6151036058675874" data-ad-slot="2788469305"></ins> <script> (adsbygoogle = window.adsbygoogle || []).push({}); </script> `)
            }
            groupDiv.appendChild(linksDiv);
            fragment.appendChild(groupDiv)
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
                        domCache.bottomBar.classList.add('show')
                    }
                }, 100)
            }
        };
        allImages.forEach(img => {
            if (img.complete) {
                checkAllLoaded()
            } else {
                img.addEventListener('load', checkAllLoaded);
                img.addEventListener('error', checkAllLoaded)
            }
        });
        if (totalImages === 0) {
            if (domCache.bottomBar) {
                domCache.bottomBar.classList.add('show')
            }
        }
        loadLiquidJS();
        loadMaterialWeb()
    } catch (e) {
        console.error('アプリアイコンリストの取得に失敗:', e)
    }
}
document.addEventListener('DOMContentLoaded', function () {
    cacheDOMElements();
    if (domCache.shortcuts) {
        domCache.shortcuts.classList.remove('show')
    }
    initializeDefaultHistory();
    const savedWallpaper = localStorage.getItem('custom_wallpaper');
    if (savedWallpaper) {
        document.body.style.backgroundImage = `url('${savedWallpaper}')`
    }
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsModal)
    }
    const historyBtn = document.querySelector('.history');
    if (historyBtn) {
        historyBtn.addEventListener('click', showSearchHistory)
    }
    const appSwitchBtn = document.querySelector('.appswitch');
    const pulseBtn = document.querySelector('#pulse');
    if (appSwitchBtn && domCache.searchInputBox) {
        appSwitchBtn.addEventListener('click', () => {
            isAppSearchMode = !isAppSearchMode;
            if (isAppSearchMode) {
                domCache.searchInputBox.placeholder = "アプリ&AI";
                if (pulseBtn) pulseBtn.click();
                searchAppAndDisplay()
            } else {
                domCache.searchInputBox.placeholder = "検索";
                if (domCache.appSwitchIcon) {
                    domCache.appSwitchIcon.style.backgroundImage = 'none'
                }
            }
            domCache.searchInputBox.focus()
        })
    }
    if (domCache.searchInputBox) {
        domCache.searchInputBox.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch()
            }
        });
        let inputTimeout;
        domCache.searchInputBox.addEventListener('input', () => {
            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                if (isAppSearchMode) {
                    searchAppAndDisplay()
                }
            }, 100)
        })
    }
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            performSearch()
        })
    }
    const searchButton = document.querySelector('.searchbutton');
    if (searchButton) {
        searchButton.addEventListener('click', function (e) {
            e.preventDefault();
            performSearch()
        })
    }
    window.addEventListener('scroll', handleScroll, { passive: !0 });
    Promise.all([loadIconsZip(), ]).then(() => {
        loadIconsAndGenerateLinks();
        updateHistoryDisplay();
        updateSearchHistoryList();
        setupModalEventListeners();
        initializeFirebaseAndMonitorAuth();
    })
});
const scaleSlider = document.getElementById('scale-slider');
const cornerSlider = document.getElementById('corner-slider');
const root = document.documentElement;
const savedScale = localStorage.getItem('bottombar-scale');
if (scaleSlider && document.querySelector('.bottombar')) {
    if (savedScale) {
        scaleSlider.value = savedScale;
        document.querySelector('.bottombar').style.scale = `${savedScale}`
    } else {
        document.querySelector('.bottombar').style.scale = '1'
    }
    scaleSlider.addEventListener('input', () => {
        const scale = scaleSlider.value;
        document.querySelector('.bottombar').style.scale = `${scale}`;
        localStorage.setItem('bottombar-scale', scale)
    })
}
const savedRadius = localStorage.getItem('bottombar-radius');
if (cornerSlider && root) {
    if (savedRadius) {
        cornerSlider.value = savedRadius;
        root.style.setProperty('--radius', `${savedRadius}`)
    } else {
        root.style.setProperty('--radius', '1')
    }
    cornerSlider.addEventListener('input', () => {
        const radius = cornerSlider.value;
        root.style.setProperty('--radius', `${radius}`);
        localStorage.setItem('bottombar-radius', radius)
    })
}(function () {
    const wrappers = document.querySelectorAll('.metaBall');
    function syncLinkedBalls() {
        wrappers.forEach(metaBall => {
            const linked = document.getElementById('linkedBalls-' + metaBall.id);
            if (!linked) return;
            const rect = metaBall.getBoundingClientRect();
            const offset = 4;
            linked.style.cssText = ` width: ${rect.width - offset}px; height: ${rect.height - offset}px; left: ${rect.left + offset / 2}px; top: ${rect.top + offset / 2}px; position: fixed; line-height: ${rect.height - offset}px; `;
            if (metaBall.classList.contains('hide')) {
                linked.classList.add('hide')
            } else {
                linked.classList.remove('hide')
            }
        })
    }
    window.addEventListener('resize', syncLinkedBalls);
    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const container = document.querySelector('.metaballcontainer');
            if (searchInput.value.length > 0) {
                wrappers.forEach(metaBall => metaBall.classList.add('hide'));
                if (container) container.classList.add('hide')
            } else {
                wrappers.forEach(metaBall => metaBall.classList.remove('hide'));
                if (container) container.classList.remove('hide')
            }
            syncLinkedBalls()
        })
    }
    wrappers.forEach(metaBall => {
        let mouseTimeout;
        metaBall.addEventListener('mousemove', () => {
            if (mouseTimeout) return;
            mouseTimeout = requestAnimationFrame(() => {
                syncLinkedBalls();
                mouseTimeout = null
            })
        });
        metaBall.addEventListener('mouseleave', syncLinkedBalls)
    });
    syncLinkedBalls()
})();
function loadLiquidJS() {
    if (window.liquidLoaded) return;
    const script = document.createElement('script');
    script.src = 'beta/liquid.js';
    script.onload = () => {
        window.liquidLoaded = !0
    };
    document.body.appendChild(script)
}
async function loadMaterialWeb() {
    await import('@material/web/ripple/ripple.js');
    const { styles: typescaleStyles } = await import('@material/web/typography/md-typescale-styles.js');
    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
    console.log("Material Web modules loaded")
}

const TEST_RAW_DATA = 'これはFirestoreの/newtab-history/testに保存されるテストデータです。圧縮されて保存されます。';

/**
 * テストデータを圧縮し、Firestoreの指定されたパス (/newtab-history/test) に保存します。
 */
async function saveCompressedTestToFirestore() {
    if (!db) {
        console.error("Firestoreが初期化されていません。");
        return;
    }

    try {
        const compressedData = await compressData(TEST_RAW_DATA);
        console.log(`オリジナルデータのサイズ: ${new TextEncoder().encode(TEST_RAW_DATA).length} bytes`);
        console.log(`圧縮後データのサイズ: ${compressedData.length} bytes`);

        const base64Data = btoa(String.fromCharCode(...compressedData));

        await db.collection(HISTORY_COLLECTION).doc(TEST_DOCUMENT_ID).set({
            compressed_data: base64Data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            original_size: new TextEncoder().encode(TEST_RAW_DATA).length
        }, { merge: true });

        console.log(`✅ Firestoreにデータが保存されました。パス: ${HISTORY_COLLECTION}/${TEST_DOCUMENT_ID}`);

    } catch (error) {
        console.error("Firestoreへの圧縮データ保存に失敗しました:", error);
    }
}