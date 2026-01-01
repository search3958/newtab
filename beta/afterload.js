// beta/afterload.js

(function() {
  // =================================================================
  // 1. Google Fonts の動的読み込み
  // =================================================================
  function loadGoogleFont() {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  loadGoogleFont();

  // =================================================================
  // 2. 検索・履歴・UI制御
  // =================================================================
  const HISTORY_KEY = 'search_history_v2';
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch { return []; }
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
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-button');
  const controlBtns = document.querySelectorAll('.search-control .control-button');

  const DEFAULT_PLACEHOLDER = '検索や計算・アプリ';
  const CHATGPT_PLACEHOLDER = 'ChatGPTに質問';

  function updatePlaceholder() {
    if (!searchInput) return;
    searchInput.placeholder = (searchMode === 'chatgpt') ? CHATGPT_PLACEHOLDER : DEFAULT_PLACEHOLDER;
  }
  updatePlaceholder();

  let appLinks = []; 
  let foundApp = null;

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
  if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  if (controlBtns[2]) {
    controlBtns[2].onclick = function() {
      searchMode = (searchMode === 'google') ? 'chatgpt' : 'google';
      this.classList.toggle('active', searchMode === 'chatgpt');
      updatePlaceholder();
    };
  }

  // --- 計算機能・インテリジェンス表示 ---
  const applistIn = document.querySelector('.applist-in');
  const applist = applistIn ? applistIn.closest('.applist') : null;
  const intelligenceBox = applist ? applist.querySelector('.intelligence-box') : null;
  const answerElement = intelligenceBox ? intelligenceBox.querySelector('.intelligence-answer') : null;

  function sanitizeExpression(expr) {
    let s = expr.replace(/[０-９]/g, m => String.fromCharCode(m.charCodeAt(0) - 0xFEE0));
    s = s.replace(/[×✖️x]/g, '*').replace(/[÷➗]/g, '/').replace(/[ー]/g, '-').replace(/[＋]/g, '+');
    return s.replace(/[^0-9+\-*/().\s]/g, '');
  }

  function isMathExpression(str) {
    if (!str) return false;
    const s = sanitizeExpression(str);
    return /^[\d\s+\-*/().]+$/.test(s) && /[+\-*/]/.test(s.replace(/[\s+\-*/().]*$/, ''));
  }

  function calculateResult(expr) {
    const s = sanitizeExpression(expr).replace(/[\s+\-*/().]*$/, '');
    try {
      const res = Function('"use strict"; return (' + s + ')')();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) return res;
    } catch {}
    return null;
  }

  let currentResult = null;
  function searchApp(text) {
    if (!text || searchMode !== 'google') return null;
    const q = text.toLowerCase().trim();
    if (q.length < 2) return null;
    return appLinks.find(app => app.name.toLowerCase() === q) || 
           appLinks.find(app => app.name.toLowerCase().includes(q)) || null;
  }

  const triggerIconRotation = (el) => {
    if (!el || el.classList.contains('animate-icon')) return;
    el.classList.add('animate-icon');
    setTimeout(() => el.classList.remove('animate-icon'), 1000);
  };

  function updateCalculationDisplay() {
    if (!searchInput || !applist || !answerElement) return;
    const inputText = searchInput.value;
    const isMath = isMathExpression(inputText);
    const target = applist;

    if (isMath && searchMode === 'google') {
      foundApp = null;
      const res = calculateResult(inputText);
      if (res !== null && res !== currentResult) {
        answerElement.classList.add('hide');
        triggerIconRotation(target);
        setTimeout(() => {
          answerElement.textContent = `${res}`;
          currentResult = res;
          answerElement.classList.remove('hide');
        }, 150);
        target.classList.add('intelligence');
      } else if (res !== null) {
        target.classList.add('intelligence');
      } else {
        target.classList.remove('intelligence');
        currentResult = null;
      }
    } else if (!isMath && searchMode === 'google') {
      currentResult = null;
      const app = searchApp(inputText);
      if (app) {
        if (!foundApp || app.name !== foundApp.name) {
          foundApp = app;
          triggerIconRotation(target);
          answerElement.classList.add('hide');
          setTimeout(() => {
            answerElement.textContent = `${app.name}`;
            answerElement.classList.remove('hide');
          }, 150);
        }
        target.classList.add('intelligence');
      } else {
        foundApp = null;
        target.classList.remove('intelligence');
      }
    } else {
      target.classList.remove('intelligence');
      currentResult = null;
      foundApp = null;
    }
  }

  if (searchInput) searchInput.addEventListener('input', updateCalculationDisplay);

  // --- ダイアログ制御 ---
  function showDialog(el) {
    if (!el) return;
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('show'));
  }
  function hideDialog(el) {
    if (!el) return;
    el.classList.remove('show');
    setTimeout(() => { if (!el.classList.contains('show')) el.style.display = 'none'; }, 1000);
  }

  const historyDialog = document.getElementById('history-dialog');
  const historyList = document.getElementById('history-list');
  const settingsDialog = document.getElementById('settings-dialog');

  if (controlBtns[1] && historyDialog && historyList) {
    controlBtns[1].onclick = function() {
      if (settingsDialog?.classList.contains('show')) hideDialog(settingsDialog);
      const h = getHistory();
      historyList.innerHTML = h.length === 0 ? '<li style="color:#888;">履歴なし</li>' : '';
      h.forEach(q => {
        const li = document.createElement('li');
        li.style.cssText = 'cursor:pointer; padding:4px 0;';
        li.textContent = q;
        li.onclick = () => { searchInput.value = q; hideDialog(historyDialog); doSearch(); };
        historyList.appendChild(li);
      });
      showDialog(historyDialog);
    };
  }

  if (controlBtns[0] && settingsDialog) {
    controlBtns[0].onclick = function() {
      if (historyDialog?.classList.contains('show')) hideDialog(historyDialog);
      showDialog(settingsDialog);
    };
  }

  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.onclick = function() {
      clearHistory();
      alert('検索履歴を削除しました');
      hideDialog(settingsDialog);
    };
  }

  [historyDialog, settingsDialog].forEach(dlg => {
    if (!dlg) return;
    dlg.style.display = 'none';
    dlg.addEventListener('click', e => { if (e.target === dlg) hideDialog(dlg); });
  });

  // =================================================================
  // 3. アプリ一覧の構築（奇数行要素数減・インラインスタイル削除版）
  // =================================================================
  let cachedData = null;
  let cachedImageMap = {};

  const importFflate = () => {
    return new Promise((resolve, reject) => {
      if (typeof fflate !== 'undefined') return resolve(fflate);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/fflate@0.8.2/umd/index.js';
      script.onload = () => resolve(fflate);
      script.onerror = () => reject(new Error('fflate load failed'));
      document.head.appendChild(script);
    });
  };

  const loadZip = async (url) => {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const files = fflate.unzipSync(new Uint8Array(buffer));
      const imageMap = {};
      for (const [path, data] of Object.entries(files)) {
        const blob = new Blob([data.buffer], { type: 'image/webp' });
        imageMap[path.split('/').pop()] = URL.createObjectURL(blob);
      }
      return imageMap;
    } catch (err) { return {}; }
  };

  function renderAppList() {
    const container = document.querySelector('.applist-in');
    if (!container || !cachedData) return;

    container.innerHTML = '';
    const containerWidth = container.clientWidth;
    const baseCols = Math.max(2, Math.floor(containerWidth / 125)); // 基本の列数

    const allLinks = [];
    (cachedData.categories || []).forEach(cat => {
      (cat.links || []).forEach(link => {
        if (link.name && link.url) allLinks.push(link);
      });
    });
    appLinks = allLinks;

    let linkIndex = 0;
    let rowIndex = 0;

    while (linkIndex < allLinks.length) {
      // 奇数行(rowIndex 0, 2, 4...)は baseCols - 1
      // 偶数行(rowIndex 1, 3, 5...)は baseCols
      // ※「奇数行は要素数を減らす」というご要望に基づき、1行目(index 0)を減らしています
      const isOddRow = rowIndex % 2 === 0; 
      const currentCols = isOddRow ? Math.max(1, baseCols - 1) : baseCols;

      const currentRow = document.createElement('div');
      currentRow.className = 'app-row';
      if (isOddRow) currentRow.classList.add('row-odd');
      container.appendChild(currentRow);

      for (let i = 0; i < currentCols && linkIndex < allLinks.length; i++) {
        const link = allLinks[linkIndex++];
        const a = document.createElement('a');
        a.href = link.url || '#';
        a.target = '_self';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'appicon-bg';
        if (link.bg) iconDiv.style.background = link.bg;

        const img = document.createElement('img');
        img.className = 'appicon-img';
        img.src = cachedImageMap[link.icon] || link.icon || '';
        img.alt = link.name || '';

        const label = document.createElement('div');
        label.className = 'appicon-label';
        label.textContent = link.name || '';

        iconDiv.appendChild(img);
        iconDiv.appendChild(label);
        a.appendChild(iconDiv);
        currentRow.appendChild(a);
      }
      rowIndex++;
    }
  }

  const loadData = async () => {
    try {
      await importFflate();
      cachedImageMap = await loadZip('lsr/icons-6.zip');
      const res = await fetch('links-v6.json');
      cachedData = await res.json();

      renderAppList();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderAppList, 200);
      });

      const container = document.querySelector('.applist-in');
      const checkVisibility = () => {
        const rect = container.getBoundingClientRect();
        container.classList.toggle('visible', rect.top <= 0);
      };
      window.addEventListener('scroll', checkVisibility);
      checkVisibility();

    } catch (err) { console.error('loadData error', err); }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }

  // =================================================================
  // 4. Liquid Glass エフェクト & 5. 外部スクリプト
  // =================================================================
  function applyLiquidGlassEffect(container) {
    const outerCount = 10, outerStep = 4, borderThickness = 6;
    let masks = [];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < outerCount; i++) {
      const mask = document.createElement('div');
      Object.assign(mask.style, {
        position: 'absolute', pointerEvents: 'none', zIndex: `${outerCount - i}`,
        border: `${borderThickness}px solid transparent`,
        mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude', webkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
        webkitMaskComposite: 'xor',
      });
      fragment.appendChild(mask);
      masks.push(mask);
    }
    container.appendChild(fragment);
    const updateLayout = () => {
      const style = window.getComputedStyle(container);
      const w = parseFloat(style.width), h = parseFloat(style.height), r = parseFloat(style.borderRadius) || 0;
      masks.forEach((mask, i) => {
        const inset = i * outerStep;
        if (w - inset * 2 <= 0 || h - inset * 2 <= 0) { mask.style.display = 'none'; return; }
        const blurVal = Math.pow((outerCount - i) / outerCount, 3.5) * 40;
        mask.style.cssText += `display:block; inset:${inset}px; border-radius:${Math.max(r - inset, 0)}px; backdrop-filter:blur(${blurVal}px); -webkit-backdrop-filter:blur(${blurVal}px);`;
      });
    };
    new ResizeObserver(updateLayout).observe(container);
    updateLayout();
  }

  document.querySelectorAll('.liquid-glass').forEach(applyLiquidGlassEffect);

  const script = document.createElement('script');
  script.src = 'https://search3958.github.io/check.js';
  document.head.appendChild(script);

})();