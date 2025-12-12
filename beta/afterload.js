(function() {
  // ⭐ Google Fonts (Inter 400) を動的に読み込む
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

  // ⭐ プレースホルダーのデフォルト値
  const DEFAULT_PLACEHOLDER = '検索や計算・アプリ';
  const CHATGPT_PLACEHOLDER = 'AIに質問';

  // ⭐ プレースホルダーを更新する関数
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

  // 検索実行 (変更なし)
  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;

    addHistory(q);
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

  // 検索モード切替 (プレースホルダーの更新を追加)
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

  // --- 計算機能追加 ---
  const applistIn = document.querySelector('.applist');

  // ⭐ 修正箇所: applistの親要素である .applist を取得し、そこから .intelligence-box を検索します。
  const applist = applistIn ? applistIn.closest('.applist') : null; // .applistの最も近い祖先要素の.applistを取得
  const intelligenceBox = applist ? applist.querySelector('.intelligence-box') : null;
  const answerElement = intelligenceBox ? intelligenceBox.querySelector('.intelligence-answer') : null;

  function sanitizeExpression(expr) {
    // 全角数字を半角に
    let sanitized = expr
      .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    // 全角/異体字の演算子を半角に
    sanitized = sanitized
      .replace(/[×✖️x]/g, '*')
      .replace(/[÷➗]/g, '/')
      .replace(/[ー]/g, '-') // 全角ハイフンも-に
      .replace(/[＋]/g, '+'); // 全角+も+に
    // 最後に計算に関係ない文字（=など）を削除して、有効な計算式にする
    // ここでは計算に関係する文字と空白のみ残し、末尾の記号等は isMathExpressionでチェック
    return sanitized.replace(/[^0-9+\-*/().\s]/g, '');
  }
  
  // 計算記号やドット、括弧が末尾にあっても許容するよう修正
  function isMathExpression(str) {
    if (!str) return false;
    const sanitized = sanitizeExpression(str);
    // 数字と演算子と括弧、空白以外が含まれていたら計算式とは見なさない
    // 末尾に+, -, *, /, ., (, ) のいずれかがあってもOK
    const checkExpr = sanitized.replace(/[\s+\-*/().]*$/, ''); // 末尾の記号や空白を一時的に削除してチェック
    
    // 計算記号が含まれているかチェック
    const containsOperator = /[+\-*/]/.test(checkExpr);
    
    // 数字と演算子と括弧、空白以外が含まれていないかチェック
    const isValidChar = /^[\d\s+\-*/().]+$/.test(sanitized);

    return isValidChar && containsOperator;
  }

  function calculateResult(expr) {
    const sanitized = sanitizeExpression(expr);
    // 計算のために末尾の演算子や括弧、ドット、空白を削除
    const finalExpr = sanitized.replace(/[\s+\-*/().]*$/, '');
    
    // 計算記号がない場合は計算しない (isMathExpressionでチェック済みだが念のため)
    if (!/[+\-*/]/.test(finalExpr)) return null;

    try {
      // Function constructor is safer than eval
      const result = Function('"use strict"; return (' + finalExpr + ')')();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result;
      }
    } catch {}
    return null;
  }
  
  // 前回の結果格納用
  let currentResult = null;

  function updateCalculationDisplay() {
    // ⭐ 修正箇所: applistInではなく、applist（またはintelligenceBox）がnullでないか確認
    if (!searchInput || !applist || !intelligenceBox || !answerElement) return;

    const inputText = searchInput.value;
    const isMath = isMathExpression(inputText);

    // この修正は元のロジック (.applist に intelligence クラス) を維持
    const targetElementForIntelligenceClass = applistIn; 

    if (isMath) {
      const result = calculateResult(inputText);
      if (result !== null && result !== currentResult) {
        
        // 1. .hide を追加して要素を隠す (アニメーション開始)
        answerElement.classList.add('hide');

        // 2. 0.2秒待ってから内容を更新
        setTimeout(() => {
          // 計算結果を表示
          answerElement.textContent = `${result}`;
          currentResult = result; // 結果を更新

          // 3. .hide を外して再表示 (アニメーション終了)
          answerElement.classList.remove('hide');
        }, 150);

        // .applist に .intelligence クラスを追加して表示を切り替える
        targetElementForIntelligenceClass.classList.add('intelligence');
        
      } else if (result !== null && result === currentResult) {
          // 結果が変わらない場合は何もしない (アニメーションも不要)
          if (!targetElementForIntelligenceClass.classList.contains('intelligence')) {
             targetElementForIntelligenceClass.classList.add('intelligence');
          }
      }
      else {
        // 計算できない場合は非表示
        targetElementForIntelligenceClass.classList.remove('intelligence');
        currentResult = null;
      }
    } else {
      // 計算式でない場合も非表示
      targetElementForIntelligenceClass.classList.remove('intelligence');
      currentResult = null;
    }
  }

  // 初期状態では非表示にするため一度呼び出す
  updateCalculationDisplay();

  if (searchInput) {
    searchInput.addEventListener('input', updateCalculationDisplay);
  }

  // --- ダイアログ表示/非表示関数を定義 ---
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

  // --- 履歴ダイアログ（2つ目ボタン）
  const historyDialog = document.getElementById('history-dialog');
  const historyList = document.getElementById('history-list');
  const settingsDialog = document.getElementById('settings-dialog');

  if (controlBtns[1] && historyDialog && historyList && settingsDialog) { // 中央のボタンが履歴
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

  // --- 設定ダイアログ（1つ目ボタン）
  if (controlBtns[0] && settingsDialog && historyDialog) { // 左端のボタンが設定
    controlBtns[0].onclick = function() {
      if (historyDialog.classList.contains('show')) {
          hideDialog(historyDialog);
      }
      showDialog(settingsDialog);
    };
  }

  // 履歴削除ボタン
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn && settingsDialog) {
    clearBtn.onclick = function() {
      clearHistory();
      alert('検索履歴を削除しました');
      hideDialog(settingsDialog);
    };
  }

  // ダイアログ外クリックで閉じる
  [historyDialog, settingsDialog].forEach(dlg => {
    if (!dlg) return;
    dlg.style.display = 'none';
    dlg.addEventListener('click', e => {
      if (e.target === dlg) {
        hideDialog(dlg);
      }
    });
  });
})();