(function() {
  // ⭐ Google Fonts (Inter 400) を動的に読み込む (変更なし)
  function loadGoogleFont() {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  loadGoogleFont();

  // 検索履歴管理 (変更なし)
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

  // 検索モード管理 (変更なし)
  let searchMode = 'google';
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-button');
  const controlBtns = document.querySelectorAll('.search-control .control-button');

  // ⭐ プレースホルダーのデフォルト値 (変更なし)
  const DEFAULT_PLACEHOLDER = '検索や計算・アプリ';
  const CHATGPT_PLACEHOLDER = 'ChatGPTに質問';

  // ⭐ プレースホルダーを更新する関数 (変更なし)
  function updatePlaceholder() {
    if (!searchInput) return;
    if (searchMode === 'chatgpt') {
      searchInput.placeholder = CHATGPT_PLACEHOLDER;
    } else {
      searchInput.placeholder = DEFAULT_PLACEHOLDER;
    }
  }

  // 初期プレースホルダーを設定
  updatePlaceholder();

  // --- アプリデータ格納用変数の追加 ---
  let appLinks = [];
  let foundApp = null; // 現在入力中のテキストで見つかったアプリを格納

  // 検索実行 (アプリクイックアクセスに対応)
  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;

    addHistory(q);
    
    // ⭐ アプリが特定されている場合はそのURLへジャンプ
    if (foundApp && searchMode === 'google') {
        window.location.href = foundApp.url;
        // 検索履歴にはアプリ名を追加するが、Google検索は行わない
        return; 
    }

    let url;
    if (searchMode === 'google') {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    } else {
      url = 'https://chatgpt.com/?hints=search&openaicom_referred=true&prompt=' + encodeURIComponent(q);
    }
    window.location.href = url;
  }

  if (searchBtn) searchBtn.onclick = doSearch;
  if (searchInput) searchInput.addEventListener('keydown', e => {
    // ⭐ Enterキーで検索/アプリアクセス
    if (e.key === 'Enter') doSearch();
  });

  // 検索モード切替 (プレースホルダーの更新を追加) (変更なし)
  if (controlBtns[2]) { // 最後のボタンがAIモード
    controlBtns[2].onclick = function() {
      if (searchMode === 'google') {
        searchMode = 'chatgpt';
        this.classList.add('active');
      } else {
        searchMode = 'google';
        this.classList.remove('active');
      }
      updatePlaceholder();
    };
  }

  // --- 計算機能追加 (変更なし) ---
  const applistIn = document.querySelector('.applist-in'); // 既存のセレクタ
  const applist = applistIn ? applistIn.closest('.applist') : null; 
  const intelligenceBox = applist ? applist.querySelector('.intelligence-box') : null;
  const answerElement = intelligenceBox ? intelligenceBox.querySelector('.intelligence-answer') : null;

  // sanitizeExpression, isMathExpression, calculateResult (変更なし)
  function sanitizeExpression(expr) {
    let sanitized = expr
      .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    sanitized = sanitized
      .replace(/[×✖️x]/g, '*')
      .replace(/[÷➗]/g, '/')
      .replace(/[ー]/g, '-') 
      .replace(/[＋]/g, '+'); 
    return sanitized.replace(/[^0-9+\-*/().\s]/g, '');
  }
  
  function isMathExpression(str) {
    if (!str) return false;
    const sanitized = sanitizeExpression(str);
    const checkExpr = sanitized.replace(/[\s+\-*/().]*$/, '');
    const containsOperator = /[+\-*/]/.test(checkExpr);
    const isValidChar = /^[\d\s+\-*/().]+$/.test(sanitized);

    return isValidChar && containsOperator;
  }

  function calculateResult(expr) {
    const sanitized = sanitizeExpression(expr);
    const finalExpr = sanitized.replace(/[\s+\-*/().]*$/, '');
    
    if (!/[+\-*/]/.test(finalExpr)) return null;

    try {
      const result = Function('"use strict"; return (' + finalExpr + ')')();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result;
      }
    } catch {}
    return null;
  }
  
  // 前回の結果格納用 (変更なし)
  let currentResult = null;

  // --- アプリ検索機能の追加 (変更なし) ---
  /**
   * 入力テキストに基づいてアプリを検索します。
   * @param {string} text 検索テキスト
   * @returns {{name: string, url: string}|null} 見つかったアプリ、またはnull
   */
  function searchApp(text) {
    if (!text || searchMode !== 'google') return null;
    const q = text.toLowerCase().trim();
    if (q.length < 2) return null; // 2文字未満は検索しない

    // 部分一致で最初のものを見つける
    const found = appLinks.find(app => 
        app.name.toLowerCase().includes(q)
    );

    // 完全一致を優先する
    const exactMatch = appLinks.find(app => 
        app.name.toLowerCase() === q
    );
    
    return exactMatch || found || null;
  }


  // 検索入力時に計算結果またはアプリ名を表示
  function updateCalculationDisplay() {
    if (!searchInput || !applist || !intelligenceBox || !answerElement) return;

    const inputText = searchInput.value;
    const isMath = isMathExpression(inputText);
    
    // ⭐ 修正箇所: intelligenceクラスを付与する対象を .applist に変更
    const targetElementForIntelligenceClass = applist; 

    // まず計算機能のチェック
    if (isMath && searchMode === 'google') {
        foundApp = null; // 計算中はアプリをリセット
        const result = calculateResult(inputText);
        
        if (result !== null && result !== currentResult) {
            answerElement.classList.add('hide');
            setTimeout(() => {
                answerElement.textContent = `${result}`;
                currentResult = result;
                answerElement.classList.remove('hide');
            }, 150);
            targetElementForIntelligenceClass.classList.add('intelligence');
            
        } else if (result !== null && result === currentResult) {
            if (!targetElementForIntelligenceClass.classList.contains('intelligence')) {
                targetElementForIntelligenceClass.classList.add('intelligence');
            }
        } else {
            targetElementForIntelligenceClass.classList.remove('intelligence');
            currentResult = null;
        }
        
    } else if (!isMath && searchMode === 'google') { 
        // 計算式ではない & Googleモードの場合、アプリ検索を行う
        currentResult = null; // 計算結果をリセット
        const app = searchApp(inputText);
        
        if (app) {
            if (!foundApp || app.name !== foundApp.name) {
                foundApp = app;
                // アニメーションを伴ってアプリ名を表示
                answerElement.classList.add('hide');
                setTimeout(() => {
                    answerElement.textContent = `${app.name}`;
                    answerElement.classList.remove('hide');
                }, 150);
                
            }
            targetElementForIntelligenceClass.classList.add('intelligence');
        } else {
            // アプリが見つからなかった場合
            foundApp = null;
            targetElementForIntelligenceClass.classList.remove('intelligence');
        }

    } else {
        // 計算式ではない、またはChatGPTモードの場合、非表示
        targetElementForIntelligenceClass.classList.remove('intelligence');
        currentResult = null;
        foundApp = null;
    }
  }

  // 初期状態では非表示にするため一度呼び出す (変更なし)
  updateCalculationDisplay();

  if (searchInput) {
    searchInput.addEventListener('input', updateCalculationDisplay);
  }

  // --- ダイアログ表示/非表示関数を定義 (変更なし)
  function showDialog(dialogElement) {
    if (!dialogElement) return;
    dialogElement.style.display = 'flex';
    requestAnimationFrame(() => {
      dialogElement.classList.add('show');
    });
  }

  function hideDialog(dialogElement) {
    if (!dialogElement) return;
    dialogElement.classList.remove('show');
    setTimeout(() => {
      if (!dialogElement.classList.contains('show')) {
        dialogElement.style.display = 'none';
      }
    }, 1000);
  }

  // --- 履歴ダイアログ（2つ目ボタン） (変更なし)
  const historyDialog = document.getElementById('history-dialog');
  const historyList = document.getElementById('history-list');
  const settingsDialog = document.getElementById('settings-dialog');

  if (controlBtns[1] && historyDialog && historyList && settingsDialog) { 
    controlBtns[1].onclick = function() {
      if (settingsDialog.classList.contains('show')) {
         hideDialog(settingsDialog);
      }
      const h = getHistory();
      historyList.innerHTML = '';
      if (h.length === 0) {
        historyList.innerHTML = '<li style="color:#888;">履歴なし</li>';
      } else {
        h.forEach(q => {
          const li = document.createElement('li');
          li.style.cursor = 'pointer';
          li.style.padding = '4px 0';
          li.textContent = q;
          li.onclick = () => {
            searchInput.value = q;
            hideDialog(historyDialog);
            doSearch();
          };
          historyList.appendChild(li);
        });
      }
      showDialog(historyDialog);
    };
  }

  // --- 設定ダイアログ（1つ目ボタン） (変更なし)
  if (controlBtns[0] && settingsDialog && historyDialog) { 
    controlBtns[0].onclick = function() {
      if (historyDialog.classList.contains('show')) {
          hideDialog(historyDialog);
      }
      showDialog(settingsDialog);
    };
  }

  // 履歴削除ボタン (変更なし)
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn && settingsDialog) {
    clearBtn.onclick = function() {
      clearHistory();
      alert('検索履歴を削除しました');
      hideDialog(settingsDialog);
    };
  }

  // ダイアログ外クリックで閉じる (変更なし)
  [historyDialog, settingsDialog].forEach(dlg => {
    if (!dlg) return;
    dlg.style.display = 'none';
    dlg.addEventListener('click', e => {
      if (e.target === dlg) {
        hideDialog(dlg);
      }
    });
  });

  // =================================================================
  // 3. リンクとアプリ一覧の読み込み (統合・修正) (変更なし)
  // =================================================================
  const getFileName = (path) => path.split('/').pop();

  // IndexedDB, Wallpaper関連のコードは省略 (変更なし)
  
  // loadZip関数は省略 (変更なし)
  const loadZip = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('ZIP fetch failed');
      const buffer = await response.arrayBuffer();
      // fflate のスコープが不明ですが、ここでは利用可能と仮定します。
      const files = fflate.unzipSync(new Uint8Array(buffer)); 
      
      const imageMap = {};
      const entries = Object.entries(files);
      
      for (let i = 0; i < entries.length; i++) {
        const [path, data] = entries[i];
        const fileName = getFileName(path);
        const blob = new Blob([data.buffer], { type: 'image/webp' });
        imageMap[fileName] = URL.createObjectURL(blob);
        
        if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
      }
      return imageMap;
    } catch (err) {
      console.error('loadZip error', err);
      return {};
    }
  };


  const loadData = async () => {
    try {
      const zipUrl = 'https://search3958.github.io/newtab/lsr/icons-4-5.zip  ';
      const imageMap = await loadZip(zipUrl);

      const jsonUrl = 'https://search3958.github.io/newtab/links.json  ';
      const res = await fetch(jsonUrl);
      if (!res.ok) throw new Error('links.json fetch failed');
      const data = await res.json();
      
      // ⭐ アプリリンクデータを格納するための準備
      const tempAppLinks = [];

      const container = document.querySelector('.applist-in');
      if (!container) {
        console.error('Element with class "applist-in" not found.');
        return;
      }

      (data.categories || []).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.title || '無題';
        categoryDiv.appendChild(title);

        (category.links || []).forEach(link => {
          // ⭐ ここでアプリデータを抽出して格納
          if (link.name && link.url) {
            tempAppLinks.push({
              name: link.name,
              url: link.url
            });
          }
          
          const a = document.createElement('a');
          a.href = link.url || '#';
          a.target = '_self'; 

          const iconDiv = document.createElement('div');
          iconDiv.className = 'appicon-bg';
          if (link.bg) iconDiv.style.background = link.bg;

          const img = document.createElement('img');
          img.className = 'appicon-img';
          const src = imageMap[link.icon];
          img.alt = link.name || '';
          img.src = src || link.icon || '';

          const label = document.createElement('div');
          label.className = 'appicon-label';
          label.textContent = link.name || '';

          iconDiv.appendChild(img);
          iconDiv.appendChild(label);
          a.appendChild(iconDiv);
          categoryDiv.appendChild(a);
        });

        container.appendChild(categoryDiv);
      });
      
      // ⭐ アプリデータをメインの変数にセット
      appLinks = tempAppLinks;

      // ... (visibility check, etc. - 変更なし)
      let cachedRect = null;
      let lastScrollY = -1;

      const checkVisibility = () => {
        const currentScrollY = window.scrollY || window.pageYOffset;
        
        if (lastScrollY === currentScrollY && cachedRect) {
          const isVisible = cachedRect.top <= 0;
          container.classList.toggle('visible', isVisible);
          return;
        }
        
        cachedRect = container.getBoundingClientRect();
        lastScrollY = currentScrollY;
        
        const isVisible = cachedRect.top <= 0;
        container.classList.toggle('visible', isVisible);
      };

      window.addEventListener('scroll', checkVisibility);
      checkVisibility();

      if (window.addLinksAdIfNeeded) {
        window.addLinksAdIfNeeded(container);
      }
    } catch (err) {
      console.error('loadData error', err);
    }
  };
  
  // ページロード時にアプリ一覧を読み込む
  loadData();

})();


// =================================================================
// 4. Liquid Glass エフェクト (既存コード)
// =================================================================
function applyLiquidGlassEffect(container) {
    const outerCount = 10;
    const outerStep = 4;
    const borderThickness = 6;
    
    let masks = container._glassMasks || [];
    
    if (masks.length === 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < outerCount; i++) {
            const mask = document.createElement('div');
            Object.assign(mask.style, {
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: `${outerCount - i}`,
                border: `${borderThickness}px solid transparent`,
                mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                webkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                webkitMaskComposite: 'xor',
            });
            
            fragment.appendChild(mask);
            masks.push(mask);
        }
        container.appendChild(fragment);
        container._glassMasks = masks;
    }

    let rafId = null;

    const updateLayout = () => {
        const style = window.getComputedStyle(container);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        const baseRadius = parseFloat(style.borderRadius) || 0;

        for (let i = 0; i < outerCount; i++) {
            const mask = masks[i];
            const inset = i * outerStep;
            
            if (width - inset * 2 <= 0 || height - inset * 2 <= 0) {
                mask.style.display = 'none';
                continue;
            }
            
            const normalizedPosition = (outerCount - i) / outerCount;
            const blur = Math.pow(normalizedPosition, 3.5) * 40;
            const currentRadius = Math.max(baseRadius - inset, 0);

            mask.style.display = 'block';
            mask.style.inset = `${inset}px`;
            mask.style.borderRadius = `${currentRadius}px`;
            mask.style.backdropFilter = `blur(${blur}px)`;
            mask.style.webkitBackdropFilter = `blur(${blur}px)`;
        }
        rafId = null;
    };

    const resizeObserver = new ResizeObserver(() => {
        if (!rafId) {
            rafId = requestAnimationFrame(updateLayout);
        }
    });

    resizeObserver.observe(container);
    container._resizeObserver = resizeObserver;
    
    updateLayout();
}

// =================================================================
// 5. 実行ロジック (既存コードと壁紙ロジックの統合)
// =================================================================

// Liquid Glass エフェクトの実行
document.querySelectorAll('.liquid-glass').forEach(el => {
    applyLiquidGlassEffect(el);
});


// beta/afterload.js

// =================================================================
// 1. fflateの動的インポート関数
// =================================================================

/**
 * fflateライブラリをCDNから動的にインポートする
 * @returns {Promise<Object>} fflateオブジェクト
 */
const importFflate = () => {
    return new Promise((resolve, reject) => {
        // グローバルにfflateが存在するか確認
        if (typeof fflate !== 'undefined') {
            return resolve(fflate);
        }
        
        const script = document.createElement('script');
        // 🌟 必要に応じてGoogle Fontsの読み込みもここに追加できます
        // const fontLink = document.createElement('link');
        // fontLink.rel = 'stylesheet';
        // fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap'; 
        // document.head.appendChild(fontLink); 
        
        script.src = 'https://unpkg.com/fflate@0.8.2/umd/index.js';
        script.onload = () => {
            // 読み込み後、fflateがグローバルに利用可能になる
            resolve(fflate);
        };
        script.onerror = (err) => {
            console.error('fflate load failed', err);
            reject(new Error('fflate load failed'));
        };
        document.head.appendChild(script);
    });
};

// =================================================================
// 2. ZIPおよびJSONデータの読み込みとアプリ一覧の構築
// =================================================================

const getFileName = (path) => path.split('/').pop();

/**
 * ZIPファイルをフェッチ、unzipSyncで展開し、Blob/ObjectURLのマップを返す
 * @param {string} url - ZIPファイルのURL
 * @returns {Promise<Object>} ファイル名からObject URLへのマップ
 */
const loadZip = async (url) => {
    // fflateがグローバルに存在することが前提となる (loadDataでimportFflateを先に実行する)
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('ZIP fetch failed');
        const buffer = await response.arrayBuffer();
        
        // fflate.unzipSync の使用
        const files = fflate.unzipSync(new Uint8Array(buffer));
        
        const imageMap = {};
        const entries = Object.entries(files);
        
        for (let i = 0; i < entries.length; i++) {
            const [path, data] = entries[i];
            const fileName = getFileName(path);
            // 注意: 'image/webp' はZIP内のファイル形式に合わせる必要があります
            const blob = new Blob([data.buffer], { type: 'image/webp' }); 
            imageMap[fileName] = URL.createObjectURL(blob);
            
            // UIの応答性を確保するためのチャンク処理 (10件ごと)
            if (i % 10 === 0) await new Promise(r => setTimeout(r, 0)); 
        }
        return imageMap;
    } catch (err) {
        console.error('loadZip error', err);
        return {};
    }
};

/**
 * リンクデータとアイコンを読み込み、アプリ一覧を構築するメイン処理
 */
const loadData = async () => {
    try {
        // 1. fflateの読み込み
        await importFflate();

        // 2. ZIPファイルの読み込みとアイコンマップの生成
        const zipUrl = 'https://search3958.github.io/newtab/lsr/icons-4-5.zip';
        const imageMap = await loadZip(zipUrl);

        // 3. JSONデータの読み込み
        const jsonUrl = 'https://search3958.github.io/newtab/links.json';
        const res = await fetch(jsonUrl);
        if (!res.ok) throw new Error('links.json fetch failed');
        const data = await res.json();

        const container = document.querySelector('.applist-in');
        if (!container) {
            console.error('Element with class "applist-in" not found.');
            return;
        }

        // 4. アプリ一覧のDOM構築
        (data.categories || []).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.title || '無題';
            categoryDiv.appendChild(title);

            const linksContainer = document.createElement('div'); // リンクをまとめるコンテナを追加しても良い
            linksContainer.className = 'category-links-wrapper'; 

            (category.links || []).forEach(link => {
                const a = document.createElement('a');
                a.href = link.url || '#';
                a.target = '_self'; // 明示的に_selfを設定

                const iconDiv = document.createElement('div');
                iconDiv.className = 'appicon-bg';
                if (link.bg) iconDiv.style.background = link.bg;

                const img = document.createElement('img');
                img.className = 'appicon-img';
                const src = imageMap[link.icon];
                img.alt = link.name || '';
                // ZIPからロードしたObject URLを使用、またはフォールバック
                img.src = src || link.icon || ''; 

                const label = document.createElement('div');
                label.className = 'appicon-label';
                label.textContent = link.name || '';

                iconDiv.appendChild(img);
                iconDiv.appendChild(label);
                a.appendChild(iconDiv);
                linksContainer.appendChild(a);
            });
            
            categoryDiv.appendChild(linksContainer);
            container.appendChild(categoryDiv);
        });

        // 5. スクロール監視ロジックの追加
        let cachedRect = null;
        let lastScrollY = -1;

        const checkVisibility = () => {
            const currentScrollY = window.scrollY || window.pageYOffset;
            
            if (lastScrollY === currentScrollY && cachedRect) {
                const isVisible = cachedRect.top <= 0;
                container.classList.toggle('visible', isVisible);
                return;
            }
            
            cachedRect = container.getBoundingClientRect();
            lastScrollY = currentScrollY;
            
            const isVisible = cachedRect.top <= 0;
            container.classList.toggle('visible', isVisible);
        };

        window.addEventListener('scroll', checkVisibility);
        checkVisibility();

        if (window.addLinksAdIfNeeded) {
            window.addLinksAdIfNeeded(container);
        }
    } catch (err) {
        console.error('loadData error', err);
    }
};

// afterload.jsの起動処理
// DOMContentLoadedイベントを待つ必要はないが、安全のためDOMが構築されていることを確認
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}