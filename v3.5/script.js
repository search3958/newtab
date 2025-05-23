document.getElementById('js-ver').textContent = 'JavaScriptバージョン:5-ryeogsa';
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const historyDiv = document.getElementById('history');
  const searchButton = document.querySelector('.searchbtn');

  form.addEventListener('submit', handleSearch);
  searchButton.addEventListener('click', handleSearch);
  
  function handleSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    let engine = document.querySelector('input[name="engine"]:checked').value;
    if (form.classList.contains('ai')) {
      engine = 'https://search3958.github.io/aisearch/';
    }

    const url = `${engine}?q=${encodeURIComponent(query)}`;
    saveSearchHistory(query, url, () => {
      window.location.href = url;
    });
  }

  function saveSearchHistory(query, url, callback) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    history.unshift({ query, url });
    if (history.length > 5) history = history.slice(0, 5);
    
    localStorage.setItem('searchHistory', JSON.stringify(history));
    displayHistory();
    callback(); // 保存後にコールバックでページ遷移
  }

  function displayHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyDiv.innerHTML = '';

    if (history.length === 0) {
      historyDiv.style.display = 'none';
      return;
    }

    historyDiv.style.display = 'block';
    const clearButton = document.createElement('button');
    clearButton.classList.add('clear-button');
    clearButton.id = 'clearHistory';
    clearButton.innerHTML = '<span class="material-symbols-rounded deletehistory">delete_history</span>';
    historyDiv.appendChild(clearButton);

    history.forEach(item => {
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.query;
      link.target = '_blank';
      historyDiv.appendChild(link);
    });

    clearButton.addEventListener('click', function () {
      localStorage.removeItem('searchHistory');
      displayHistory();
    });
  }

  displayHistory();

  window.addEventListener('scroll', function () {
    const fullScreenEl = document.getElementById('bg');
    const fullShr = document.getElementById('shortcuts');
    
    if (window.scrollY > 0) {
      fullScreenEl.classList.add('active');
      fullShr.classList.add('active');
    } else {
      fullScreenEl.classList.remove('active');
      fullShr.classList.remove('active');
    }
  });

  // AI検索エンジンへの変更を監視
  const observer = new MutationObserver(() => {
    let selectedEngine = document.querySelector('input[name="engine"]:checked').value;
    let searchInputValue = searchInput.value.trim();

    if (form.classList.contains('ai')) {
      searchButton.removeEventListener('click', handleSearch);
      searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        const aiUrl = `https://search3958.github.io/aisearch/?q=${encodeURIComponent(searchInputValue)}`;
        saveSearchHistory(searchInputValue, aiUrl, () => {
          window.location.href = aiUrl;
        });
      });
    } else {
      searchButton.removeEventListener('click', handleSearch);
      searchButton.addEventListener('click', handleSearch);
    }
  });

  observer.observe(form, { attributes: true, attributeFilter: ['class'] });
});


function updateClock() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var timeString = hours + ':' + minutes + ' ' + ampm;
  document.getElementById('clock').innerText = timeString
};
setInterval(updateClock, 1000);

class LinkBox extends HTMLElement {
  constructor() {
    super();
    const href = this.getAttribute('href') || '#';
    const bgColor = this.getAttribute('bg-color') || 'white';
    const imgBase = this.getAttribute('img') || '';
    const content = this.textContent;
    this.innerHTML = `<a href="${href}"><div class="box"><div class="container" style="background-color:${bgColor}"><img src="" id="img1"><img src="" id="img2"><img src="" id="img3"></div>${content}</div></a>`;
    const container = this.querySelector('.container');
    container.addEventListener('mousemove', (event) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = ((event.clientX - centerX) / (rect.width / 2)) * 15;
      const y = ((event.clientY - centerY) / (rect.height / 2)) * 15;
      container.style.setProperty('--x', `${x}deg`);
      container.style.setProperty('--y', `${y}deg`);
      container.style.setProperty('--x1', `${x * 0.5}px`);
      container.style.setProperty('--y1', `${y * 0.5}px`);
      container.style.setProperty('--x2', `${x * 0.65}px`);
      container.style.setProperty('--y2', `${y * 0.65}px`);
      container.style.setProperty('--x3', `${x * 0.8}px`);
      container.style.setProperty('--y3', `${y * 0.8}px`)
    });
    container.addEventListener('mouseleave', () => {
      container.style.setProperty('--x', '0deg');
      container.style.setProperty('--y', '0deg');
      container.style.setProperty('--x1', '0px');
      container.style.setProperty('--y1', '0px');
      container.style.setProperty('--x2', '0px');
      container.style.setProperty('--y2', '0px');
      container.style.setProperty('--x3', '0px');
      container.style.setProperty('--y3', '0px')
    })
  }
};
customElements.define('link-box', LinkBox);
class ImageLoader {
  constructor() {
    this.imageCache = new Map();
    this.zipCache = new Map()
  };
  async loadZipFile(mode) {
    if (this.zipCache.has(mode)) {
      return this.zipCache.get(mode)
    };
    const zipUrl = `https://search3958.github.io/newtab/lsr/${mode}.zip`;
    try {
      const response = await fetch(zipUrl);
      if (!response.ok) throw new Error('ZIP download failed');
      const arrayBuffer = await response.arrayBuffer();
      const zip = await new JSZip().loadAsync(arrayBuffer);
      const files = {};
      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const blob = await file.async('blob');
          const dataUrl = await this.blobToDataUrl(blob);
          files[filename] = dataUrl
        }
      };
      this.zipCache.set(mode, files);
      return files
    } catch (e) {
      console.error('Error loading ZIP:', e);
      throw e
    }
  };
  async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob)
    })
  };
  async getImage(mode, imgBase, index) {
    const cacheKey = `${mode}_${imgBase}${index}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)
    };
    try {
      const zipContents = await this.loadZipFile(mode);
      const expectedFileName = `${imgBase}${index}.webp`;
      const key = Object.keys(zipContents).find(fileName => fileName.endsWith(expectedFileName));
      if (key) {
        const imageData = zipContents[key];
        this.imageCache.set(cacheKey, imageData);
        return imageData
      };
      throw new Error('Image not found in ZIP')
    } catch (e) {
      console.error('Error getting image:', e);
      throw e
    }
  }
};
const imageLoader = new ImageLoader();
const colorModeCheckbox = document.getElementById('colorMode');
const hueRotationSlider = document.getElementById('hueRotation');
const hueValue = document.getElementById('hueValue');
async function updateAppearance() {
  const containers = document.querySelectorAll('link-box .container');
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let mode;
  if (colorModeCheckbox.checked) {
    mode = 'color';
    containers.forEach(container => {
      container.style.background = 'linear-gradient(#222, #111)'
    })
  } else {
    if (isDarkMode) {
      mode = 'dark';
      containers.forEach(container => {
        container.style.background = 'linear-gradient(#222a, #111a)'
      })
    } else {
      mode = 'light';
      containers.forEach(container => {
        const parentLinkBox = container.closest('link-box');
        const bgColor = parentLinkBox ? parentLinkBox.getAttribute('bg-color') : 'var(--white)';
        container.style.background = bgColor
      })
    }
  };
  await updateImageSources(mode);
  const hueRotation = colorModeCheckbox.checked ? hueRotationSlider.value : 0;
  updateHueRotation(hueRotation);
  hueValue.textContent = hueRotation
};
async function updateImageSources(mode) {
  const linkBoxes = document.querySelectorAll('link-box');
  for (const linkBox of linkBoxes) {
    const imgBase = linkBox.getAttribute('img');
    const images = linkBox.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const dataUrl = await imageLoader.getImage(mode, imgBase, i + 1);
        img.src = dataUrl;
        img.classList.remove('hidden')
      } catch (e) {
        if (mode === 'dark') {
          try {
            const dataUrl = await imageLoader.getImage('light', imgBase, i + 1);
            img.src = dataUrl;
            img.classList.remove('hidden')
          } catch (e2) {
            img.classList.add('hidden')
          }
        } else {
          img.classList.add('hidden')
        }
      }
    }
  }
};

function updateHueRotation(hueVal) {
  const images = document.querySelectorAll('link-box .container img');
  images.forEach(img => {
    img.style.filter = `hue-rotate(${hueVal}deg)`
  })
};

function loadSettings() {
  const colorMode = localStorage.getItem('colorMode');
  const hueRotation = localStorage.getItem('hueRotation');
  if (colorMode === 'true') {
    colorModeCheckbox.checked = !0
  } else {
    colorModeCheckbox.checked = !1
  };
  if (hueRotation) {
    hueRotationSlider.value = hueRotation
  }
};

function saveSettings() {
  localStorage.setItem('colorMode', colorModeCheckbox.checked);
  localStorage.setItem('hueRotation', hueRotationSlider.value)
};
loadSettings();
colorModeCheckbox.addEventListener('change', () => {
  updateAppearance();
  saveSettings()
});
hueRotationSlider.addEventListener('input', () => {
  updateAppearance();
  saveSettings()
});
window.matchMedia('(prefers-color-scheme: dark)').addListener(updateAppearance);
updateAppearance();
const defaultImageUrl = "https://search3958.github.io/newtab/bgimg/bg1.webp";
window.onload = function() {
  const storedImageUrl = localStorage.getItem('backgroundImageUrl');
  if (storedImageUrl) {
    document.body.style.backgroundImage = `url(${storedImageUrl})`;
    document.getElementById('imageUrl').value = storedImageUrl
  } else {
    document.body.style.backgroundImage = `url(${defaultImageUrl})`;
    document.getElementById('imageUrl').value = defaultImageUrl
  }
};

function updateBackground() {
  const imageUrl = document.getElementById('imageUrl').value;
  document.body.style.backgroundImage = `url(${imageUrl})`;
  localStorage.setItem('backgroundImageUrl', imageUrl)
};

function resetBackground() {
  document.body.style.backgroundImage = `url(${defaultImageUrl})`;
  document.getElementById('imageUrl').value = defaultImageUrl;
  localStorage.removeItem('backgroundImageUrl')
};
navigator.getBattery().then(function(battery) {
  if (battery.level <= 0.2) {
    const batteryStatusElement = document.getElementById('batteryStatus');
    batteryStatusElement.innerHTML = '<span class="material-symbols-rounded batteryicon">battery_1_bar</span>残量低下 ' + Math.round(battery.level * 100) + '%';
    batteryStatusElement.style.display = 'block'
  }
})

document.querySelector('.aibtn').addEventListener('click', function() {
            const image = document.querySelector('.aibg');
            const bar = document.querySelector('.aibar');
  const edge = document.querySelector('.edge');
  const history = document.querySelector('.history');
  const engine = document.querySelector('.engine');
  const searchtext = document.querySelector('.searchtext');
  const box = document.querySelector('.search');
            const isActive = image.classList.contains('active');
  const iconElement = document.querySelector(".material-symbols-rounded.searchicon");
            
            if (isActive) {
                this.classList.remove('active');
                image.classList.remove('active');
              edge.classList.remove('active');
                bar.classList.remove('active');
              history.classList.remove('ai');
              engine.classList.remove('ai');
              searchtext.classList.remove('ai');
              box.classList.remove('ai');
              document.querySelector('.searchtext').setAttribute('placeholder', 'Search');
              iconElement.textContent = "search";

            } else {
                this.classList.add('active');
                image.classList.add('active');
              edge.classList.add('active');
                bar.classList.add('active');
              history.classList.add('ai');
              engine.classList.add('ai');
              searchtext.classList.add('ai');
              box.classList.add('ai');
              document.querySelector('.searchtext').setAttribute('placeholder', 'AIは不正確な情報を表示することがあります');
              iconElement.textContent = "arrow_forward";
            }
        });



let isVisible = false; // 要素が表示されているかどうかの状態

// ボタンがクリックされたとき
document.getElementById('showBtn').addEventListener('click', function() {
    const container = document.querySelector('.settingcontainer');
    const items = document.querySelectorAll('.item');
    let blurBackground = document.querySelector('.blur-background');

    // blurBackgroundが存在しない場合は新しく作成
    if (!blurBackground) {
        blurBackground = createBlurBackground();
        document.body.appendChild(blurBackground); // bodyに追加
    }

    // 背景がクリックされた場合の処理を追加
    blurBackground.addEventListener('click', closeSettings);

    if (isVisible) {
        // 非表示アニメーション
        container.style.opacity = 0;
        container.style.pointerEvents = 'none';
        blurBackground.style.opacity = 0;

        // すべてのアイテムを一緒に上に移動させる
        items.forEach((item) => {
            setTimeout(() => {
                item.style.transform = 'translateY(-100px)';
                item.style.opacity = 0;
            }, 1); // 少し遅延を入れて全てのアイテムを一緒に非表示
        });

        // 非表示が完了したらブラー背景を削除
        setTimeout(() => {
            if (blurBackground) {
                blurBackground.remove();
            }
        }, 300); // アニメーション後に削除
    } else {
        // 表示アニメーション
        container.style.opacity = 1;
        container.style.pointerEvents = 'auto';
        blurBackground.style.opacity = 1;

        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.visibility = 'visible';
                item.style.transform = 'translateY(0)';
                item.style.opacity = 1;
            }, index * 40); // 各アイテムの表示に遅延を追加
        });
    }

    // 状態を反転
    isVisible = !isVisible;
});

// 設定を閉じる関数
function closeSettings() {
    const container = document.querySelector('.settingcontainer');
    const items = document.querySelectorAll('.item');
    const blurBackground = document.querySelector('.blur-background');

    if (isVisible) {
        // 非表示アニメーション
        container.style.opacity = 0;
        container.style.pointerEvents = 'none';
        blurBackground.style.opacity = 0;

        // すべてのアイテムを一緒に上に移動させる
        items.forEach((item) => {
            setTimeout(() => {
                item.style.transform = 'translateY(-100px)';
                item.style.opacity = 0;
            }, 1); // 少し遅延を入れて全てのアイテムを一緒に非表示
        });

        // 非表示が完了したらブラー背景を削除
        setTimeout(() => {
            if (blurBackground) {
                blurBackground.remove();
            }
        }, 300); // アニメーション後に削除

        // 状態を反転
        isVisible = false;
    }
}

// blur-backgroundの作成関数（必要なら定義）
function createBlurBackground() {
    const blurBackground = document.createElement('div');
    blurBackground.classList.add('blur-background');
    blurBackground.style.position = 'fixed';
    blurBackground.style.top = 0;
    blurBackground.style.left = 0;
    blurBackground.style.transition = 'opacity 0.3s ease'; // アニメーション用のトランジション
    blurBackground.style.opacity = 0;

    return blurBackground;
}


function changeText1() {
            document.getElementById("imageUrl").value = "https://search3958.github.io/newtab/bgimg/bg1.webp";
        }
        
        function changeText2() {
            document.getElementById("imageUrl").value = "https://search3958.github.io/newtab/bgimg/bg3.webp";
        }

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // フォーム送信のデフォルト動作をキャンセル
    
    let selectedEngine = document.querySelector('input[name="engine"]:checked').value;
    let searchInput = document.getElementById('searchInput').value;
    
    // .aiが#searchFormに追加されているかどうかを確認
    if (document.getElementById('searchForm').classList.contains('ai')) {
      // .aiが追加されていれば、AI検索エンジンに変更
      window.location.href = `https://search3958.github.io/aisearch/?q=${encodeURIComponent(searchInput)}`;
    } else {
      // それ以外の場合は、選択された検索エンジンを使う
      window.location.href = `${selectedEngine}?q=${encodeURIComponent(searchInput)}`;
    }
  });

  // .aiクラスが追加されているかどうかを監視し、変更時に対応
  const observer = new MutationObserver(() => {
    let selectedEngine = document.querySelector('input[name="engine"]:checked').value;
    let searchInput = document.getElementById('searchInput').value;

    if (document.getElementById('searchForm').classList.contains('ai')) {
      // .aiが追加されていれば、AI検索エンジンに変更
      document.querySelector('.searchbtn').addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = `https://search3958.github.io/aisearch/?q=${encodeURIComponent(searchInput)}`;
      });
    } else {
      // それ以外の場合は、選択された検索エンジンに戻す
      document.querySelector('.searchbtn').addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = `${selectedEngine}?q=${encodeURIComponent(searchInput)}`;
      });
    }
  });

  observer.observe(document.getElementById('searchForm'), {
    attributes: true
  });


function updateBatteryStatus() {
            navigator.getBattery().then(function(battery) {
                var batteryLevel = battery.level * 100; // バッテリーの状態を%に変換
                var batteryFill = document.getElementById('battery-fill');
                var batteryText = document.getElementById('battery-text');

                // バッテリーの高さを変更
                batteryFill.style.height = batteryLevel + '%';

                // バッテリー状態を表示
                batteryText.textContent = Math.round(batteryLevel) + '%';
            });
        }

        // ページ読み込み時にバッテリー状態を更新
        window.addEventListener('load', updateBatteryStatus);

// 背景グラデーションの定義
    const backgrounds = {
      '不明': 'linear-gradient(180deg, rgba(24,90,242,0.8) 0%, rgba(24,169,242,0.8) 100%)',
      '晴': 'linear-gradient(180deg, rgba(94,201,255,0.8) 0%, rgba(54,171,255,0.8) 100%)',
      '曇り': 'linear-gradient(180deg, rgba(174,219,241,0.8) 0%, rgba(94,133,162,0.8) 100%)',
      '夜': 'linear-gradient(180deg, rgba(62,56,79,0.8) 0%, rgba(28,25,34,0.8) 100%)'
    };

    // DOM の各要素を取得
    const weatherBox = document.getElementById('weatherBox');
    const tempElem = document.querySelector('.temperature');
    const weatherElem = document.querySelector('.weather');
    const locationElem = document.querySelector('.location');

    // 現在時刻から夜かどうかを判定（夜は18時以降または6時前）
    function isNight() {
      const hour = new Date().getHours();
      return (hour < 6 || hour >= 18);
    }

    // weathercode を日本語の天気に変換（簡易例）
    function mapWeatherCodeToDescription(code) {
      if (code === 0) return '晴';
      if (code >= 1 && code <= 3) return '曇り';
      return '不明';
    }

    // ipinfo.io から位置情報を取得
    // 必要に応じて token を付与してください（例: ?token=YOUR_TOKEN）
    fetch('https://ipinfo.io/json?token=1725a58ec90e86')
      .then(response => response.json())
      .then(data => {
        // data.loc は "lat,lon" 形式の文字列なので分割して取得
        const locArray = data.loc.split(',');
        const lat = locArray[0];
        const lon = locArray[1];

        // 位置情報の表示（都市、地域、国）
        const city = data.city || '';
        const region = data.region || '';
        const country = data.country || '';
        locationElem.textContent = `${city} ${region} ${country}`;

        // Open‑Meteo の API を使用して現在の天気情報を取得
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FTokyo`;
        fetch(weatherUrl)
          .then(response => response.json())
          .then(weatherData => {
            const current = weatherData.current_weather;
            const temperature = current.temperature !== undefined ? current.temperature : '--';
            let weatherDesc = mapWeatherCodeToDescription(current.weathercode);
            tempElem.textContent = temperature + '°C';
            weatherElem.textContent = weatherDesc;
            let bgKey = isNight() ? '夜' : weatherDesc;
            if (!backgrounds[bgKey]) bgKey = '不明';
            weatherBox.style.background = backgrounds[bgKey];
          })
          .catch(error => {
            console.error('天気情報取得エラー:', error);
            weatherElem.textContent = '天気情報取得失敗';
            weatherBox.style.background = backgrounds['不明'];
          });
      })
      .catch(error => {
        console.error('位置情報取得エラー:', error);
        locationElem.textContent = '位置情報取得失敗';
      });

function updateDisplay() {
      const now = new Date();

      // 日付・曜日の表示
      const days = ["日", "月", "火", "水", "木", "金", "土"];
      document.getElementById('day-of-week').textContent = days[now.getDay()] + "曜日";
      document.getElementById('month-day').textContent = (now.getMonth()+1) + "月" + now.getDate() + "日";

      // 針の回転角度を計算
      const hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();
      const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
      const minuteAngle = minute * 6;
      const secondAngle = second * 6;

      document.getElementById('hour-hand').style.transform = `rotate(${hourAngle}deg)`;
      document.getElementById('minute-hand').style.transform = `rotate(${minuteAngle}deg)`;
      document.getElementById('second-hand').style.transform = `rotate(${secondAngle}deg)`;
    }

    setInterval(updateDisplay, 1000);
    updateDisplay();

// ストップウォッチの動作を制御
    let isRunning = false;
    let time = 0;
    let timerInterval;

    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timeDisplay = document.getElementById('timeDisplay');

    // 再生/一時停止ボタンの動作
    playPauseBtn.addEventListener('click', () => {
      if (isRunning) {
        clearInterval(timerInterval);
        playPauseBtn.innerHTML = '<span class="material-symbols-rounded stopwatchicon">play_arrow</span>'; // 再生アイコンに戻す
      } else {
        timerInterval = setInterval(() => {
          time++;
          updateTimeDisplay();
        }, 1000);
        playPauseBtn.innerHTML = '<span class="material-symbols-rounded stopwatchicon">pause</span>'; // 一時停止アイコンに変更
      }
      isRunning = !isRunning;
    });

    // リセットボタンの動作
    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      time = 0;
      updateTimeDisplay();
      playPauseBtn.innerHTML = '<span class="material-symbols-rounded stopwatchicon">play_arrow</span>'; // 再生アイコンに戻す
      isRunning = false;
    });

    // 時間表示の更新
    function updateTimeDisplay() {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }