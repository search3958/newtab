// 履歴管理機能
const HISTORY_KEY = 'shortcut_history';
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 4;
const MAX_SEARCH_HISTORY = 3;

// アプリ検索モードを管理する変数
let isAppSearchMode = false;
let linksData = null;

// デフォルトアイテムを定義
const DEFAULT_ITEMS = [
  { name: "TechPick 10", url: "https://search3958.github.io/techpick10/", icon: "techpick10.webp", bg: "rgba(255, 255, 255, 0.759)" },
  { name: "Gmail", url: "https://mail.google.com/", icon: "gmail.webp", bg: "var(--iconbg)" },
  { name: "ChatGPT", url: "https://chat.openai.com/", icon: "chatgpt.webp", bg: "#000000bb" },
  { name: "Tools", url: "https://search3958.github.io/tools", icon: "tools.webp", bg: "var(--iconbg)" }
];

// DOM要素のキャッシュ
const domCache = {
  searchInputBox: null,
  appSwitchIcon: null,
  bottomBar: null,
  shortcuts: null,
  bg: null,
  historyContainer: null,
  today: null,
  authStatusDisplay: null // ログイン状態表示用
};

// アイコン管理
const iconsMap = {};
let iconsReady = false;
const iconWaiters = [];

// ====================================================================
// Firebase と 履歴同期の関連機能 (検索履歴のみ同期)
// ====================================================================

// Firebase 設定
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
let currentUser = null; // ログインユーザーオブジェクトを保持

const HISTORY_COLLECTION = 'newtab-history';
// const HISTORY_DOCUMENT_ID = 'shortcut_history_compressed'; // <-- ショートカット履歴の定数を削除
const SEARCH_HISTORY_DOCUMENT_ID = 'search_history_compressed'; 

/**
 * Brotliでデータを圧縮する
 * @param {string} data - 圧縮する文字列データ
 * @returns {Promise<Uint8Array>} 圧縮されたバイトデータ
 */
async function compressData(data) {
  if (!window.CompressionStream) {
    console.warn('CompressionStream (Brotli) is not supported in this browser.');
    return new TextEncoder().encode(data); 
  }
  const stream = new TextEncoder().encode(data).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('brotli-default'));
  const compressedBlob = await new Response(compressedStream).blob();
  return new Uint8Array(await compressedBlob.arrayBuffer());
}

/**
 * Brotliでデータを解凍する
 * @param {Uint8Array} compressedData - 解凍するバイトデータ
 * @returns {Promise<string>} 解凍された文字列データ
 */
async function decompressData(compressedData) {
  if (!window.DecompressionStream) {
    console.warn('DecompressionStream (Brotli) is not supported in this browser.');
    return new TextDecoder().decode(compressedData); 
  }
  const stream = new Blob([compressedData]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('brotli-with-params'));
  const decompressedBlob = await new Response(decompressedStream).blob();
  return await decompressedBlob.text();
}

/**
 * Firebase関連のスクリプトを動的に読み込む
 * @returns {Promise<void>}
 */
function loadFirebaseScripts() {
    return new Promise(async (resolve, reject) => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            return resolve(); 
        }

        const appScript = document.createElement('script');
        appScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js';
        document.head.appendChild(appScript);

        appScript.onload = () => {
            const authScript = document.createElement('script');
            authScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js';
            document.head.appendChild(authScript);

            authScript.onload = () => {
                const firestoreScript = document.createElement('script');
                firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js';
                document.head.appendChild(firestoreScript);

                firestoreScript.onload = () => {
                    resolve();
                };
                firestoreScript.onerror = reject;
            };
            authScript.onerror = reject;
        };
        appScript.onerror = reject;
    });
}

/**
 * 認証状態表示を更新する関数
 * @param {firebase.User} user - ログインユーザーオブジェクト
 */
function updateAuthStatusDisplay(user) {
    if (!domCache.authStatusDisplay) return;

    if (user) {
        domCache.authStatusDisplay.textContent = `✅ Logged in: ${user.uid.substring(0, 8)}...`;
        domCache.authStatusDisplay.style.backgroundColor = 'rgba(46, 204, 113, 0.9)'; 
    } else {
        domCache.authStatusDisplay.textContent = '❌ Logged out (Local mode)';
        domCache.authStatusDisplay.style.backgroundColor = 'rgba(231, 76, 60, 0.9)'; 
    }
}


/**
 * Firebaseを初期化し、認証状態を監視する
 */
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
                console.log("Firebase: ユーザーログイン済み. UID:", user.uid);
                // ログイン時、Firestoreから検索履歴のみ復元
                await restoreSearchHistoryFromFirestore(); 
            } else {
                console.log("Firebase: ユーザーログアウト済み.");
            }
        });

    } catch (error) {
        console.error("Firebaseの初期化または読み込みに失敗しました:", error);
        updateAuthStatusDisplay(null); 
    }
}

// **--- 削除: saveHistoryToFirestore 関数 ---**

// **--- 削除: restoreHistoryFromFirestore 関数 ---**

/**
 * 検索履歴をFirestoreに保存する（ログイン時のみ） 
 */
async function saveSearchHistoryToFirestore() {
    if (!currentUser || !db) return;

    try {
        const searchHistoryData = localStorage.getItem(SEARCH_HISTORY_KEY) || '[]';
        const compressedData = await compressData(searchHistoryData);
        const base64Data = btoa(String.fromCharCode(...compressedData));

        // 検索履歴とタイムスタンプのみを保存
        await db.collection(HISTORY_COLLECTION).doc(currentUser.uid).set({
            [SEARCH_HISTORY_DOCUMENT_ID]: base64Data,
            searchTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`Firestore: 検索履歴をユーザー ${currentUser.uid} に圧縮保存しました。`);

    } catch (error) {
        console.error("Firestoreへの検索履歴保存に失敗しました:", error);
    }
}

/**
 * 検索履歴をFirestoreから復元する（ログイン時のみ）
 */
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

                updateSearchHistoryList();
            }
        } else {
             // ローカルに履歴がある場合はそれを初回同期として保存
            if(localStorage.getItem(SEARCH_HISTORY_KEY) && JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)).length > 0) {
                console.log("Firestore: 検索履歴データが見つかりませんでした。ローカル検索履歴を初回同期として保存します。");
                await saveSearchHistoryToFirestore();
            }
        }
    } catch (error) {
        console.error("Firestoreからの検索履歴復元に失敗しました:", error);
    }
}


// ====================================================================
// 既存のDOM操作・履歴管理関数
// ====================================================================

// DOM要素を初期化時にキャッシュ 
function cacheDOMElements() {
  domCache.searchInputBox = document.querySelector('.searchinput') || document.getElementById('mainSearchInput');
  domCache.appSwitchIcon = document.querySelector('.appswitchicon');
  domCache.bottomBar = document.querySelector('.bottombar');
  domCache.shortcuts = document.querySelector('.shortcuts');
  domCache.bg = document.querySelector('.bg');
  domCache.historyContainer = document.querySelector('.shortcuthistory');

  // Auth Status Displayの作成
  domCache.authStatusDisplay = document.getElementById('auth-status-display');
  if (!domCache.authStatusDisplay && document.body) {
      const statusDiv = document.createElement('div');
      statusDiv.id = 'auth-status-display';
      statusDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; background: rgba(0,0,0,0.7); color: white; border-radius: 5px; font-size: 12px; z-index: 1000; transition: background-color 0.3s;';
      document.body.appendChild(statusDiv);
      domCache.authStatusDisplay = statusDiv;
      updateAuthStatusDisplay(null); // 初期状態をログアウトに設定
  }
}

// 初回起動時にデフォルトアイテムを履歴に設定する関数
function initializeDefaultHistory() {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  if (history.length === 0) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_ITEMS));
  }
}

// 検索履歴を保存する関数 (Firestore同期を呼び出し)
function saveSearchHistory(query) {
  if (!query || query.trim() === '') return;
  
  let searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  
  searchHistory = searchHistory.filter(item => item !== query.trim());
  
  searchHistory.unshift(query.trim());
  
  if (searchHistory.length > MAX_SEARCH_HISTORY) {
    searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
  }
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));

  if (currentUser) {
      saveSearchHistoryToFirestore(); // 検索履歴の同期
  }
}

// 履歴を保存する関数 (ショートカット履歴)
function saveToHistory(linkData) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  history = history.filter(item => item.url !== linkData.url);
  
  history.unshift(linkData);
  
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  updateHistoryDisplay();
  
  // ショートカット履歴のFirestoreへの保存は削除
  // if (currentUser) {
  //   saveHistoryToFirestore();
  // }
}

// 履歴表示を更新する関数
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

// 検索履歴リストを更新する関数
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
      saveSearchHistory(query);
    });
    
    fragment.appendChild(link);
  });
  
  container.appendChild(fragment);
}

// 設定モーダルを表示する関数
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
  
  updateSearchHistoryDisplay();
}

// 設定モーダルを閉じる関数
function hideSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
}

// 検索履歴パネルを表示する関数
function showSearchHistory() {
  const panel = document.getElementById('search-history-panel');
  if (!panel) return;
  
  panel.classList.add('show');
  updateSearchHistoryList();
}

// 検索履歴パネルを閉じる関数
function hideSearchHistory() {
  const panel = document.getElementById('search-history-panel');
  if (!panel) return;
  
  panel.classList.remove('show');
}

// 検索履歴表示を更新する関数 (設定モーダル内)
function updateSearchHistoryDisplay() {
  const container = document.querySelector('.search-history-list');
  if (!container) return;
  
  const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  container.innerHTML = '';
  
  if (searchHistory.length === 0) {
    container.innerHTML = '<p style="color: #666; font-style: italic;">検索履歴がありません</p>';
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  searchHistory.forEach((query, index) => {
    const item = document.createElement('div');
    item.className = 'search-history-item';
    item.innerHTML = `
      <span>${query}</span>
      <button class="delete-search-item" data-index="${index}">削除</button>
    `;
    
    item.querySelector('.delete-search-item').addEventListener('click', () => {
      const currentHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
      currentHistory.splice(index, 1);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(currentHistory));
      
      // 削除時もFirestoreに同期
      if (currentUser) {
          saveSearchHistoryToFirestore();
      }

      updateSearchHistoryDisplay();
      updateSearchHistoryList();
    });
    
    fragment.appendChild(item);
  });
  
  container.appendChild(fragment);
}

// アプリを検索し、アイコンを表示する関数
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

// 検索を実行する関数
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
    saveSearchHistory(query);
    window.location.href = url;
  }
}


// スクロールイベント
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


// モーダルとパネルのイベントリスナーを設定する関数
function setupModalEventListeners() {
  const closeSettingsBtn = document.querySelector('.close-settings');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', hideSettingsModal);
  }
  
  const closeHistoryBtn = document.querySelector('.close-history');
  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', hideSearchHistory);
  }
  
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        hideSettingsModal();
      }
    });
  }
  
  const searchHistoryPanel = document.getElementById('search-history-panel');
  if (searchHistoryPanel) {
    searchHistoryPanel.addEventListener('click', (e) => {
      if (e.target === searchHistoryPanel) {
        hideSearchHistory();
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
  
  const clearSearchHistoryBtn = document.getElementById('clear-search-history');
  if (clearSearchHistoryBtn) {
    clearSearchHistoryBtn.addEventListener('click', () => {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      if (currentUser) {
          // Firestoreからも削除（空データで上書き）
          saveSearchHistoryToFirestore();
      }
      updateSearchHistoryDisplay();
      updateSearchHistoryList();
    });
  }
}

// アイコン管理
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
    iconsReady = true;
    iconWaiters.forEach(fn => fn());
    
    updateHistoryDisplay();
  } catch (error) {
    console.error("アイコンzipの読み込みに失敗しました:", error);
  }
}

// リンク生成の最適化
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
<ins class="adsbygoogle"
     style="display:inline-block;width:244px;height:110px;margin:0px;"
     data-ad-client="ca-pub-6151036058675874"
     data-ad-slot="2788469305"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
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

// メイン初期化関数
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
  
  // イベントリスナーの設定
  const settingsBtn = document.querySelector('.settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showSettingsModal);
  }
  
  const historyBtn = document.querySelector('.history');
  if (historyBtn) {
    historyBtn.addEventListener('click', showSearchHistory);
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


  // 検索関連のイベントリスナー
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

  // スクロールイベント
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // 非同期処理を並行実行
  Promise.all([
    loadIconsZip(),
  ]).then(() => {
    loadIconsAndGenerateLinks();
    updateHistoryDisplay();
    updateSearchHistoryList();
    setupModalEventListeners();

    // Firebaseの初期化と認証監視を開始
    setTimeout(() => {
        initializeFirebaseAndMonitorAuth();
    }, 1000); 
  });
});

// スケール関連の処理
const scaleSlider = document.getElementById('scale-slider');
const cornerSlider = document.getElementById('corner-slider');
const root = document.documentElement;

const savedScale = localStorage.getItem('bottombar-scale');
if (scaleSlider && document.querySelector('.bottombar')) { 
  if (savedScale) {
    scaleSlider.value = savedScale;
    document.querySelector('.bottombar').style.scale = `${savedScale}`;
  } else {
    document.querySelector('.bottombar').style.scale = '1';
  }

  scaleSlider.addEventListener('input', () => {
    const scale = scaleSlider.value;
    document.querySelector('.bottombar').style.scale = `${scale}`;
    localStorage.setItem('bottombar-scale', scale);
  });
}

const savedRadius = localStorage.getItem('bottombar-radius');
if (cornerSlider && root) {
  if (savedRadius) {
    cornerSlider.value = savedRadius;
    root.style.setProperty('--radius', `${savedRadius}`);
  } else {
    root.style.setProperty('--radius', '1');
  }

  cornerSlider.addEventListener('input', () => {
    const radius = cornerSlider.value;
    root.style.setProperty('--radius', `${radius}`);
    localStorage.setItem('bottombar-radius', radius);
  });
}

// メタボール処理
(function() {
  const wrappers = document.querySelectorAll('.metaBall');
  
  function syncLinkedBalls() {
    wrappers.forEach(metaBall => {
      const linked = document.getElementById('linkedBalls-' + metaBall.id);
      if (!linked) return;
      const rect = metaBall.getBoundingClientRect();
      const offset = 4;
      linked.style.cssText = `
        width: ${rect.width - offset}px;
        height: ${rect.height - offset}px;
        left: ${rect.left + offset/2}px;
        top: ${rect.top + offset/2}px;
        position: fixed;
        line-height: ${rect.height - offset}px;
      `;
      
      if (metaBall.classList.contains('hide')) {
        linked.classList.add('hide');
      } else {
        linked.classList.remove('hide');
      }
    });
  }
  
  window.addEventListener('resize', syncLinkedBalls);

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

function loadLiquidJS() {
  if (window.liquidLoaded) return; 
  const script = document.createElement('script');
  script.src = 'beta/liquid.js';
  script.onload = () => { window.liquidLoaded = true; };
  document.body.appendChild(script);
}

async function loadMaterialWeb() {
    await import('@material/web/ripple/ripple.js');

    const { styles: typescaleStyles } =
      await import('@material/web/typography/md-typescale-styles.js');
    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);

    console.log("Material Web modules loaded");
}