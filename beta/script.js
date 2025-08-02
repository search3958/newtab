// 履歴管理機能
const HISTORY_KEY = 'shortcut_history';
const MAX_HISTORY = 4;

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
  
  // 履歴が空の場合はデフォルトアイテムを表示
  if (history.length === 0) {
    const defaultItems = [
      { name: "TechPick 10", url: "https://search3958.github.io/techpick10/", icon: "techpick10.webp", bg: "rgba(255, 255, 255, 0.759)" },
      { name: "Gmail", url: "https://mail.google.com/", icon: "gmail.webp", bg: "var(--iconbg)" },
      { name: "ChatGPT", url: "https://chat.openai.com/", icon: "chatgpt.webp", bg: "#000000bb" },
      { name: "Tools", url: "https://search3958.github.io/tools", icon: "tools.webp", bg: "var(--iconbg)" }
    ];
    history = defaultItems;
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

// ページ読み込み時は.showクラスを外す（スクロールが0の状態）
document.addEventListener('DOMContentLoaded', function() {
  var shortcuts = document.querySelector('.shortcuts');
  if (shortcuts) {
    shortcuts.classList.remove('show');
  }
  
  // リンクの生成を開始
  loadIconsAndGenerateLinks();
  
  // 履歴表示を初期化
  updateHistoryDisplay();
  
  // 日付とバッテリー残量を表示
  updateTodayInfo();
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
    
    // 각カテゴリの링크を생성
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
        
        // 클릭이벤트を추가해서히스토리에저장
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

      // 쇼핑핑일때광고스크립트추가
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

    // 모든이미지독입완료를대기
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

    // 모든이미지독입완료후0.5초지연
    await Promise.all(imageLoadPromises);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 완전독입완료후에.bottombar에.show클래스추가
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