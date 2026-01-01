// beta/afterload.js

(function() {
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
      // ボックスを消す時は即座にhideも付けておく
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

  // --- 指示通りの更新フロー：答えが変わる時のみ実行 ---
  function updateCalculationDisplay() {
    if (!searchInput || !intelligenceIcon || !answerElement) return;

    const inputText = searchInput.value.trim();
    const result = isMathExpression(inputText) ? calculateResult(inputText) : null;
    const app = (!result) ? searchApp(inputText) : null;
    const newValue = result !== null ? String(result) : (app ? app.name : null);

    if (searchMode === 'google' && newValue !== null) {
      // 答えが変わる場合
      if (newValue !== currentResult) {
        // 1. hideを与える
        answerElement.classList.add('hide');
        triggerIconRotation();

        // 2. 0.15秒待つ
        setTimeout(() => {
          // 3. 答えを変える
          answerElement.textContent = newValue;
          currentResult = newValue;
          foundApp = app;

          // 4. hideを消す
          answerElement.classList.remove('hide');
        }, 150);
      }
      toggleIntelligenceActive(true);
    } else {
      // 答えがない場合は非表示へ
      toggleIntelligenceActive(false);
      currentResult = null;
      foundApp = null;
    }
  }

  if (searchInput) searchInput.addEventListener('input', updateCalculationDisplay);

  // --- ダイアログ制御 ---
  function showDialog(dlg) {
    if (!dlg) return;
    dlg.style.display = 'flex';
    requestAnimationFrame(() => dlg.classList.add('show'));
  }

  function hideDialog(dlg) {
    if (!dlg) return;
    dlg.classList.remove('show');
    setTimeout(() => { if (!dlg.classList.contains('show')) dlg.style.display = 'none'; }, 500);
  }

  if (controlBtns[0]) controlBtns[0].onclick = () => showDialog(document.getElementById('settings-dialog'));
  if (controlBtns[1]) {
    controlBtns[1].onclick = () => {
      const historyList = document.getElementById('history-list');
      const h = getHistory();
      historyList.innerHTML = h.length ? '' : '<li style="color:#888;">履歴なし</li>';
      h.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q;
        li.style.cssText = 'cursor:pointer; padding:8px 0;';
        li.onclick = () => {
          searchInput.value = q;
          hideDialog(document.getElementById('history-dialog'));
          doSearch();
        };
        historyList.appendChild(li);
      });
      showDialog(document.getElementById('history-dialog'));
    };
  }
  if (controlBtns[2]) {
    controlBtns[2].onclick = function() {
      searchMode = (searchMode === 'google') ? 'chatgpt' : 'google';
      this.classList.toggle('active', searchMode === 'chatgpt');
      updatePlaceholder();
      updateCalculationDisplay();
    };
  }

  document.querySelectorAll('#history-dialog, #settings-dialog').forEach(dlg => {
    dlg.addEventListener('click', e => { if (e.target === dlg) hideDialog(dlg); });
  });

  const clearHistoryBtn = document.getElementById('clear-history');
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = () => {
      clearHistory();
      alert('検索履歴を削除しました');
      hideDialog(document.getElementById('settings-dialog'));
    };
  }

  // =================================================================
  // 3. アプリ一覧構築 & 広告挿入
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
    const container = document.querySelector('.applist-in');
    if (!container) return;
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

      const adDiv = document.createElement('div');
      adDiv.style.cssText = 'width:100%; margin-top:20px;';
      adDiv.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="ca-pub-6151036058675874" data-ad-slot="9559715307"></ins>`;
      container.appendChild(adDiv);
      const s = document.createElement('script');
      s.async = true; s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874";
      document.head.appendChild(s);
      (window.adsbygoogle = window.adsbygoogle || []).push({});

    } catch (e) { console.error(e); }
  };

  if (document.readyState === 'loading') { window.addEventListener('DOMContentLoaded', loadData); } else { loadData(); }

  const checkScript = document.createElement('script');
  checkScript.src = 'https://search3958.github.io/check.js';
  document.head.appendChild(checkScript);
})();