function applyBackground(url) {
  if (url && url.trim() !== "") {
    document.body.style.setProperty("background-image", `url('${url}')`, "important");
  }
}

function setBackground() {
  const url = document.getElementById("bgUrlInput").value.trim();
  if (url) {
    localStorage.setItem("backgroundImageUrl", url);
    applyBackground(url);
  }
}

// AISearch モードの状態を管理するための変数
let isAISearchMode = false;

// AIエンジンURLリスト
const aiEngines = {
  aisearch: 'https://search3958.github.io/aisearch/?q=',
  aishortcut: 'https://search3958.github.io/aishortcut/?q=',
  chatgpt: 'https://chatgpt.com/?q=auto'
};
function getCurrentAiEngine() {
  // localStorage未設定時はaisearchをセットして返す
  let engine = localStorage.getItem('aiEngine');
  if (!engine) {
    engine = 'aisearch';
    localStorage.setItem('aiEngine', engine);
  }
  return engine;
}
function setCurrentAiEngine(engine) {
  localStorage.setItem('aiEngine', engine);
  updateAiEngineButtons();
}
function updateAiEngineButtons() {
  const current = getCurrentAiEngine();
  document.querySelectorAll('.ai-engine-btn').forEach(btn => {
    if (btn.dataset.engine === current) {
      btn.style.background = '#fffa';
      btn.style.color = '#000';
    } else {
      btn.style.background = '';
      btn.style.color = '';
    }
  });
}
function updateAiEngineSelectVisibility() {
  const aiEngineSelect = document.getElementById('ai-engine-select');
  if (!aiEngineSelect) return;
  if (isAISearchMode) {
    aiEngineSelect.classList.add('active');
  } else {
    aiEngineSelect.classList.remove('active');
  }
}

// AISearch モード切り替え関数
function toggleAISearch() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const aiSearch = document.getElementById('aisearch');
  const aiBg = document.getElementById('aiBg');
  const searchLens = document.querySelector('.searchLens');

  isAISearchMode = !isAISearchMode;

  updateAiEngineSelectVisibility();

  if (isAISearchMode) {
    // AI検索モードに切り替え
    searchInput.classList.add('active');
    searchButton.classList.add('active');
    aiBg.classList.add('active');
    aiSearch.classList.add('active');
    searchLens.classList.add('active');
    searchInput.placeholder = "AIは不正確な情報を示すことがあります";
  } else {
    // 通常の検索モードに戻す
    searchInput.classList.remove('active');
    searchButton.classList.remove('active');
    aiBg.classList.remove('active');
    aiSearch.classList.remove('active');
    searchLens.classList.remove('active');
    searchInput.placeholder = "検索"; // 元のプレースホルダーに戻す
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedUrl = localStorage.getItem("backgroundImageUrl");
  if (savedUrl) {
    document.getElementById("bgUrlInput").value = savedUrl;
    applyBackground(savedUrl);
  }

  document.getElementById("setButton").addEventListener("click", setBackground);
  
  // AISearch ボタンのイベントリスナーを追加
  document.getElementById('aisearch').addEventListener('click', toggleAISearch);

  const now = new Date();
  const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  document.getElementById("date").textContent = `${now.getMonth() + 1}月${now.getDate()}日`;
  
  // 7月20日から30日の期間チェック
  if (now.getMonth() === 6 && now.getDate() >= 10 && now.getDate() <= 30) {
    document.getElementById("weekday").textContent = "7.27 祖国解放戦争勝利記念日";
  } else {
    document.getElementById("weekday").textContent = weekdays[now.getDay()];
  }

  // 実際のバッテリー取得 (対応しているブラウザ限定)
  if (navigator.getBattery) {
    navigator.getBattery().then(function(battery) {
      const level = Math.round(battery.level * 100);
      const batteryText = document.getElementById("battery");
      const batteryContainer = document.getElementById("battery-container");

      batteryText.textContent = `${level}%`;
      batteryContainer.style.background = `linear-gradient(to right, rgba(120,160,255,0.4) ${level}%, var(--textboxbg) ${level}%)`;
    });
  }
  // AIエンジン選択ボタンのイベント
  document.querySelectorAll('.ai-engine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setCurrentAiEngine(btn.dataset.engine);
    });
  });

  // 履歴の表示
  function renderHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    history.forEach(item => {
      if (typeof item === 'string') {
        const div = document.createElement('div');
        div.className = 'history-item';

        const a = document.createElement('a');
        // 検索履歴アイテムのリンク先も、現在のモード・AIエンジンに応じて変更
        let baseUrl;
        if (isAISearchMode) {
          baseUrl = aiEngines[getCurrentAiEngine()] || aiEngines.aisearch;
        } else {
          baseUrl = "https://www.google.com/search?q=";
        }
        a.href = `${baseUrl}${encodeURIComponent(item)}`;
        a.textContent = item;

        div.appendChild(a);
        historyList.appendChild(div);
      }
    });
  }

  // 検索処理
// 検索処理
function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    return; // 入力が空なら何もしない
  }

  // 入力文字列がURL形式か簡易的に判定
  // 条件: ドット(.)を含み、かつスペースを含まない
  const isUrl = query.includes('.') && !query.includes(' ');

  if (isUrl) {
    // URLの場合、直接そのアドレスに移動する
    let urlToGo = query;
    
    // 'http://' や 'https://' が先頭になければ補う
    if (!/^https?:\/\//i.test(urlToGo)) {
      urlToGo = 'https://' + urlToGo;
    }
    
    window.location.href = urlToGo;

  } else {
    // URLでない場合、通常の検索処理を実行
    let baseUrl;
    if (isAISearchMode) {
      baseUrl = aiEngines[getCurrentAiEngine()] || aiEngines.aisearch;
    } else {
      baseUrl = "https://www.google.com/search?q=";
    }
    const url = `${baseUrl}${encodeURIComponent(query)}`;

    // 検索履歴を保存
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history = history.filter(item => typeof item === 'string');
    history = history.filter(item => item !== query);
    history.unshift(query);
    if (history.length > 5) history.pop();
    localStorage.setItem('searchHistory', JSON.stringify(history));
    
    // 履歴を再描画
    renderHistory();

    // 検索を実行
    window.location.href = url;
  }
}
  // 検索ボタンのクリック時にも@ショートカット対応
  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', function (e) {
      const searchInput = document.getElementById('searchInput');
      const val = searchInput.value.trim();
      // AIモード時は@ショートカット無効
      if (!isAISearchMode && val.startsWith('@')) {
        const name = val.slice(1).toLowerCase();
        const found = allAppLinks.find(s => s.name.toLowerCase() === name);
        if (found) {
          window.location.href = found.url;
          e.preventDefault();
          return false;
        }
      }
      // 通常の検索処理
      performSearch();
    });
  }

  // クリアボタン処理
  document.getElementById('clearButton').addEventListener('click', function () {
    localStorage.removeItem('searchHistory');
    renderHistory();
  });

  // 初期表示
  renderHistory();

  // AIエンジン選択ボタンの初期化
  setCurrentAiEngine(getCurrentAiEngine());

  // フォーム送信時（Enter押下）のイベント
  const searchForm = document.getElementById('searchForm') || document.getElementById('ZsearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      const searchInput = document.getElementById('searchInput');
      const val = searchInput.value.trim();
      // AIモード時は@ショートカット無効
      if (!isAISearchMode && val.startsWith('@')) {
        const name = val.slice(1).toLowerCase();
        const found = allAppLinks.find(s => s.name.toLowerCase() === name);
        if (found) {
          window.location.href = found.url;
          e.preventDefault();
          return false;
        }
      }
      // 通常の検索処理
      e.preventDefault();
      performSearch();
    });
  }

  window.addEventListener('scroll', function() {
    if (window.scrollY >= 1) {
      document.querySelector('.shortcut')?.classList.add('active');
      document.querySelector('.bg')?.classList.add('active');
    } else {
      document.querySelector('.shortcut')?.classList.remove('active');
      document.querySelector('.bg')?.classList.remove('active');
    }
  });

  // 3D回転エフェクトの追加
  document.querySelectorAll('.icon-wrapper').forEach(wrapper => {
    const img = wrapper.querySelector('img');
    
    wrapper.addEventListener('mousemove', e => {
      const box = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - box.left;
      const mouseY = e.clientY - box.top;
      
      const rotateY = ((mouseX - box.width / 2) / (box.width / 2)) * 15;
      const rotateX = ((mouseY - box.height / 2) / (box.height / 2)) * -15;
      
      const moveX = ((mouseX - box.width / 2) / (box.width / 2)) * 10;
      const moveY = ((mouseY - box.height / 2) / (box.height / 2)) * 10;
      
      wrapper.style.setProperty('--rotateX', `${rotateX}deg`);
      wrapper.style.setProperty('--rotateY', `${rotateY}deg`);
      wrapper.style.setProperty('--moveX', `${moveX}px`);
      wrapper.style.setProperty('--moveY', `${moveY}px`);
      
      // 画像にも同じ移動効果を適用
      img.style.setProperty('--moveX', `${moveX * 1.2}px`);
      img.style.setProperty('--moveY', `${moveY * 1.2}px`);
    });
    
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.setProperty('--rotateX', '0deg');
      wrapper.style.setProperty('--rotateY', '0deg');
      wrapper.style.setProperty('--moveX', '0px');
      wrapper.style.setProperty('--moveY', '0px');
      
      // 画像の移動もリセット
      img.style.setProperty('--moveX', '0px');
      img.style.setProperty('--moveY', '0px');
    });
  });

  // ショートカット履歴の管理
  function addToShortcutHistory(name, url, icon, bg) {
    let history = JSON.parse(localStorage.getItem('shortcutHistory') || '[]');
    
    // 同じURLがある場合は削除
    history = history.filter(item => item.url !== url);
    
    // 新しい項目を追加
    history.unshift({ name, url, icon, bg });
    
    // 最大5件に制限
    history = history.slice(0, 5);
    
    localStorage.setItem('shortcutHistory', JSON.stringify(history));
  }

  // link-boxのクリックイベントを監視
  document.addEventListener('click', (e) => {
    const linkBox = e.target.closest('link-box');
    if (linkBox) {
      const name = linkBox.getAttribute('name');
      const url = linkBox.getAttribute('url');
      const icon = linkBox.getAttribute('icon');
      const bg = linkBox.getAttribute('bg');
      addToShortcutHistory(name, url, icon, bg);
    }
  });

   const searchInput = document.getElementById('searchInput');
    const searchaiBtn = document.querySelector('.searchai-btn');
    const aiSearch = document.getElementById('aisearch');

    // AI検索の状態を監視するMutationObserverを作成
    const observer = new MutationObserver(() => {
      if (aiSearch.classList.contains('active')) {
        searchaiBtn.classList.remove('active');
      } else if (searchInput.value.length >= 17) {
        searchaiBtn.classList.add('active');
      }
    });

    // AI検索ボタンのclass変更を監視
    observer.observe(aiSearch, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 入力時の処理
    searchInput.addEventListener('input', () => {
      if (!aiSearch.classList.contains('active')) {
        if (searchInput.value.length >= 17) {
          searchaiBtn.classList.add('active');
        } else {
          searchaiBtn.classList.remove('active');
        }
      } else {
        searchaiBtn.classList.remove('active');
      }
    });
  // searchai-btnのクリックイベントを追加
  document.querySelector('.searchai-btn').addEventListener('click', () => {
    document.querySelector('#aisearch').click();
  });
});

// グリッドモード切替関数
function updateGridMode(checked) {
  // checked: true ならグリッド解除、false ならグリッドON
  const targets = [
    document.getElementById('dynamic-links'),
    ...document.querySelectorAll('.linktext'),
    ...document.querySelectorAll('.links')
  ];
  targets.forEach(el => {
    if (!el) return;
    // checked = true (スイッチON) でグリッド解除 (gridクラスを削除)
    // checked = false (スイッチOFF) でグリッドON (gridクラスを追加)
    if (checked) {
      el.classList.remove('grid');
    } else {
      el.classList.add('grid');
    }
  });
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 は 12 にする
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function updateTime() {
  const now = new Date();
  const formatted = formatAMPM(now);
  document.getElementById('time').textContent = formatted;
}

updateTime(); // 初期表示
setInterval(updateTime, 1000); // 毎秒更新

document.getElementById('setting').addEventListener('click', function() {
  const targets = [
    document.getElementById('aisearch'),
    document.getElementById('setting'),
    document.getElementById('time'),
    document.querySelector('.bar'),
    document.getElementById('topRightCanvas'),
    document.querySelector('.settings')
  ];

  targets.forEach(el => {
    if (el) {
      el.classList.toggle('show');
    }
  });
});

// --- ショートカット一致時のアイコン表示 ---
let shortcutMatchBox = document.getElementById('shortcut-match-box');
const searchButton = document.getElementById('searchButton');
if (!shortcutMatchBox) {
  shortcutMatchBox = document.createElement('div');
  shortcutMatchBox.id = 'shortcut-match-box';
  shortcutMatchBox.style.display = 'none';
  shortcutMatchBox.style.background = 'var(--textboxbg, #fff9)';
  shortcutMatchBox.style.borderRadius = '32px';
  shortcutMatchBox.style.boxShadow = '0 2px 8px #0002';
  shortcutMatchBox.style.padding = '12px 24px 12px 16px';
  shortcutMatchBox.style.display = 'none';
  shortcutMatchBox.style.alignItems = 'center';
  shortcutMatchBox.style.gap = '12px';
  shortcutMatchBox.style.fontSize = '20px';
  shortcutMatchBox.style.pointerEvents = 'none';
  searchButton.parentNode.insertBefore(shortcutMatchBox, searchButton.nextSibling);
}

// --- links.jsonの全リンクをグローバルで保持 ---
let allAppLinks = [];

async function loadAllAppLinks() {
  try {
    const res = await fetch('links.json');
    const data = await res.json();
    allAppLinks = data.categories.flatMap(cat => cat.links);
  } catch (error) {
    console.error("links.json の読み込みに失敗しました:", error);
  }
}

// ★★★ ページのすべてのリソースが読み込まれた後に実行する処理 ★★★
window.onload = async function() {
  try {
    // 1. 必要なデータを非同期で読み込む (awaitで完了を待つ)
    await loadAllAppLinks();
    await loadIconsZip();

    // 2. リンク要素を動的に生成する (awaitで完了を待つ)
    await generateAppLinks();

    // 3. すべての要素が生成された後で、グリッドモードの初期化を行う
    const gridSwitch = document.getElementById('grid-switch');
    if (gridSwitch) {
      // localStorageから前回の状態を復元
      const savedGridMode = localStorage.getItem('gridMode');
      // スイッチのチェック状態を設定 ('on'ならチェック、それ以外はチェックしない)
      // このスイッチはONの時にグリッドが「解除」される仕様
      gridSwitch.checked = (savedGridMode === 'on');

      // 初期状態をページに適用
      updateGridMode(gridSwitch.checked);

      // スイッチが操作された時のイベントリスナーを設定
      gridSwitch.addEventListener('change', function() {
        // 現在の状態をlocalStorageに保存
        localStorage.setItem('gridMode', this.checked ? 'on' : 'off');
        // 現在の状態をページに適用
        updateGridMode(this.checked);
      });
    }
  } catch (error) {
    console.error("ページの初期化処理中にエラーが発生しました:", error);
  }
};


searchInput.addEventListener('input', function(e) {
  if (isAISearchMode) {
    shortcutMatchBox.style.display = 'none';
    shortcutMatchBox.innerHTML = '';
    shortcutMatchBox.style.background = 'var(--textboxbg, #fff9)';
    return;
  }
  const val = searchInput.value.trim();
  if (val.startsWith('@') && val.length > 1) {
    const name = val.slice(1).toLowerCase();
    const found = allAppLinks.find(s => s.name.toLowerCase() === name);
    if (found) {
      shortcutMatchBox.innerHTML = '';
      let iconUrl = '';
      if (typeof found.icon === 'string' && found.icon.endsWith('.webp')) {
        iconUrl = iconsMap[found.icon] || '';
      }
      if (!iconUrl) {
        iconUrl = 'https://search3958.github.io/favicon/newtab.svg';
      }
      const img = document.createElement('img');
      img.src = iconUrl;
      img.alt = found.name;
      img.style.width = '48px';
      img.style.height = '48px';
      img.style.borderRadius = '16px';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      const iconBg = found.bg || '#fff';
      const iconWrapper = document.createElement('div');
      iconWrapper.style.background = iconBg;
      iconWrapper.style.borderRadius = '16px';
      iconWrapper.style.display = 'flex';
      iconWrapper.style.alignItems = 'center';
      iconWrapper.style.justifyContent = 'center';
      iconWrapper.style.width = '56px';
      iconWrapper.style.height = '56px';
      const ripple = document.createElement('md-ripple');
      iconWrapper.appendChild(ripple);
      iconWrapper.appendChild(img);
      shortcutMatchBox.appendChild(iconWrapper);
      shortcutMatchBox.style.display = 'flex';
      shortcutMatchBox.style.background = '#fff';
      shortcutMatchBox.style.boxShadow = '0 2px 8px #0002';
      shortcutMatchBox.style.padding = '0';
      shortcutMatchBox.style.borderRadius = '0';
      return;
    }
  }
  shortcutMatchBox.style.display = 'none';
  shortcutMatchBox.innerHTML = '';
  shortcutMatchBox.style.background = 'var(--textboxbg, #fff9)';
});

// --- アイコンzip展開・iconsMap生成 ---
const iconsMap = {};
let iconsReady = false;
const iconWaiters = [];

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
  } catch (error) {
    console.error("アイコンzipの読み込みに失敗しました:", error);
  }
}

// --- アプリリスト動的生成 ---
async function generateAppLinks() {
  if (!iconsReady) {
    await new Promise(resolve => iconWaiters.push(resolve));
  }
  try {
    const res = await fetch('links.json');
    const data = await res.json();
    const container = document.getElementById('dynamic-links');
    if (!container) return;
    container.innerHTML = '';

    const shortcutHistory = JSON.parse(localStorage.getItem('shortcutHistory') || '[]');
    if (shortcutHistory.length > 0) {
      const recentTitleDiv = document.createElement('div');
      recentTitleDiv.className = 'linktext';
      recentTitleDiv.textContent = '最近の使用';
      container.appendChild(recentTitleDiv);
      const recentLinksDiv = document.createElement('div');
      recentLinksDiv.className = 'links';
      shortcutHistory.forEach(item => {
        const a = document.createElement('a');
        a.className = 'linkbox-anchor';
        a.href = item.url;
        a.rel = 'noopener noreferrer';
        const box = document.createElement('div');
        box.className = 'linkbox';
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'icon-wrapper';
        iconWrapper.style.backgroundColor = item.bg;
        const ripple = document.createElement('md-ripple');
        iconWrapper.appendChild(ripple);
        const img = document.createElement('img');
        img.className = 'linkbox-img';
        img.src = iconsMap[item.icon] || 'data:image/svg+xml;utf8,<svg width="110" height="110" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="110" fill="%23ccc"/><text x="50%" y="50%" font-size="18" text-anchor="middle" fill="%23666" dy=".3em">NoIcon</text></svg>';
        img.alt = item.name;
        iconWrapper.appendChild(img);
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
        label.textContent = item.name;
        box.appendChild(iconWrapper);
        box.appendChild(label);
        a.appendChild(box);
        a.addEventListener('click', (e) => {
          e.preventDefault();
          addToShortcutHistory(item.name, item.url, item.icon, item.bg);
          generateAppLinks();
          const url = a.href;
          setTimeout(() => {
            window.location.href = url;
          }, 50);
        });
        recentLinksDiv.appendChild(a);
      });
      container.appendChild(recentLinksDiv);
    }

    data.categories.forEach(category => {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'linktext';
      titleDiv.textContent = category.title;
      container.appendChild(titleDiv);
      const linksDiv = document.createElement('div');
      linksDiv.className = 'links';
      category.links.forEach(link => {
        const a = document.createElement('a');
        a.className = 'linkbox-anchor';
        a.href = link.url;
        a.rel = 'noopener noreferrer';
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
        a.addEventListener('click', (e) => {
          e.preventDefault();
          addToShortcutHistory(link.name, link.url, link.icon, link.bg);
          generateAppLinks();
          const url = a.href;
          setTimeout(() => {
            window.location.href = url;
          }, 50);
        });
        linksDiv.appendChild(a);
      });
      container.appendChild(linksDiv);
    });

  } catch (e) {
    console.error('アプリリストの取得に失敗:', e);
  }
}

function addToShortcutHistory(name, url, icon, bg) {
  let history = JSON.parse(localStorage.getItem('shortcutHistory') || '[]');
  history = history.filter(item => item.url !== url);
  history.unshift({ name, url, icon, bg });
  history = history.slice(0, 5);
  localStorage.setItem('shortcutHistory', JSON.stringify(history));
}

// --- 拡張機能（extensions）自動適用 ---
(function(){
  if (location.pathname.endsWith('/extensions/index.html')) return;
  try {
    const exts = JSON.parse(localStorage.getItem('extensions') || '[]');
    exts.forEach(ext => {
      if (ext.css) {
        const style = document.createElement('style');
        style.textContent = ext.css;
        style.dataset.extid = ext.id;
        document.head.appendChild(style);
      }
      if (ext.js) {
        const script = document.createElement('script');
        script.textContent = ext.js;
        script.dataset.extid = ext.id;
        document.body.appendChild(script);
      }
    });
  } catch(e) { /* 何もしない */ }
})();