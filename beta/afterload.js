(function() {
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
  if (controlBtns[2]) {
    controlBtns[2].onclick = function() {
      if (searchMode === 'google') {
        searchMode = 'chatgpt';
        this.classList.add('active');
      } else {
        searchMode = 'google';
        this.classList.remove('active');
      }
      // ⭐ モードが切り替わったらプレースホルダーも更新
      updatePlaceholder();
    };
  }
  
  // --- ⭐ ダイアログ表示/非表示関数を定義 ---
  
  // ダイアログを表示する関数 (変更なし)
  function showDialog(dialogElement) {
    if (!dialogElement) return;
    // 完全に非表示になっている要素をdisplay:flexにし、配置可能にする
    dialogElement.style.display = 'flex';
    requestAnimationFrame(() => {
      dialogElement.classList.add('show');
    });
  }

  // ダイアログを非表示にする関数 (アニメーション完了後display:noneにする) (変更なし)
  function hideDialog(dialogElement) {
    if (!dialogElement) return;
    // .showクラスを削除し、アニメーションを開始する
    dialogElement.classList.remove('show');
    
    // アニメーション完了を待ってから display: none に戻す (1000ms = 1秒)
    setTimeout(() => {
      if (!dialogElement.classList.contains('show')) {
        dialogElement.style.display = 'none';
      }
    }, 1000); 
  }
  
  // --- 履歴ダイアログ（2つ目ボタン） (変更なし) ---
  const historyDialog = document.getElementById('history-dialog');
  const historyList = document.getElementById('history-list');
  const settingsDialog = document.getElementById('settings-dialog'); // 共通化のためここで定義

  if (controlBtns[1] && historyDialog && historyList && settingsDialog) {
    controlBtns[1].onclick = function() {
      // 他のダイアログが開いていたら閉じる
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
            // 履歴から選択したのでダイアログを閉じる
            hideDialog(historyDialog); 
            doSearch(); 
          };
          historyList.appendChild(li);
        });
      }
      // ダイアログを表示
      showDialog(historyDialog); 
    };
  }

  // --- 設定ダイアログ（1つ目ボタン） (変更なし) ---
  if (controlBtns[0] && settingsDialog && historyDialog) {
    controlBtns[0].onclick = function() {
      // 他のダイアログが開いていたら閉じる
      if (historyDialog.classList.contains('show')) {
          hideDialog(historyDialog);
      }
      // ダイアログを表示
      showDialog(settingsDialog);
    };
  }
  
  // 履歴削除ボタン (変更なし)
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn && settingsDialog) {
    clearBtn.onclick = function() {
      clearHistory();
      alert('検索履歴を削除しました');
      // 設定ダイアログを閉じる
      hideDialog(settingsDialog); 
    };
  }

  // ダイアログ外クリックで閉じる (変更なし)
  [historyDialog, settingsDialog].forEach(dlg => {
    if (!dlg) return;
    // 初期状態でdisplay:noneを設定
    dlg.style.display = 'none'; 
    
    dlg.addEventListener('click', e => {
      if (e.target === dlg) {
        // ダイアログを閉じる
        hideDialog(dlg); 
      }
    });
  });
})();