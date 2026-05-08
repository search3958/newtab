(function injectLocalFont() {
  if (document.getElementById('local-google-sans-font')) return;
  const style = document.createElement('style');
  style.id = 'local-google-sans-font';
  style.textContent =
    '@font-face{font-family:"Google_Sans_Xiao2";' +
    'src:url(data:application/octet-stream;base64,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);}';
  document.head.appendChild(style);
})();

// ============================================================
// § 2. 壁紙から色を計算して CSS 変数に適用
// ============================================================
(function setupColorScan() {
  function rgbToHue(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      if      (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / (max - min) + 2;
      else                h = (r - g) / (max - min) + 4;
      h /= 6;
    }
    return Math.round(h * 360);
  }

  function scanAndApplyColor(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      img.onload = () => {
        requestIdleCallback(() => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const size = 30;
            canvas.width = canvas.height = size;
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            let r = 0, g = 0, b = 0;
            const step = 4, len = data.length;
            for (let i = 0; i < len; i += step * 4) {
              r += data[i]; g += data[i + 1]; b += data[i + 2];
            }
            const count = len / (4 * step);
            const deg = rgbToHue(r / count, g / count, b / count);
            document.documentElement.style.setProperty('--color-deg', deg + 'deg');
            resolve(deg);
          } catch (e) { reject(e); }
        }, { timeout: 1000 });
      };
      img.onerror = reject;
    });
  }

  function initColorFromWallpaper() {
    const url = document.body.dataset.lightUrl;
    if (url) scanAndApplyColor(url).catch(() => {});
  }

  window.rescanWallpaperColor = () => {
    const url = document.body.dataset.lightUrl;
    return url ? scanAndApplyColor(url) : Promise.reject('No wallpaper set');
  };

  // 壁紙が既に適用済みなら即スキャン、なければ適用後にスキャン
  initColorFromWallpaper();
})();

// ============================================================
// § 3. DOM 参照・定数
// ============================================================
const HISTORY_KEY = 'search_history_v2';
const ICON_MODE_KEY = 'icon_mode';
const DEFAULT_PLACEHOLDER = '検索や計算・アプリ';
const CHATGPT_PLACEHOLDER = 'ChatGPTに質問';

const searchInput  = document.querySelector('.search-input');
const searchBtn    = document.querySelector('.search-button');
const controlBtns  = document.querySelectorAll('.control-button');
const intelBox     = document.querySelector('.intelligence-box');
const intelIcon    = document.querySelector('.intelligence-icon');
const answerEl     = document.querySelector('.intelligence-answer');
const settingsDlg  = document.getElementById('settings-dialog');
const historyDlg   = document.getElementById('history-dialog');
const historyList  = document.getElementById('history-list');
const clearHistBtn = document.getElementById('clear-history');

// インライン側で公開したユーティリティを受け取る
const { sanitizeExpr, isMath, calcResult, RE_URL } = window._inlineUtils || {};

if (intelBox) intelBox.style.display = 'none';

// ============================================================
// § 4. 履歴
// ============================================================
let historyCache = null;

function getHistory() {
  if (historyCache !== null) return historyCache;
  try { historyCache = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { historyCache = []; }
  return historyCache;
}

function addHistory(q) {
  if (!q) return;
  const h = getHistory().filter(s => s !== q);
  h.unshift(q);
  if (h.length > 5) h.length = 5;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  historyCache = h;
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  historyCache = [];
}

// ============================================================
// § 5. 検索モード・プレースホルダー
// ============================================================
let searchMode = 'google';

function updatePlaceholder() {
  if (searchInput)
    searchInput.placeholder = searchMode === 'chatgpt' ? CHATGPT_PLACEHOLDER : DEFAULT_PLACEHOLDER;
}

// ============================================================
// § 6. アプリショートカット検索
// ============================================================
let appLinks  = [];
let foundApp  = null;
let curResult = null;

function searchApp(text) {
  if (!text || searchMode !== 'google') return null;
  const q = text.toLowerCase().trim();
  if (q.length < 2) return null;
  for (const app of appLinks) {
    const n = app.name.toLowerCase();
    if (n === q || n.includes(q)) return app;
  }
  return null;
}

// ============================================================
// § 7. 検索実行
// ============================================================
function doSearch() {
  const q = searchInput ? searchInput.value.trim() : '';
  if (!q) return;
  addHistory(q);
  if (searchMode === 'google') {
    if (foundApp)          { window.location.href = foundApp.url; return; }
    if (RE_URL && RE_URL.test(q)) {
      window.location.href = /^https?:\/\//i.test(q) ? q : 'https://' + q;
      return;
    }
    window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(q);
  } else {
    window.location.href = 'https://chatgpt.com/?hints=search&openaicom_referred=true&prompt=' + encodeURIComponent(q);
  }
}

if (searchBtn) searchBtn.onclick = doSearch;
if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

// ============================================================
// § 8. Intelligence ボックス (計算 / URL / アプリ)
// ============================================================
let hideTimeout  = null;
let updateTimer  = null;

function toggleIntel(show) {
  if (!intelIcon || !answerEl || !intelBox) return;
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
  if (show) {
    intelBox.style.display = 'flex';
    requestAnimationFrame(() => {
      intelBox.classList.add('active');
      intelIcon.classList.add('active');
      answerEl.classList.add('active');
    });
  } else {
    intelBox.classList.remove('active');
    intelIcon.classList.remove('active');
    answerEl.classList.remove('active');
    answerEl.classList.add('hide');
    hideTimeout = setTimeout(() => {
      if (!intelBox.classList.contains('active')) intelBox.style.display = 'none';
      hideTimeout = null;
    }, 500);
  }
}

function triggerIconRotation() {
  if (!intelIcon) return;
  intelIcon.classList.remove('animate-icon');
  void intelIcon.offsetWidth;
  intelIcon.classList.add('animate-icon');
  setTimeout(() => intelIcon.classList.remove('animate-icon'), 500);
}

function updateCalcDisplay() {
  if (!searchInput || !intelIcon || !answerEl) return;
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    const text  = searchInput.value.trim();
    const isUrl = RE_URL && RE_URL.test(text);
    const result = (!isUrl && isMath && isMath(text)) ? (calcResult && calcResult(text)) : null;
    const app  = (!isUrl && result === null) ? searchApp(text) : null;

    let newValue = null;
    if (isUrl)          newValue = 'URLを開く';
    else if (result !== null) newValue = String(result);
    else if (app)       newValue = app.name;

    if (searchMode === 'google' && newValue !== null) {
      if (newValue !== curResult) {
        triggerIconRotation();
        answerEl.classList.add('hide');
        setTimeout(() => {
          answerEl.textContent = newValue;
          curResult = newValue;
          foundApp  = app;
          answerEl.classList.remove('hide');
        }, 150);
      }
      toggleIntel(true);
    } else {
      toggleIntel(false);
      curResult = null;
      foundApp  = null;
    }
  }, 100);
}

if (searchInput) searchInput.addEventListener('input', updateCalcDisplay);

// ============================================================
// § 9. ダイアログ制御
// ============================================================
function hideAllDialogs() {
  if (settingsDlg && settingsDlg.classList.contains('show')) hideDialog(settingsDlg);
  if (historyDlg  && historyDlg.classList.contains('show'))  hideDialog(historyDlg);
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
  controlBtns.forEach((b, i) => {
    if (i === 2 && searchMode === 'chatgpt') return;
    b.classList.remove('active');
  });
  setTimeout(() => {
    if (!dlg.classList.contains('show')) dlg.style.display = 'none';
  }, 500);
}

// コントロールボタン
if (controlBtns[0]) {
  controlBtns[0].onclick = () =>
    settingsDlg.classList.contains('show') ? hideDialog(settingsDlg) : showDialog(settingsDlg, controlBtns[0]);
}

if (controlBtns[1]) {
  controlBtns[1].onclick = () => {
    if (historyDlg.classList.contains('show')) { hideDialog(historyDlg); return; }
    const h = getHistory();
    historyList.innerHTML = h.length ? '' : '<li style="color:#888;">履歴なし</li>';
    h.forEach(q => {
      const li = document.createElement('li');
      li.textContent = q;
      li.style.cssText = 'cursor:pointer;padding:8px 0;';
      li.onclick = () => { searchInput.value = q; hideDialog(historyDlg); doSearch(); };
      historyList.appendChild(li);
    });
    showDialog(historyDlg, controlBtns[1]);
  };
}

if (controlBtns[2]) {
  controlBtns[2].onclick = function () {
    hideAllDialogs();
    searchMode = searchMode === 'google' ? 'chatgpt' : 'google';
    this.classList.toggle('active', searchMode === 'chatgpt');
    updatePlaceholder();
    updateCalcDisplay();
  };
}

// スタンバイトグル
const standbyBtn = document.getElementById('standby-toggle');
if (standbyBtn) {
  standbyBtn.onclick = function () {
    document.body.classList.toggle('standby');
    document.querySelector('.applist-in')?.classList.toggle('standby');
    this.classList.toggle('active', document.body.classList.contains('standby'));
  };
}

// ダイアログ外クリックで閉じる
settingsDlg?.addEventListener('click', e => { if (e.target === settingsDlg) hideDialog(settingsDlg); });
historyDlg?.addEventListener('click',  e => { if (e.target === historyDlg)  hideDialog(historyDlg); });
clearHistBtn?.addEventListener('click', () => { clearHistory(); alert('検索履歴を削除しました'); hideDialog(settingsDlg); });

// ============================================================
// § 10. アイコンモード切替 (旧インライン script から移動)
// ============================================================
(function setupIconMode() {
  const toggleBtn = document.getElementById('toggle-icon-mode');
  let iconMode = parseInt(localStorage.getItem(ICON_MODE_KEY)) || 0;

  function applyIconMode(mode) {
    document.documentElement.style.setProperty('--icon-mode', mode);
    document.querySelectorAll('.appicon-bg').forEach(el => {
      el.style.background = mode === 1 ? 'var(--iconbg)' : (el.dataset.originalBg || '#eee');
    });
  }

  applyIconMode(iconMode);

  toggleBtn?.addEventListener('click', () => {
    iconMode = iconMode === 0 ? 1 : 0;
    localStorage.setItem(ICON_MODE_KEY, iconMode);
    applyIconMode(iconMode);
  });
})();

// ============================================================
// § 11. zip.js をロードしてからアイコンを描画
//        (完全に安定してから実行するため requestIdleCallback)
// ============================================================
async function loadIcons(container) {
  return new Promise((resolve, reject) => {
    // zip.js (fflate 互換 API) を動的ロード
    if (window.fflate) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'zip.js'; // 同じフォルダ
    s.onload  = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  }).then(async () => {
    const [imgMap, res] = await Promise.all([
      loadZip('lsr/icons-6-2.zip'),
      fetch('links-v6.json')
    ]);
    const data = await res.json();
    renderIcons(container, imgMap, data);
  });
}

function loadZip(url) {
  return fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => {
      const files = fflate.unzipSync(new Uint8Array(buf));
      const map = {};
      for (const [path, data] of Object.entries(files)) {
        const name = path.split('/').pop();
        if (name) map[name] = URL.createObjectURL(new Blob([data.buffer], { type: 'image/webp' }));
      }
      return map;
    })
    .catch(() => ({}));
}

function renderIcons(container, imageMap, data) {
  const iconMode = parseInt(localStorage.getItem(ICON_MODE_KEY)) || 0;
  const fragment = document.createDocumentFragment();

  for (const category of (data.categories || [])) {
    const catBg = document.createElement('div');
    catBg.className = 'category-bg';

    const h2 = document.createElement('h2');
    h2.className = 'category-title';
    h2.textContent = category.title || '無題';
    catBg.appendChild(h2);

    const catDiv = document.createElement('div');
    catDiv.className = 'category';

    for (const link of (category.links || [])) {
      appLinks.push({ name: link.name, url: link.url });

      const a = document.createElement('a');
      a.href = link.url || '#';

      const appDiv = document.createElement('div');
      appDiv.className = 'appicon-bg';
      const origBg = link.bg || '#eee';
      appDiv.dataset.originalBg = origBg;
      appDiv.style.background = iconMode === 1 ? 'var(--iconbg)' : origBg;

      const img = document.createElement('img');
      img.className = 'appicon-img';
      img.src = imageMap[link.icon] || link.icon || '';
      img.alt = link.name;
      // 遅延読み込み
      img.loading = 'lazy';

      const label = document.createElement('div');
      label.className = 'appicon-label';
      label.textContent = link.name;

      appDiv.appendChild(img);
      appDiv.appendChild(label);
      a.appendChild(appDiv);
      catDiv.appendChild(a);
    }

    catBg.appendChild(catDiv);
    fragment.appendChild(catBg);
  }

  container.appendChild(fragment);
}

// ============================================================
// § 13. AdSense (アイコン描画後に遅延挿入)
// ============================================================
function loadAdsenseScript() {
  return new Promise((resolve, reject) => {
    const ID = 'adsbygoogle-js';
    if (document.getElementById(ID)) { resolve(); return; }
    const s = document.createElement('script');
    s.id = ID; s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874';
    s.crossOrigin = 'anonymous';
    s.onload  = resolve;
    s.onerror = reject;
    (document.head || document.documentElement).appendChild(s);
  });
}

function initAds(container) {
  // アイコン描画から 2 秒後、さらに idle 時に挿入
  setTimeout(() => {
    requestIdleCallback(() => {
      try {
        const wrap = document.createElement('div');
        wrap.className = 'adsense-container';
        wrap.style.cssText = 'width:100%;margin-top:20px;';
        wrap.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="ca-pub-6151036058675874" data-ad-slot="9559715307"></ins>';
        container.appendChild(wrap);
        loadAdsenseScript().then(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }).catch(() => {});
      } catch (e) { console.error('[Ads]', e); }
    }, { timeout: 3000 });
  }, 2000);
}

// ============================================================
// § 14. メインデータ読み込みフロー
// ============================================================
async function loadData() {
  const container = document.querySelector('.applist-in');
  if (!container) return;

  // zip.js が安定してロードされてからアイコンを描画
  requestIdleCallback(() => {
    loadIcons(container)
      .then(() => initAds(container))
      .catch(e => console.error('[beta] icon load failed', e));
  }, { timeout: 1500 });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', loadData);
} else {
  loadData();
}

// ============================================================
// § 15. lang.js / check.js — 完全安定後にロード
// ============================================================
requestIdleCallback(() => {
  // check.js
  const checkScript = document.createElement('script');
  checkScript.src = 'https://search3958.github.io/check.js';
  document.head.appendChild(checkScript);
}, { timeout: 2000 });

requestIdleCallback(() => {
  // lang.js (xml 属性付き)
  const langScript = document.createElement('script');
  langScript.src = 'https://search3958.github.io/newtab/xml/lang.js';
  langScript.setAttribute('data-xml', 'https://search3958.github.io/newtab/xml/beta.xml');
  langScript.onload = () => console.log('[beta] lang.js loaded');
  (document.head || document.documentElement).appendChild(langScript);
}, { timeout: 2500 });