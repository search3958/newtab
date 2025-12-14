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
    if (searchMode === 'chatgpt') {
      searchInput.placeholder = CHATGPT_PLACEHOLDER;
    } else {
      searchInput.placeholder = DEFAULT_PLACEHOLDER;
    }
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
    if (e.key === 'Enter') doSearch();
  });

  if (controlBtns[2]) { 
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

  // --- 計算機能・インテリジェンス表示 ---
  const applistIn = document.querySelector('.applist-in'); 
  const applist = applistIn ? applistIn.closest('.applist') : null; 
  const intelligenceBox = applist ? applist.querySelector('.intelligence-box') : null;
  const answerElement = intelligenceBox ? intelligenceBox.querySelector('.intelligence-answer') : null;

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
  
  let currentResult = null;

  // --- アプリ検索機能 ---
  function searchApp(text) {
    if (!text || searchMode !== 'google') return null;
    const q = text.toLowerCase().trim();
    if (q.length < 2) return null; 

    const found = appLinks.find(app => 
        app.name.toLowerCase().includes(q)
    );

    const exactMatch = appLinks.find(app => 
        app.name.toLowerCase() === q
    );
    
    return exactMatch || found || null;
  }
  
  const triggerIconRotation = (element) => {
    if (!element) return;
    
    if (element.classList.contains('animate-icon')) return;

    element.classList.add('animate-icon');
    setTimeout(() => {
      element.classList.remove('animate-icon');
    }, 1000); 
  };


  function updateCalculationDisplay() {
    if (!searchInput || !applist || !intelligenceBox || !answerElement) return;

    const inputText = searchInput.value;
    const isMath = isMathExpression(inputText);
    
    const targetElementForIntelligenceClass = applist; 

    if (isMath && searchMode === 'google') {
        foundApp = null; 
        const result = calculateResult(inputText);
        
        if (result !== null && result !== currentResult) {
            answerElement.classList.add('hide');
            
            triggerIconRotation(targetElementForIntelligenceClass);
            
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
        currentResult = null; 
        const app = searchApp(inputText);
        
        if (app) {
            if (!foundApp || app.name !== foundApp.name) {
                foundApp = app;
                
                triggerIconRotation(targetElementForIntelligenceClass);

                answerElement.classList.add('hide');
                setTimeout(() => {
                    answerElement.textContent = `${app.name}`;
                    answerElement.classList.remove('hide');
                }, 150);
                
            }
            targetElementForIntelligenceClass.classList.add('intelligence');
        } else {
            foundApp = null;
            targetElementForIntelligenceClass.classList.remove('intelligence');
        }

    } else {
        targetElementForIntelligenceClass.classList.remove('intelligence');
        currentResult = null;
        foundApp = null;
    }
  }

  updateCalculationDisplay();

  if (searchInput) {
    searchInput.addEventListener('input', updateCalculationDisplay);
  }

  // --- ダイアログ制御 ---
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

  if (controlBtns[0] && settingsDialog && historyDialog) {  
    controlBtns[0].onclick = function() {
      if (historyDialog.classList.contains('show')) {
          hideDialog(historyDialog);
      }
      showDialog(settingsDialog);
    };
  }

  const clearBtn = document.getElementById('clear-history');
  if (clearBtn && settingsDialog) {
    clearBtn.onclick = function() {
      clearHistory();
      alert('検索履歴を削除しました');
      hideDialog(settingsDialog);
    };
  }

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
  // 3. fflateの動的インポートとアプリ一覧の構築
  // =================================================================

  const importFflate = () => {
    return new Promise((resolve, reject) => {
        if (typeof fflate !== 'undefined') {
            return resolve(fflate);
        }
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/fflate@0.8.2/umd/index.js';
        script.onload = () => {
            resolve(fflate);
        };
        script.onerror = (err) => {
            console.error('fflate load failed', err);
            reject(new Error('fflate load failed'));
        };
        document.head.appendChild(script);
    });
  };

  const getFileName = (path) => path.split('/').pop();

  const loadZip = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('ZIP fetch failed');
        const buffer = await response.arrayBuffer();
        
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
  
  // --- 広告挿入ヘルパー ---
  const insertAd = (container) => {
      const adContainer = document.createElement('div');
      adContainer.className = 'ad-container';
      adContainer.innerHTML = `
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874"
              crossorigin="anonymous"></script>
          <ins class="adsbygoogle"
              style="display:inline-block;width:244px;height:110px"
              data-ad-client="ca-pub-6151036058675874"
              data-ad-slot="2788469305"></ins>
          <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
      `;
      container.appendChild(adContainer);
  };
  // --------------------------


  const loadData = async () => {
    try {
        await importFflate();

        const zipUrl = 'lsr/icons-6.zip';
        const imageMap = await loadZip(zipUrl);

        const jsonUrl = 'links-v6.json';
        const res = await fetch(jsonUrl);
        if (!res.ok) throw new Error('links.json fetch failed');
        const data = await res.json();

        const container = document.querySelector('.applist-in');
        if (!container) {
            console.error('Element with class "applist-in" not found.');
            return;
        }

        const tempAppLinks = [];
        let categoryCount = 0; // カテゴリーのカウント

        (data.categories || []).forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.title || '無題';
            categoryDiv.appendChild(title);
            
            (category.links || []).forEach(link => {
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
            categoryCount++; 

            // 2つのカテゴリーごとに広告を挿入 (最後を除く)
            if (categoryCount % 2 === 0 && index < data.categories.length - 1) {
                insertAd(container);
            }
        });

        appLinks = tempAppLinks;

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

  if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', loadData);
  } else {
      loadData();
  }
})();


// =================================================================
// 4. Liquid Glass エフェクト
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
// 5. 実行ロジック
// =================================================================

document.querySelectorAll('.liquid-glass').forEach(el => {
    applyLiquidGlassEffect(el);
});