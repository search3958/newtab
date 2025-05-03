const calcBtn = document.getElementById('calc');
  const clockBtn = document.getElementById('clock');
  const toolFrame = document.getElementById('toolframe');
  const toolIframe = document.getElementById('tool');
  const closeToolBtn = toolFrame.querySelector('.closetool');

  // クリック時の共通処理
  function openTool(url) {
    toolIframe.src = url;
    toolFrame.classList.add('active');
  }

  // ボタンが押された時の挙動を設定
  calcBtn.addEventListener('click', () => {
    openTool('https://search3958.github.io/newtab/calc.html');
  });

  clockBtn.addEventListener('click', () => {
    openTool('https://search3958.github.io/newtab/stopwatch.html');
  });

  // 閉じるボタンの処理
  closeToolBtn.addEventListener('click', () => {
    toolFrame.classList.remove('active');
    toolIframe.src = ''; // 不要なら削除してもOK
  });

  const style = iframeDoc.createElement('style');
  style.textContent = `
    body {
      background: transparent !important;
    }
  `;
  iframeDoc.head.appendChild(style);
  