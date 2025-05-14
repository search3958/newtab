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

// AISearch モード切り替え関数
function toggleAISearch() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const aiSearch = document.getElementById('aisearch');
  const aiBg = document.getElementById('aiBg');
  isAISearchMode = !isAISearchMode;
  
  if (isAISearchMode) {
    // AI検索モードに切り替え
    searchInput.classList.add('active');
    searchButton.classList.add('active');
    aiBg.classList.add('active');
    aiSearch.classList.add('active');
    searchInput.placeholder = "AIは不正確な情報を示すことがあります";
  } else {
    // 通常の検索モードに戻す
    searchInput.classList.remove('active');
    searchButton.classList.remove('active');
    aiBg.classList.remove('active');
    aiSearch.classList.remove('active');
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
  if (now.getMonth() === 6 && now.getDate() >= 17 && now.getDate() <= 30) {
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
        // 検索履歴アイテムのリンク先も、現在のモードに応じて変更
        const baseUrl = isAISearchMode 
          ? "https://search3958.github.io/aisearch/?q=" 
          : "https://www.google.com/search?q=";
        a.href = `${baseUrl}${encodeURIComponent(item)}`;
        a.textContent = item;

        div.appendChild(a);
        historyList.appendChild(div);
      }
    });
  }

  // 検索処理
  function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      // 検索エンジンのURLを状態に応じて変更
      const baseUrl = isAISearchMode 
        ? "https://search3958.github.io/aisearch/?q=" 
        : "https://www.google.com/search?q=";
      
      const url = `${baseUrl}${encodeURIComponent(query)}`;
      
      let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
      history = history.filter(item => typeof item === 'string');
      history = history.filter(item => item !== query);
      history.unshift(query);
      if (history.length > 5) history.pop();

      localStorage.setItem('searchHistory', JSON.stringify(history));
      renderHistory();
      
      // 検索を実行
      window.location.href = url;
    }
  }

  document.getElementById('searchButton').addEventListener('click', performSearch);

  // クリアボタン処理
  document.getElementById('clearButton').addEventListener('click', function () {
    localStorage.removeItem('searchHistory');
    renderHistory();
  });

  // 初期表示
  renderHistory();

  // フォーム送信時（Enter押下）のイベント
  document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); // デフォルトのフォーム送信を防止
    performSearch();
  });

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
    displayShortcutHistory();
  }

  function displayShortcutHistory() {
    const historyContainer = document.querySelector('.shortcut .links');
    if (!historyContainer) return;

    const history = JSON.parse(localStorage.getItem('shortcutHistory') || '[]');
    
    if (history.length === 0) {
      historyContainer.innerHTML = '<div class="empty-history">ここに履歴が表示されます</div>';
    } else {
      historyContainer.innerHTML = history.map(item => 
        `<link-box name="${item.name}" bg="${item.bg}" url="${item.url}" icon="${item.icon}"></link-box>`
      ).join('');
    }
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

  // 初期表示
  displayShortcutHistory();
});

// link-box.js（モジュールではなく通常のスクリプトとして統合）
// JSZip は事前に <script src="https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js"></script> で読み込まれている前提

(function () {
  const iconsMap = {};
  let iconsReady = false;
  const iconWaiters = [];

  const zipUrl = 'https://search3958.github.io/newtab/lsr/icons.zip';

  async function loadIcons() {
    const res = await fetch(zipUrl);
    if (!res.ok) throw new Error(`Failed to fetch icons.zip: ${res.status}`);
    const blob = await res.blob();
    const zip = await JSZip.loadAsync(blob);
    const tasks = [];
    zip.forEach((relativePath, file) => {
      if (file.name.endsWith('.webp')) {
        const task = file.async('blob').then(blobData => {
          const objectURL = URL.createObjectURL(blobData);
          const fileName = file.name.split('/').pop();
          iconsMap[fileName] = objectURL; // ← ZIP内のファイル名だけをキーに
        });
        tasks.push(task);
      }
    });
    await Promise.all(tasks);
    iconsReady = true;
    iconWaiters.forEach(fn => fn());
    console.log('Icons loaded:', Object.keys(iconsMap));
  }

  class LinkBox extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'img', 'bg', 'url', 'icon'];
    }

    constructor() {
      super();
      this._render();
    }

    connectedCallback() {
      if (!LinkBox.iconsLoaded) {
        LinkBox.iconsLoaded = true;
        loadIcons().catch(err => console.error(err));
      }
      this._updateAll();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal !== newVal) this._update(name, newVal);
    }

    _render() {
      this.innerHTML = `
        <a class="linkbox-anchor" href="#">
          <div class="linkbox">
            <div class="icon-wrapper">
              <img class="linkbox-img" />
            </div>
            <div class="linkbox-label"></div>
          </div>
        </a>
      `;
      this.$anchor = this.querySelector('.linkbox-anchor');
      this.$iconWrapper = this.querySelector('.icon-wrapper');
      this.$img = this.querySelector('.linkbox-img');
      this.$label = this.querySelector('.linkbox-label');
    }

    _updateAll() {
      ['url', 'bg', 'img', 'name', 'icon'].forEach(attr => {
        const val = this.getAttribute(attr);
        if (val !== null) this._update(attr, val);
      });
    }

    _update(attr, value) {
      switch (attr) {
        case 'url':
          this.$anchor.href = value;
          break;
        case 'bg':
          this.$iconWrapper.style.backgroundColor = value;
          break;
        case 'img':
          this.$img.src = value;
          break;
        case 'name':
          this.$label.textContent = value;
          break;
        case 'icon': {
          const applyIcon = () => {
            const iconUrl = iconsMap[value];
            if (iconUrl) {
              this.$img.src = iconUrl;
            } else {
              console.warn(`Icon not found: ${value}`);
            }
          };
          if (iconsReady) {
            applyIcon();
          } else {
            iconWaiters.push(applyIcon);
          }
          break;
        }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    customElements.define('link-box', LinkBox);
  });
})();

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
  const card = document.querySelector('.settings');
  card.classList.toggle('active');
});