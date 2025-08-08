// 履歴管理機能
const HISTORY_KEY = 'shortcut_history';
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 4;
const MAX_SEARCH_HISTORY = 3;

// デフォルトアイテムを定義
const DEFAULT_ITEMS = [
  { name: "TechPick 10", url: "https://search3958.github.io/techpick10/", icon: "techpick10.webp", bg: "rgba(255, 255, 255, 0.759)" },
  { name: "Gmail", url: "https://mail.google.com/", icon: "gmail.webp", bg: "var(--iconbg)" },
  { name: "ChatGPT", url: "https://chat.openai.com/", icon: "chatgpt.webp", bg: "#000000bb" },
  { name: "Tools", url: "https://search3958.github.io/tools", icon: "tools.webp", bg: "var(--iconbg)" }
];

// 初回起動時にデフォルトアイテムを履歴に設定する関数
function initializeDefaultHistory() {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // 履歴が空の場合のみデフォルトアイテムを設定
  if (history.length === 0) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(DEFAULT_ITEMS));
  }
}

// 検索履歴を保存する関数
function saveSearchHistory(query) {
  if (!query || query.trim() === '') return;
  
  let searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  
  // 既存の同じクエリを削除
  searchHistory = searchHistory.filter(item => item !== query.trim());
  
  // 新しいクエリを先頭に追加
  searchHistory.unshift(query.trim());
  
  // 最大3件に制限
  if (searchHistory.length > MAX_SEARCH_HISTORY) {
    searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
  }
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
}

// 履歴を保存する関数
function saveToHistory(linkData) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // 既存の同じURLの履歴を削除
  history = history.filter(item => item.url !== linkData.url);
  
  // 新しい履歴を先頭に追加
  history.unshift(linkData);
  
  // 最大4件に制限
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  updateHistoryDisplay();
}

// 履歴表示を更新する関数
function updateHistoryDisplay() {
  const historyContainer = document.querySelector('.shortcuthistory');
  if (!historyContainer) return;
  
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // 履歴が空の場合はデフォルトアイテムを表示（ただし保存はしない）
  if (history.length === 0) {
    history = DEFAULT_ITEMS;
  }
  
  historyContainer.innerHTML = '';
  
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
    
    iconWrapper.appendChild(img);
    historyItem.appendChild(iconWrapper);
    
    // クリックイベントを追加
    historyItem.addEventListener('click', () => {
      saveToHistory(item);
      window.location.href = item.url;
    });
    
    historyContainer.appendChild(historyItem);
  });
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
  
  searchHistory.forEach((query) => {
    const link = document.createElement('a');
    link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    link.textContent = query;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // クリック時に履歴に追加
    link.addEventListener('click', () => {
      saveSearchHistory(query);
    });
    
    container.appendChild(link);
  });
}

// 設定モーダルを表示する関数
function showSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  
  modal.classList.add('show');
  
  // 現在の壁紙URLを取得して入力欄に設定
  const currentBg = document.body.style.backgroundImage;
  const urlMatch = currentBg.match(/url\(['"]?([^'"]+)['"]?\)/);
  const wallpaperInput = document.getElementById('wallpaper-input');
  if (urlMatch && wallpaperInput) {
    wallpaperInput.value = urlMatch[1];
  }
  
  // 検索履歴を表示
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

// 検索履歴表示を更新する関数
function updateSearchHistoryDisplay() {
  const container = document.querySelector('.search-history-list');
  if (!container) return;
  
  const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  container.innerHTML = '';
  
  if (searchHistory.length === 0) {
    container.innerHTML = '<p style="color: #666; font-style: italic;">検索履歴がありません</p>';
    return;
  }
  
  searchHistory.forEach((query, index) => {
    const item = document.createElement('div');
    item.className = 'search-history-item';
    item.innerHTML = `
      <span>${query}</span>
      <button class="delete-search-item" data-index="${index}">削除</button>
    `;
    
    // 削除ボタンのイベントリスナー
    item.querySelector('.delete-search-item').addEventListener('click', () => {
      const currentHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
      currentHistory.splice(index, 1);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(currentHistory));
      updateSearchHistoryDisplay();
    });
    
    container.appendChild(item);
  });
}

// チェックボックスがトグルされたときに実行
document.getElementById('ai-toggle').addEventListener('change', function() {
  var form = document.getElementById('search-form');
  var container = document.getElementById('search-container');
  var searchInput = document.querySelector('.searchinput');
  var aiBg = document.querySelector('.aibg');

  if (this.checked) {
    // チェックON → AI検索用URLに切り替え、.ai を付与
    form.action = 'https://search3958.github.io/aisearch/';
    container.classList.add('ai');
    aiBg.classList.add('show');
    searchInput.placeholder = 'AIは稀に不正確な情報を示すことがあります';
  } else {
    // チェックOFF → 通常の Google 検索に戻す、.ai を外す
    form.action = 'https://www.google.com/search';
    container.classList.remove('ai');
    aiBg.classList.remove('show');
    searchInput.placeholder = 'ここに入力して検索';
  }
});

// 検索フォームの送信イベント
document.getElementById('search-form').addEventListener('submit', function(e) {
  const searchInput = document.querySelector('.searchinput');
  const query = searchInput.value.trim();
  const isAiSearch = document.getElementById('ai-toggle').checked;
  
  // AI検索でない場合のみ検索履歴に保存
  if (!isAiSearch && query) {
    saveSearchHistory(query);
  }
});

// スクロールイベントを検知して.shortcutsに.showクラスを追加
window.addEventListener('scroll', function() {
  var shortcuts = document.querySelector('.shortcuts');
  var bg = document.querySelector('.bg');
  var bottombar = document.querySelector('.bottombar');
  if (shortcuts) {
    // 0.5px以上スクロールされた場合に.showクラスを追加
    if (window.scrollY >= 1) {
      shortcuts.classList.add('show');
      bottombar.classList.add('top');
      bg.classList.add('show');
    } else {
      // スクロールが0.5px未満の場合は.showクラスを外す
      shortcuts.classList.remove('show');
      bottombar.classList.remove('top');
      bg.classList.remove('show');
    }
  }
});

// 日付とバッテリー残量を表示する関数
function updateTodayInfo() {
  const todayElement = document.querySelector('.today');
  if (!todayElement) return;
  
  // 現在の日付を取得
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  
  // 曜日を日本語で取得
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[now.getDay()];
  
  // バッテリー残量を取得（対応していない場合は「N/A」を表示）
  let batteryText = 'N/A';
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      const batteryLevel = Math.round(battery.level * 100);
      batteryText = `${batteryLevel}%`;
      
      // 充電状態に応じてクラスを設定
      const isCharging = battery.charging;
      todayElement.className = `today ${isCharging ? 'charging' : ''}`;
      todayElement.style.setProperty('--battery-level', `${batteryLevel}%`);
      
      // HTMLを更新
      todayElement.innerHTML = `
        <div class="date">${month}月${date}日</div>
        <div class="info-details">${weekday}曜日・${batteryText}</div>
      `;
      
      // バッテリー状態の変更を監視
      battery.addEventListener('levelchange', () => {
        const newLevel = Math.round(battery.level * 100);
        const newText = `${newLevel}%`;
        const newIsCharging = battery.charging;
        
        todayElement.className = `today ${newIsCharging ? 'charging' : ''}`;
        todayElement.style.setProperty('--battery-level', `${newLevel}%`);
        todayElement.querySelector('.info-details').textContent = `${weekday}曜日・${newText}`;
      });
      
      battery.addEventListener('chargingchange', () => {
        const newIsCharging = battery.charging;
        todayElement.className = `today ${newIsCharging ? 'charging' : ''}`;
      });
      
    }).catch(() => {
      // バッテリー情報が取得できない場合
      todayElement.innerHTML = `
        <div class="date">${month}月${date}日</div>
        <div class="info-details">${weekday}曜日</div>
      `;
    });
  } else {
    // getBattery APIが対応していない場合
    todayElement.innerHTML = `
      <div class="date">${month}月${date}日</div>
      <div class="info-details">${weekday}曜日</div>
    `;
  }
}

// モーダルとパネルのイベントリスナーを設定する関数
function setupModalEventListeners() {
  // 設定モーダルの閉じるボタン
  const closeSettingsBtn = document.querySelector('.close-settings');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', hideSettingsModal);
  }
  
  // 検索履歴パネルの閉じるボタン
  const closeHistoryBtn = document.querySelector('.close-history');
  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', hideSearchHistory);
  }
  
  // モーダル背景クリックで閉じる
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        hideSettingsModal();
      }
    });
  }
  
  // パネル背景クリックで閉じる
  const searchHistoryPanel = document.getElementById('search-history-panel');
  if (searchHistoryPanel) {
    searchHistoryPanel.addEventListener('click', (e) => {
      if (e.target === searchHistoryPanel) {
        hideSearchHistory();
      }
    });
  }
  
  // 壁紙適用ボタン
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
  
  // 検索履歴クリアボタン
  const clearSearchHistoryBtn = document.getElementById('clear-search-history');
  if (clearSearchHistoryBtn) {
    clearSearchHistoryBtn.addEventListener('click', () => {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      updateSearchHistoryDisplay();
      updateSearchHistoryList();
    });
  }
}

// ページ読み込み時は.showクラスを外す（スクロールが0の状態）
document.addEventListener('DOMContentLoaded', function() {
  var shortcuts = document.querySelector('.shortcuts');
  if (shortcuts) {
    shortcuts.classList.remove('show');
  }
  
  // 初回起動時にデフォルト履歴を設定
  initializeDefaultHistory();
  
  // 保存された壁紙を適用
  const savedWallpaper = localStorage.getItem('custom_wallpaper');
  if (savedWallpaper) {
    document.body.style.backgroundImage = `url('${savedWallpaper}')`;
  }
  
  // 設定ボタンのイベントリスナーを追加
  const settingsBtn = document.querySelector('.settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showSettingsModal);
  }
  
  // 履歴ボタンのイベントリスナーを追加
  const historyBtn = document.querySelector('.history');
  if (historyBtn) {
    historyBtn.addEventListener('click', showSearchHistory);
  }
  
  // リンクの生成を開始
  loadIconsAndGenerateLinks();
  
  // 履歴表示を初期化
  updateHistoryDisplay();
  
  // 日付とバッテリー残量を表示
  updateTodayInfo();
  
  // 検索履歴リストを初期化
  updateSearchHistoryList();
  
  // モーダルとパネルのイベントリスナーを設定
  setupModalEventListeners();
});

// アイコンマップとアイコン読み込み状態
const iconsMap = {};
let iconsReady = false;
const iconWaiters = [];

// アイコンzipファイルを読み込む
async function loadIconsZip() {
  try {
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
    
    // アイコン読み込み完了後に履歴表示を更新
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
    const data = await res.json();
    const container = document.querySelector('.shortcuts');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    // 각카테고리의링크를생성
    data.categories.forEach(category => {
      // linkbgでラップするdivを작성
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
        
        // 클릭이벤트를추가해서히스토리에저장
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
        iconWrapper.appendChild(img);
        
        // マウスホバー효과
        iconWrapper.addEventListener('mousemove', e => {
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

      // 쇼핑일때광고스크립트추가
      if (category.title === 'ショッピング') {
        linksDiv.insertAdjacentHTML('beforeend', `
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874" crossorigin="anonymous"></script>
<!-- ShortCut -->
<ins class="adsbygoogle"
     style="display:inline-block;width:244px;height:110px"
     data-ad-client="ca-pub-6151036058675874"
     data-ad-slot="2788469305"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
        `);
      }

      groupDiv.appendChild(linksDiv);
      container.appendChild(groupDiv);
    });

    // 모든이미지로딩완료를대기
    const allImages = container.querySelectorAll('img');
    const imageLoadPromises = Array.from(allImages).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        }
      });
    });

    // 모든이미지로딩완료후0.5초지연
    await Promise.all(imageLoadPromises);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 완전로딩완료후에.bottombar에.show클래스추가
    const bottomBar = document.querySelector('.bottombar');
    if (bottomBar) {
      bottomBar.classList.add('show');
    }

  } catch (e) {
    console.error('アプリアイコンリストの取得に失敗:', e);
  }
}

// アイコンzipファイルの読み込みを開始
loadIconsZip();

const scaleSlider = document.getElementById('scale-slider');
  const cornerSlider = document.getElementById('corner-slider');
  const bottombar = document.querySelector('.bottombar');
  const root = document.documentElement;

  // --- scaleの読み込みと初期設定 ---
  const savedScale = localStorage.getItem('bottombar-scale');
  if (savedScale) {
    scaleSlider.value = savedScale;
    bottombar.style.scale = `${savedScale}`;
  } else {
    bottombar.style.scale = '1';
  }

  scaleSlider.addEventListener('input', () => {
    const scale = scaleSlider.value;
    bottombar.style.scale = `${scale}`;
    localStorage.setItem('bottombar-scale', scale);
  });

  // --- radiusの読み込みと初期設定 ---
  const savedRadius = localStorage.getItem('bottombar-radius');
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