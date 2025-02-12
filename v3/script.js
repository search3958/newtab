document.getElementById('js-ver').textContent = 'JavaScriptバージョン:1';

const form = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        const historyDiv = document.getElementById('history');

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const query = searchInput.value;
            if (!query) return;

            const engine = document.querySelector('input[name="engine"]:checked').value;
            const url = `${engine}?q=${encodeURIComponent(query)}`;
            
            saveSearchHistory(query, url);
            window.location.href = url;
        });
        
        function saveSearchHistory(query, url) {
            let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            history.unshift({ query, url });
            if (history.length > 5) history = history.slice(0, 5);
            localStorage.setItem('searchHistory', JSON.stringify(history));
            displayHistory();
        }

        function displayHistory() {
            const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            historyDiv.innerHTML = '<button class="clear-button" id="clearHistory"><span class="material-symbols-rounded deletehistory">delete_history</span></button>';
            history.forEach(item => {
                const link = document.createElement('a');
                link.href = item.url;
                link.textContent = item.query;
                link.target = '_blank';
                historyDiv.appendChild(link);
            });
            document.getElementById('clearHistory').addEventListener('click', function() {
                localStorage.removeItem('searchHistory');
                displayHistory();
            });
        }

        displayHistory();

// スクロールイベントを監視
    window.addEventListener('scroll', function() {
      var fullScreenEl = document.getElementById('bg');
      var fullShr = document.getElementById('shortcuts');
      if (window.scrollY > 0) {
        fullScreenEl.classList.add('active');
        fullShr.classList.add('active');
      } else {
        fullScreenEl.classList.remove('active');
        fullShr.classList.remove('active');
      }
    });

function updateClock() {
            var now = new Date();
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0を12に変換
            minutes = minutes < 10 ? '0' + minutes : minutes;
            
            var timeString = hours + ':' + minutes + ' ' + ampm;
            document.getElementById('clock').innerText = timeString;
        }

        setInterval(updateClock, 1000);

document.addEventListener("DOMContentLoaded", function() {
  const buttons = document.querySelectorAll(".btn");
  const menus = document.querySelectorAll(".menu");
  const bar = document.querySelector(".bar");

  buttons.forEach((button, index) => {
    button.addEventListener("click", function(event) {
      // メニューを表示する
      const menu = menus[index];
      
      // 他のメニューを非表示にする
      menus.forEach((m, i) => {
        if (m !== menu) {
          m.classList.remove("active");
          buttons[i].classList.remove("active");
        }
      });

      // メニューとボタンの状態を切り替え
      menu.classList.toggle("active");
      button.classList.toggle("active");

      // .bar の透明度変更
      if (menu.classList.contains("active")) {
        bar.classList.add("transparent");
      } else {
        bar.classList.remove("transparent");
      }

      document.addEventListener("click", function closeMenu(e) {
        if (!bar.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove("active");
          button.classList.remove("active");
          bar.classList.remove("transparent");
          document.removeEventListener("click", closeMenu);
        }
      });
    });
  });
});

class LinkBox extends HTMLElement {
    constructor() {
        super();
        
        const href = this.getAttribute('href') || '#';
        const bgColor = this.getAttribute('bg-color') || 'white';
        const imgBase = this.getAttribute('img') || '';
        const content = this.textContent;

        // HTML構造を作成（テンプレートリテラルで囲むことに注意）
        this.innerHTML = `
            <a href="${href}">
                <div class="box">
                    <div class="container" style="background-color: ${bgColor};">
                        <img src="https://search3958.github.io/newtab/lsr/light/${imgBase}1.png" id="img1">
                        <img src="https://search3958.github.io/newtab/lsr/light/${imgBase}2.png" id="img2">
                        <img src="https://search3958.github.io/newtab/lsr/light/${imgBase}3.png" id="img3">
                    </div>
                    ${content}
                </div>
            </a>
        `;

        // マウスイベントの処理（3D変形）
        const container = this.querySelector('.container');
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // マウス位置に応じた回転量（滑らかな回転のための計算）
            const x = ((event.clientX - centerX) / (rect.width / 2)) * 15;
            const y = ((event.clientY - centerY) / (rect.height / 2)) * 15;
        
            // CSSカスタムプロパティにセット
            container.style.setProperty('--x', `${x}deg`);
            container.style.setProperty('--y', `${y}deg`);
            
            // 各レイヤーごとに少しずつ移動（奥行き効果）
            container.style.setProperty('--x1', `${x * 0.5}px`);
            container.style.setProperty('--y1', `${y * 0.5}px`);
            container.style.setProperty('--x2', `${x * 0.65}px`);
            container.style.setProperty('--y2', `${y * 0.65}px`);
            container.style.setProperty('--x3', `${x * 0.8}px`);
            container.style.setProperty('--y3', `${y * 0.8}px`);
        });
        container.addEventListener('mouseleave', () => {
            container.style.setProperty('--x', '0deg');
            container.style.setProperty('--y', '0deg');
            container.style.setProperty('--x1', '0px');
            container.style.setProperty('--y1', '0px');
            container.style.setProperty('--x2', '0px');
            container.style.setProperty('--y2', '0px');
            container.style.setProperty('--x3', '0px');
            container.style.setProperty('--y3', '0px');
        });
    }
}

// カスタムエレメントを登録
customElements.define('link-box', LinkBox);

/**
 * 指定したURLの画像を取得し、ローカルストレージにキャッシュします。
 * キャッシュ済みの場合はキャッシュデータ（Data URL）を返します。
 */
async function getCachedImage(url) {
    const cacheKey = 'imgCache_' + url;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        return cached;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response not ok');
        }
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        // キャッシュ保存（容量制限に注意）
        try {
            localStorage.setItem(cacheKey, dataUrl);
        } catch (e) {
            console.error("Failed to cache image", e);
        }
        return dataUrl;
    } catch (e) {
        console.error("Error fetching image:", url, e);
        throw e;
    }
}
const colorModeCheckbox = document.getElementById('colorMode');
const hueRotationSlider = document.getElementById('hueRotation');
const hueValue = document.getElementById('hueValue');


async function updateAppearance() {
    const containers = document.querySelectorAll('link-box .container');
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let mode;

    // colorModeCheckboxの状態に応じてモードを設定
    if (colorModeCheckbox.checked) {
        mode = 'color';
        containers.forEach(container => {
            container.style.background = 'linear-gradient(#222, #111)';
        });
    } else {
        if (isDarkMode) {
            mode = 'dark';
            containers.forEach(container => {
                container.style.background = 'linear-gradient(#222, #111)';
            });
        } else {
            mode = 'light';
            containers.forEach(container => {
                // 各link-boxのbg-color属性を背景色に利用
                const parentLinkBox = container.closest('link-box');
                const bgColor = parentLinkBox ? parentLinkBox.getAttribute('bg-color') : 'white';
                container.style.background = bgColor;
            });
        }
    }

    // 画像ソースをキャッシュ付きで更新
    await updateImageSources(mode);

    // hueRotationの値を取得し、更新
    const hueRotation = colorModeCheckbox.checked ? hueRotationSlider.value : 0;
    updateHueRotation(hueRotation);
    hueValue.textContent = hueRotation;
}

async function updateImageSources(mode) {
    const linkBoxes = document.querySelectorAll('link-box');
    for (const linkBox of linkBoxes) {
        const imgBase = linkBox.getAttribute('img');
        const images = linkBox.querySelectorAll('img');

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const newSrc = `https://search3958.github.io/newtab/lsr/${mode}/${imgBase}${i + 1}.webp`;
            try {
                const dataUrl = await getCachedImage(newSrc);
                img.src = dataUrl;
                img.classList.remove('hidden');
            } catch (e) {
                // darkモードの場合はfallbackとしてlightモードの画像を試す
                if (mode === 'dark') {
                    const lightSrc = `https://search3958.github.io/newtab/lsr/light/${imgBase}${i + 1}.webp`;
                    try {
                        const dataUrl = await getCachedImage(lightSrc);
                        img.src = dataUrl;
                        img.classList.remove('hidden');
                    } catch (e2) {
                        img.classList.add('hidden');
                    }
                } else {
                    img.classList.add('hidden');
                }
            }
        }
    }
    // 画像ソース更新後にhue-rotateを再適用
    const hueRotation = colorModeCheckbox.checked ? hueRotationSlider.value : 0;
    updateHueRotation(hueRotation);
}

/**
 * hue-rotateフィルターを画像に適用
 */
function updateHueRotation(hueVal) {
    const images = document.querySelectorAll('link-box .container img');
    images.forEach(img => {
        img.style.filter = `hue-rotate(${hueVal}deg)`;
    });
}

/**
 * ローカルストレージから設定を読み込み、適用する
 */
function loadSettings() {
    const colorMode = localStorage.getItem('colorMode');
    const hueRotation = localStorage.getItem('hueRotation');

    // チェックボックスの状態を復元
    if (colorMode === 'true') {
        colorModeCheckbox.checked = true;
    } else {
        colorModeCheckbox.checked = false;
    }

    // スライダーの値を復元
    if (hueRotation) {
        hueRotationSlider.value = hueRotation;
    }
}

/**
 * 設定をローカルストレージに保存する
 */
function saveSettings() {
    localStorage.setItem('colorMode', colorModeCheckbox.checked);
    localStorage.setItem('hueRotation', hueRotationSlider.value);
}

// ページが読み込まれたときに設定をロード
loadSettings();

// 設定が変更された時に保存
colorModeCheckbox.addEventListener('change', () => {
    updateAppearance();
    saveSettings();
});

hueRotationSlider.addEventListener('input', () => {
    updateAppearance();
    saveSettings();
});

// ダークモードの変更をリスン
window.matchMedia('(prefers-color-scheme: dark)').addListener(updateAppearance);





updateAppearance();
// デフォルトの画像URL
    const defaultImageUrl = "https://search3958.github.io/project/htmlos/1/light2.png";
    
    // ページ読み込み時にローカルストレージから画像URLを取得
    window.onload = function() {
      const storedImageUrl = localStorage.getItem('backgroundImageUrl');
      if (storedImageUrl) {
        document.body.style.backgroundImage = `url(${storedImageUrl})`;
        document.getElementById('imageUrl').value = storedImageUrl;
      } else {
        document.body.style.backgroundImage = `url(${defaultImageUrl})`;
        document.getElementById('imageUrl').value = defaultImageUrl;
      }
    }

    // 背景画像を変更する関数
    function updateBackground() {
      const imageUrl = document.getElementById('imageUrl').value;
      document.body.style.backgroundImage = `url(${imageUrl})`;
      
      // ローカルストレージに新しい画像URLを保存
      localStorage.setItem('backgroundImageUrl', imageUrl);
    }

    function resetBackground() {
      // デフォルト画像に戻す
      document.body.style.backgroundImage = `url(${defaultImageUrl})`;
      
      // テキストボックスをデフォルトURLにリセット
      document.getElementById('imageUrl').value = defaultImageUrl;

      // ローカルストレージをリセット
      localStorage.removeItem('backgroundImageUrl');
    }

// バッテリー情報を取得
    navigator.getBattery().then(function(battery) {
      if (battery.level <= 0.2) {
        const batteryStatusElement = document.getElementById('batteryStatus');
        batteryStatusElement.innerHTML = '<span class="material-symbols-rounded batteryicon">battery_1_bar</span>残量低下 ' + Math.round(battery.level * 100) + '%';
        batteryStatusElement.style.display = 'block';
      }
    });
