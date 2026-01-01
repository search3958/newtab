// beta/afterload.js

(function() {
  // =================================================================
  // 0. 壁紙とテーマカラーの制御ロジック
  // =================================================================

  /**
   * RGBからHue(色相)を算出
   */
  function rgbToHue(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / (max - min) + 2;
      else if (max === b) h = (r - g) / (max - min) + 4;
      h /= 6;
    }
    return Math.round(h * 360);
  }

  /**
   * 画像URLからメインカラー(Hue)を抽出
   */
  async function extractMainColorDeg(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50; canvas.height = 50; // 解析用に縮小
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i+1]; b += data[i+2];
        }
        const count = data.length / 4;
        resolve(rgbToHue(r/count, g/count, b/count));
      };
      img.onerror = reject;
    });
  }

  /**
   * 壁紙の適用と色の復元・スキャン
   */
  async function applyWallpaper(lightBlob, darkBlob = null) {
    // --- 1. ローカルストレージからの復元 ---
    const savedDeg = localStorage.getItem('user-wallpaper-deg') || '15';
    document.documentElement.style.setProperty('--color-deg', `${savedDeg}deg`);

    // 既存URLの解放
    const existingLightUrl = document.body.dataset.lightUrl;
    const existingDarkUrl = document.body.dataset.darkUrl;
    if (existingLightUrl) URL.revokeObjectURL(existingLightUrl);
    if (existingDarkUrl) URL.revokeObjectURL(existingDarkUrl);

    // --- 2. 壁紙の設定 ---
    let lightUrl = 'bgimg/chips1.png'; // デフォルト
    if (lightBlob) {
      lightUrl = URL.createObjectURL(lightBlob);
      document.body.style.setProperty('--user-wallpaper-light', `url('${lightUrl}')`);
      document.body.dataset.lightUrl = lightUrl;
    } else {
      document.body.style.setProperty('--user-wallpaper-light', `url('${lightUrl}')`); 
    }

    if (darkBlob) {
      const darkUrl = URL.createObjectURL(darkBlob);
      document.body.style.setProperty('--user-wallpaper-dark', `url('${darkUrl}')`);
      document.body.dataset.darkUrl = darkUrl;
    } else {
      document.body.style.setProperty('--user-wallpaper-dark', `var(--user-wallpaper-light)`); 
    }

    // --- 3. 画像をスキャンして色を更新 ---
    if (lightBlob) {
      try {
        const deg = await extractMainColorDeg(lightUrl);
        document.documentElement.style.setProperty('--color-deg', `${deg}deg`);
        localStorage.setItem('user-wallpaper-deg', deg);
      } catch (e) {
        console.error("Color scan failed:", e);
      }
    }
  }

  // =================================================================
  // 1. Google Fonts の動的読み込み
  // =================================================================
  function loadGoogleFont() {
    if (document.getElementById('google-fonts-link')) return;
    const link = document.createElement('link');
    link.id = 'google-fonts-link';
    link.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  loadGoogleFont();

  // =================================================================
  // 2. 検索・履歴・UI制御 & インテリジェンス
  // =================================================================
  const HISTORY_KEY = 'search_history_v2';
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-button');
  const controlBtns = document.querySelectorAll('.control-button'); 

  const intelligenceBox = document.querySelector('.intelligence-box');
  const intelligenceIcon = document.querySelector('.intelligence-icon');
  const answerElement = document.querySelector('.intelligence-answer');

  if (intelligenceBox) intelligenceBox.style.display = 'none';

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
  }

  function addHistory(q) {
    if (!q) return;
    let h = getHistory();
    h = h.filter(e => e !== q);
    h.unshift(q);
    if (h.length > 5) h = h.slice(0, 5);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  let searchMode = 'google';
  const DEFAULT_PLACEHOLDER = '検索や計算・アプリ';
  const CHATGPT_PLACEHOLDER = 'ChatGPTに質問';

  function updatePlaceholder() {
    if (!searchInput) return;
    searchInput.placeholder = (searchMode === 'chatgpt') ? CHATGPT_PLACEHOLDER : DEFAULT_PLACEHOLDER;
  }

  let appLinks = [];
  let foundApp = null;
  let currentResult = null;
  let hideTimeout = null; 

  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    addHistory(q);
    if (foundApp && searchMode === 'google') {
      window.location.href = foundApp.url;
      return;
    }
    let url = (searchMode === 'google') 
      ? 'https://www.google.com/search?q=' + encodeURIComponent(q)
      : 'https://chatgpt.com/?hints=search&openaicom_referred=true&prompt=' + encodeURIComponent(q);
    window.location.href = url;
  }

  if (searchBtn) searchBtn.onclick = doSearch;
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
    });
  }

  function toggleIntelligenceActive(show) {
    if (!intelligenceIcon || !answerElement || !intelligenceBox) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    if (show) {
      intelligenceBox.style.display = 'flex';
      requestAnimationFrame(() => {
        intelligenceBox.classList.add('active'); 
        intelligenceIcon.classList.add('active');
        answerElement.classList.add('active');
      });
    } else {
      intelligenceBox.classList.remove('active');
      intelligenceIcon.classList.remove('active');
      answerElement.classList.remove('active');
      answerElement.classList.add('hide');
      hideTimeout = setTimeout(() => {
        if (!intelligenceBox.classList.contains('active')) {
          intelligenceBox.style.display = 'none';
        }
        hideTimeout = null;
      }, 500); 
    }
  }

  function sanitizeExpression(expr) {
    let sanitized = expr.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    sanitized = sanitized.replace(/[×✖️xX]/g, '*').replace(/[÷➗]/g, '/').replace(/[ー]/g, '-').replace(/[＋]/g, '+');
    return sanitized.replace(/[^0-9+\-*/().\s]/g, '');
  }

  function isMathExpression(str) {
    if (!str) return false;
    const sanitized = sanitizeExpression(str);
    const checkExpr = sanitized.replace(/[\s+\-*/().]*$/, '');
    return /^[\d\s+\-*/().]+$/.test(sanitized) && /[+\-*/]/.test(checkExpr);
  }

  function calculateResult(expr) {
    const sanitized = sanitizeExpression(expr).replace(/[\s+\-*/().]*$/, '');
    try {
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return (typeof result === 'number' && !isNaN(result) && isFinite(result)) ? result : null;
    } catch { return null; }
  }

  function searchApp(text) {
    if (!text || searchMode !== 'google') return null;
    const q = text.toLowerCase().trim();
    if (q.length < 2) return null;
    return appLinks.find(app => app.name.toLowerCase() === q || app.name.toLowerCase().includes(q)) || null;
  }

  function triggerIconRotation() {
    if (!intelligenceIcon) return;
    intelligenceIcon.classList.remove('animate-icon');
    void intelligenceIcon.offsetWidth; 
    intelligenceIcon.classList.add('animate-icon');
  }

  function updateCalculationDisplay() {
    if (!searchInput || !intelligenceIcon || !answerElement) return;

    const inputText = searchInput.value.trim();
    const result = isMathExpression(inputText) ? calculateResult(inputText) : null;
    const app = (!result) ? searchApp(inputText) : null;
    const newValue = result !== null ? String(result) : (app ? app.name : null);

    if (searchMode === 'google' && newValue !== null) {
      if (newValue !== currentResult) {
        answerElement.classList.add('hide');
        triggerIconRotation();
        setTimeout(() => {
          answerElement.textContent = newValue;
          currentResult = newValue;
          foundApp = app;
          answerElement.classList.remove('hide');
        }, 150);
      }
      toggleIntelligenceActive(true);
    } else {
      toggleIntelligenceActive(false);
      currentResult = null;
      foundApp = null;
    }
  }

  if (searchInput) searchInput.addEventListener('input', updateCalculationDisplay);

  // --- ダイアログ制御 ---
  const settingsDlg = document.getElementById('settings-dialog');
  const historyDlg = document.getElementById('history-dialog');

  function hideAllDialogs() {
    [settingsDlg, historyDlg].forEach(dlg => {
      if (dlg && dlg.classList.contains('show')) {
        hideDialog(dlg);
      }
    });
  }

  function showDialog(dlg, btn) {
    if (!dlg) return;
    hideAllDialogs();
    dlg.style.display = 'flex';
    requestAnimationFrame(() => {
      dlg.classList.add('show');
      if (btn) btn.classList.add('active'); 
    });
  }

  function hideDialog(dlg) {
    if (!dlg) return;
    dlg.classList.remove('show');
    controlBtns.forEach(b => {
      if (b === controlBtns[2] && searchMode === 'chatgpt') return;
      b.classList.remove('active');
    });
    setTimeout(() => { 
      if (!dlg.classList.contains('show')) dlg.style.display = 'none'; 
    }, 500);
  }

  if (controlBtns[0]) {
    controlBtns[0].onclick = () => {
      if (settingsDlg.classList.contains('show')) {
        hideDialog(settingsDlg);
      } else {
        showDialog(settingsDlg, controlBtns[0]);
      }
    };
  }

  if (controlBtns[1]) {
    controlBtns[1].onclick = () => {
      if (historyDlg.classList.contains('show')) {
        hideDialog(historyDlg);
        return;
      }
      const historyList = document.getElementById('history-list');
      const h = getHistory();
      historyList.innerHTML = h.length ? '' : '<li style="color:#888;">履歴なし</li>';
      h.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q;
        li.style.cssText = 'cursor:pointer; padding:8px 0;';
        li.onclick = () => {
          searchInput.value = q;
          hideDialog(historyDlg);
          doSearch();
        };
        historyList.appendChild(li);
      });
      showDialog(historyDlg, controlBtns[1]);
    };
  }

  if (controlBtns[2]) {
    controlBtns[2].onclick = function() {
      hideAllDialogs();
      searchMode = (searchMode === 'google') ? 'chatgpt' : 'google';
      this.classList.toggle('active', searchMode === 'chatgpt');
      updatePlaceholder();
      updateCalculationDisplay();
    };
  }

  [settingsDlg, historyDlg].forEach(dlg => {
    if (dlg) {
      dlg.addEventListener('click', e => { 
        if (e.target === dlg) hideDialog(dlg); 
      });
    }
  });

  const clearHistoryBtn = document.getElementById('clear-history');
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = () => {
      clearHistory();
      alert('検索履歴を削除しました');
      hideDialog(settingsDlg);
    };
  }

  // =================================================================
  // 3. リアルタイム情報更新 (時計・日付・バッテリー)
  // =================================================================
  function setupInfoSection(container) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';
    infoDiv.innerHTML = `
      <div class="info-time" style="font-size:5em; margin:0px; font-family:'Google Sans', sans-serif;">--:--</div>
      <div class="info-details">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>
        <span class="info-date">----年--月--日</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-240q-50 0-85-35t-35-85v-240q0-50 35-85t85-35h540q50 0 85 35t35 85v240q0 50-35 85t-85 35H160Zm0-80h540q17 0 28.5-11.5T740-360v-240q0-17-11.5-28.5T700-640H160q-17 0-28.5 11.5T120-600v240q0 17 11.5 28.5T160-320Zm700-60v-200h20q17 0 28.5-11.5T920-540v120q0 17-11.5 28.5T880-380h-20Zm-700 20v-240h540v240H160Z"/></svg>
        <span class="info-battery">バッテリー --%</span>
      </div>
    `;
    container.prepend(infoDiv);

    const timeEl = infoDiv.querySelector('.info-time');
    const dateEl = infoDiv.querySelector('.info-date');
    const battEl = infoDiv.querySelector('.info-battery');

    function update() {
      const now = new Date();
      if (timeEl) timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (dateEl) dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    }

    async function initBattery() {
      if (!navigator.getBattery) return;
      const b = await navigator.getBattery();
      const ref = () => { if (battEl) battEl.textContent = `バッテリー ${Math.round(b.level * 100)}%`; };
      ref();
      b.addEventListener('levelchange', ref);
    }

    update();
    setInterval(update, 1000);
    initBattery();
  }

  // =================================================================
  // 4. アプリ一覧構築 & 初期化
  // =================================================================
  const loadZip = async (url) => {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const files = fflate.unzipSync(new Uint8Array(buffer));
      const imageMap = {};
      for (const [path, data] of Object.entries(files)) {
        const fileName = path.split('/').pop();
        if (!fileName) continue;
        imageMap[fileName] = URL.createObjectURL(new Blob([data.buffer], { type: 'image/webp' }));
      }
      return imageMap;
    } catch (e) { return {}; }
  };

  const loadData = async () => {
    // 壁紙の初期復元
    applyWallpaper(null); 

    const container = document.querySelector('.applist-in');
    if (!container) return;
    
    setupInfoSection(container);

    try {
      const imageMap = await loadZip('lsr/icons-6.zip');
      const res = await fetch('links-v6.json');
      const data = await res.json();
      
      const fragment = document.createDocumentFragment();
      (data.categories || []).forEach((category) => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category';
        catDiv.innerHTML = `<h2 class="category-title">${category.title || '無題'}</h2>`;
        (category.links || []).forEach(link => {
          appLinks.push({ name: link.name, url: link.url });
          const a = document.createElement('a');
          a.href = link.url || '#';
          a.innerHTML = `
            <div class="appicon-bg" style="background:${link.bg || '#eee'}">
              <img class="appicon-img" src="${imageMap[link.icon] || link.icon || ''}" alt="${link.name}">
              <div class="appicon-label">${link.name}</div>
            </div>
          `;
          catDiv.appendChild(a);
        });
        fragment.appendChild(catDiv);
      });
      container.appendChild(fragment);

      // Ads
      const adDiv = document.createElement('div');
      adDiv.style.cssText = 'width:100%; margin-top:20px;';
      adDiv.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="ca-pub-6151036058675874" data-ad-slot="9559715307"></ins>`;
      container.appendChild(adDiv);
      const s = document.createElement('script');
      s.async = true; s.src = "https://pagead2.googlesyndication.com/pagead2/js/adsbygoogle.js?client=ca-pub-6151036058675874";
      document.head.appendChild(s);
      (window.adsbygoogle = window.adsbygoogle || []).push({});

    } catch (e) { console.error(e); }
  };

  if (document.readyState === 'loading') { 
    window.addEventListener('DOMContentLoaded', loadData); 
  } else { 
    loadData(); 
  }

  const checkScript = document.createElement('script');
  checkScript.src = 'https://search3958.github.io/check.js';
  document.head.appendChild(checkScript);
})();