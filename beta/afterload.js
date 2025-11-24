(function insertAdsOnExpansionAreaChange() {
  const adHtml = `\
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874" crossorigin="anonymous"></script>\n<ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-fb+5w+4e-db+86" data-ad-client="ca-pub-6151036058675874" data-ad-slot="3356431274"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});<\/script>\n`;

  const linksAdHtml = `\
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874" crossorigin="anonymous"></script>\n<ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="ca-pub-6151036058675874" data-ad-slot="9559715307"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});<\/script>\n`;

  function insertAdElements(htmlString, parentElement) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    
    Array.from(temp.childNodes).forEach(node => {
      if (node.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        if (node.src) script.src = node.src;
        if (node.async) script.async = true;
        if (node.crossOrigin) script.crossOrigin = node.crossOrigin;
        if (node.textContent) script.textContent = node.textContent;
        parentElement.appendChild(script);
      } else if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
        parentElement.appendChild(node.cloneNode(true));
      }
    });
  }

  function createAdElement(htmlString) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    const container = document.createElement('div');
    
    Array.from(temp.childNodes).forEach(node => {
      if (node.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        if (node.src) script.src = node.src;
        if (node.async) script.async = true;
        if (node.crossOrigin) script.crossOrigin = node.crossOrigin;
        if (node.textContent) script.textContent = node.textContent;
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });
    
    return container;
  }

  function addAdIfNeeded(area) {
    if (!area) return;
    
    // すでに広告が存在するかチェック
    const existingAds = area.querySelectorAll('.adsbygoogle[data-ad-slot="3356431274"]');
    
    // 検索結果を取得
    const results = area.querySelectorAll('.gsc-webResult, .gs-webResult');
    
    // 5番目の要素の後に広告を挿入
    if (results.length >= 5 && existingAds.length === 0) {
      const fifthResult = results[4];
      const adElement = createAdElement(adHtml);
      fifthResult.parentNode.insertBefore(adElement, fifthResult.nextSibling);
    }
    
    // 最後に広告を追加（既存の動作を維持）
    if (existingAds.length < 2) {
      const adElement = createAdElement(adHtml);
      area.appendChild(adElement);
    }
  }

  function addLinksAdIfNeeded(container) {
    if (!container) return;
    
    // 既存の広告を全て削除
    const existingAds = container.querySelectorAll('.adsbygoogle[data-ad-slot="9559715307"]');
    existingAds.forEach(ad => {
      // 広告要素とその前後のscriptタグも削除
      let node = ad;
      while (node) {
        let next = node.nextSibling;
        if (node.tagName === 'SCRIPT' || node.classList?.contains('adsbygoogle')) {
          node.remove();
        }
        if (next === ad || !next) break;
        node = next;
      }
      // 前のscriptタグも削除
      let prev = ad.previousSibling;
      while (prev && prev.tagName === 'SCRIPT') {
        let toRemove = prev;
        prev = prev.previousSibling;
        toRemove.remove();
      }
      ad.remove();
    });
    
    // 最後に新しい広告を追加
    insertAdElements(linksAdHtml, container);
  }

  function observeArea() {
    const area = document.querySelector('.gsc-expansionArea');
    if (!area) {
      setTimeout(observeArea, 200);
      return;
    }
    
    setTimeout(() => addAdIfNeeded(area), 200);
    
    const observer = new MutationObserver(() => {
      setTimeout(() => addAdIfNeeded(area), 200);
    });
    observer.observe(area, { childList: true, subtree: true });
  }

  function observeLinksContainer() {
    const linksContainer = document.querySelector('#links-container');
    if (!linksContainer) {
      setTimeout(observeLinksContainer, 200);
      return;
    }
    // setTimeout(() => addLinksAdIfNeeded(linksContainer), 200); // ← 広告追加処理を削除
    // const observer = new MutationObserver(() => {
    //   setTimeout(() => addLinksAdIfNeeded(linksContainer), 200);
    // });
    // observer.observe(linksContainer, { childList: true, subtree: true });
  }
  
  observeArea();
  observeLinksContainer();
})();


function applyLiquidGlassEffect(container) {
    const outerCount = 10;
    const outerStep = 4;
    const borderThickness = 6;
    
    // 既存のマスク要素があれば再利用のために取得、なければ配列を初期化
    let masks = container._glassMasks || [];
    
    // 初回実行時のみ要素を作成（DOM生成コストを初回のみにする）
    if (masks.length === 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < outerCount; i++) {
            const mask = document.createElement('div');
            // 静的なスタイル（変化しないもの）はここで設定
            Object.assign(mask.style, {
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: `${outerCount - i}`,
                // CSS Mask Compositeを使ってSVG無しで「中抜きの枠」を作る（超高速）
                border: `${borderThickness}px solid transparent`,
                mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                webkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                webkitMaskComposite: 'xor', // Chrome/Safari用
            });
            
            fragment.appendChild(mask);
            masks.push(mask);
        }
        container.appendChild(fragment);
        container._glassMasks = masks; // 参照を保存
    }

    // アニメーションフレーム管理用フラグ
    let rafId = null;

    const updateLayout = () => {
        // コンテナの現在のサイズとスタイルを取得
        // getComputedStyleはリフローを誘発するため、ループの外で一回だけ呼ぶ
        const style = window.getComputedStyle(container);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        const baseRadius = parseFloat(style.borderRadius) || 0;

        // ループ処理（DOMの生成・削除は行わず、styleの書き換えのみ行う）
        for (let i = 0; i < outerCount; i++) {
            const mask = masks[i];
            const inset = i * outerStep;
            
            // サイズが小さくなりすぎる場合は隠す
            if (width - inset * 2 <= 0 || height - inset * 2 <= 0) {
                mask.style.display = 'none';
                continue;
            }
            
            const normalizedPosition = (outerCount - i) / outerCount;
            const blur = Math.pow(normalizedPosition, 3.5) * 40;
            const currentRadius = Math.max(baseRadius - inset, 0);

            // transformやopacityなどのGPUプロパティ以外の変更をバッチ処理的に行う
            // 文字列連結のコストを減らすため、必要なプロパティだけ更新
            mask.style.display = 'block';
            mask.style.inset = `${inset}px`; // position:relativeなしでも、親のパディングボックス基準または配置文脈に従う
            mask.style.borderRadius = `${currentRadius}px`;
            mask.style.backdropFilter = `blur(${blur}px)`;
            mask.style.webkitBackdropFilter = `blur(${blur}px)`;
        }
        rafId = null;
    };

    // ResizeObserverの設定
    const resizeObserver = new ResizeObserver(() => {
        // RequestAnimationFrameを使って描画更新をモニタのリフレッシュレートに同期させる
        // これにより無駄な計算（1フレームに複数回の計算）を間引きます
        if (!rafId) {
            rafId = requestAnimationFrame(updateLayout);
        }
    });

    resizeObserver.observe(container);
    container._resizeObserver = resizeObserver;
    
    // 初回描画
    updateLayout();
}

// 実行
document.querySelectorAll('.liquid-glass').forEach(el => {
    applyLiquidGlassEffect(el);
});

