(function() {
  // 検索履歴管理
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

  // 検索モード管理
  let searchMode = 'google'; // 'google' or 'chatgpt'
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-button');
  const controlBtns = document.querySelectorAll('.search-control .control-button');

  // 検索実行
  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    
    // 履歴を保存
    addHistory(q); 

    let url;
    if (searchMode === 'google') {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    } else {
      url = 'https://chatgpt.com/?hints=search&openaicom_referred=true&prompt=' + encodeURIComponent(q);
    }
    
    // ⭐ 変更点: window.location.href を使用して現在のタブで遷移
    window.location.href = url;
  }
  
  if (searchBtn) searchBtn.onclick = doSearch;
  if (searchInput) searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  // 検索モード切替（3つ目ボタン）
  if (controlBtns[2]) {
    controlBtns[2].onclick = function() {
      if (searchMode === 'google') {
        searchMode = 'chatgpt';
        this.classList.add('active');
      } else {
        searchMode = 'google';
        this.classList.remove('active');
      }
    };
  }

  // 履歴ダイアログ（2つ目ボタン）
  const historyDialog = document.getElementById('history-dialog');
  const historyList = document.getElementById('history-list');
  if (controlBtns[1]) {
    controlBtns[1].onclick = function() {
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
            historyDialog.style.display = 'none';
            // 履歴から選択した場合も doSearch() が呼ばれ、現在のタブで遷移します。
            doSearch(); 
          };
          historyList.appendChild(li);
        });
      }
      historyDialog.style.display = 'flex';
    };
  }

  // 設定ダイアログ（1つ目ボタン）
  const settingsDialog = document.getElementById('settings-dialog');
  if (controlBtns[0]) {
    controlBtns[0].onclick = function() {
      settingsDialog.style.display = 'flex';
    };
  }
  // 履歴削除ボタン
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.onclick = function() {
      clearHistory();
      alert('検索履歴を削除しました');
      settingsDialog.style.display = 'none';
    };
  }

  // ダイアログ外クリックで閉じる
  [historyDialog, settingsDialog].forEach(dlg => {
    if (!dlg) return;
    dlg.addEventListener('click', e => {
      if (e.target === dlg) dlg.style.display = 'none';
    });
  });
})();