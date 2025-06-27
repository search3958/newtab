const lensFx_canvas = document.getElementById("lensFx_canvas");
const lensFx_ctx = lensFx_canvas.getContext("2d");

const topRightCanvas = document.getElementById("topRightCanvas");
const topRightCtx = topRightCanvas.getContext("2d");

const lensFx_layerCount = 15;
const lensFx_minZoom = 3;
const lensFx_maxZoom = 1.1;
const lensFx_shrinkStep = 3;

function lensFx_safeInverseEasing(t) {
  const ε = 0.05;
  const v = 1 / (t + ε) - 1 / ε;
  const maxV = 1 / (1 + ε) - 1 / ε;
  return v / maxV;
}

function lensFx_radiusEasing(t) {
  return 0.3 + 0.7 * (1 - t * t);
}

function lensFx_getBackgroundImageUrl() {
  const bg = getComputedStyle(document.body).backgroundImage;
  const m = bg.match(/url\(["']?(.*?)["']?\)/);
  return m ? m[1] : null;
}

function lensFx_getCoverParams(imgW, imgH, vw, vh) {
  const rImg = imgW / imgH, rVw = vw / vh;
  let drawW, drawH, offX = 0, offY = 0;
  if (rImg > rVw) {
    drawH = vh;
    drawW = imgW * (vh / imgH);
    offX = (drawW - vw) / 2;
  } else {
    drawW = vw;
    drawH = imgH * (vw / imgW);
    offY = (drawH - vh) / 2;
  }
  return { drawW, drawH, offX, offY };
}

function lensFx_updateCanvasSize() {
  const rect = lensFx_canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  lensFx_canvas.width  = rect.width  * dpr;
  lensFx_canvas.height = rect.height * dpr;
  lensFx_ctx.setTransform(1, 0, 0, 1, 0, 0);
  lensFx_ctx.scale(dpr, dpr);
}

function lensFx_getRadius() {
  return parseFloat(getComputedStyle(lensFx_canvas).borderRadius);
}

let lensFx_img = null;
let currentBgUrl = null;

function lensFx_draw(img) {
  if (!img.complete) return;

  lensFx_updateCanvasSize();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { drawW, drawH, offX, offY } = lensFx_getCoverParams(img.width, img.height, vw, vh);

  const rect = lensFx_canvas.getBoundingClientRect();
  const wLens = rect.width;
  const hLens = rect.height;
  const radius = lensFx_getRadius();
  const cx = vw / 2;
  const cy = vh / 2;

  const scaleX = img.width / drawW;
  const scaleY = img.height / drawH;

  lensFx_ctx.clearRect(0, 0, lensFx_canvas.width, lensFx_canvas.height);

  for (let i = 0; i < lensFx_layerCount; i++) {
    const t = i / (lensFx_layerCount - 1);
    const zoom = lensFx_minZoom + lensFx_safeInverseEasing(t) * (lensFx_maxZoom - lensFx_minZoom);
    const w = wLens - i * lensFx_shrinkStep;
    const h = hLens - i * lensFx_shrinkStep;
    const dx = (wLens - w) / 2;
    const dy = (hLens - h) / 2;
    const imgCenterX = (cx + offX) * scaleX;
    const imgCenterY = (cy + offY) * scaleY;
    const sw = (w / zoom) * scaleX;
    const sh = (h / zoom) * scaleY;
    const sx = imgCenterX - sw / 2;
    const sy = imgCenterY - sh / 2;
    const easedRadius = radius * lensFx_radiusEasing(t);

    lensFx_ctx.save();
    lensFx_ctx.beginPath();
    lensFx_ctx.moveTo(dx + easedRadius, dy);
    lensFx_ctx.lineTo(dx + w - easedRadius, dy);
    lensFx_ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + easedRadius);
    lensFx_ctx.lineTo(dx + w, dy + h - easedRadius);
    lensFx_ctx.quadraticCurveTo(dx + w, dy + h, dx + w - easedRadius, dy + h);
    lensFx_ctx.lineTo(dx + easedRadius, dy + h);
    lensFx_ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - easedRadius);
    lensFx_ctx.lineTo(dx, dy + easedRadius);
    lensFx_ctx.quadraticCurveTo(dx, dy, dx + easedRadius, dy);
    lensFx_ctx.closePath();
    lensFx_ctx.clip();

    lensFx_ctx.drawImage(img, sx, sy, sw, sh, dx, dy, w, h);
    lensFx_ctx.restore();

    lensFx_ctx.lineWidth = 1;
    lensFx_ctx.strokeStyle = `rgba(255,255,255,${0.005 + 0.02 * t})`;
    lensFx_ctx.beginPath();
    lensFx_ctx.moveTo(dx + easedRadius, dy);
    lensFx_ctx.lineTo(dx + w - easedRadius, dy);
    lensFx_ctx.quadraticCurveTo(dx + w, dy, dx + w, dy + easedRadius);
    lensFx_ctx.lineTo(dx + w, dy + h - easedRadius);
    lensFx_ctx.quadraticCurveTo(dx + w, dy + h, dx + w - easedRadius, dy + h);
    lensFx_ctx.lineTo(dx + easedRadius, dy + h);
    lensFx_ctx.quadraticCurveTo(dx, dy + h, dx, dy + h - easedRadius);
    lensFx_ctx.lineTo(dx, dy + easedRadius);
    lensFx_ctx.quadraticCurveTo(dx, dy, dx + easedRadius, dy);
    lensFx_ctx.closePath();
    lensFx_ctx.stroke();
  }
}

function updateTopRightCanvasSize() {
  const rect = topRightCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  topRightCanvas.width = rect.width * dpr;
  topRightCanvas.height = rect.height * dpr;
  topRightCtx.setTransform(1, 0, 0, 1, 0, 0);
  topRightCtx.scale(dpr, dpr);
}

function drawLensFxOnTopRightCanvas(img) {
  if (!img.complete) return;

  updateTopRightCanvasSize();
  const rect = topRightCanvas.getBoundingClientRect();
  const canvasW = rect.width;
  const canvasH = rect.height;
  const dpr = window.devicePixelRatio || 1;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { drawW, drawH, offX, offY } = lensFx_getCoverParams(img.width, img.height, vw, vh);

  const scaleX = img.width / drawW;
  const scaleY = img.height / drawH;

  const zoomCenterX = vw - canvasW / 2;
  const zoomCenterY = canvasH / 2;

  topRightCtx.clearRect(0, 0, topRightCanvas.width, topRightCanvas.height);

  const radius = 40; // 可変な角丸

  for (let i = 0; i < lensFx_layerCount; i++) {
    const t = i / (lensFx_layerCount - 1);
    const zoom = lensFx_minZoom + lensFx_safeInverseEasing(t) * (lensFx_maxZoom - lensFx_minZoom);
    const w = canvasW - i * lensFx_shrinkStep;
    const h = canvasH - i * lensFx_shrinkStep;
    const dx = (canvasW - w) / 2;
    const dy = (canvasH - h) / 2;

    const imgCenterX = (zoomCenterX + offX) * scaleX;
    const imgCenterY = (zoomCenterY + offY) * scaleY;
    const sw = (w / zoom) * scaleX;
    const sh = (h / zoom) * scaleY;
    const sx = imgCenterX - sw / 2;
    const sy = imgCenterY - sh / 2;
    const easedRadius = radius * lensFx_radiusEasing(t);

    topRightCtx.save();
    topRightCtx.beginPath();
    topRightCtx.moveTo(dx + easedRadius, dy);
    topRightCtx.lineTo(dx + w - easedRadius, dy);
    topRightCtx.quadraticCurveTo(dx + w, dy, dx + w, dy + easedRadius);
    topRightCtx.lineTo(dx + w, dy + h - easedRadius);
    topRightCtx.quadraticCurveTo(dx + w, dy + h, dx + w - easedRadius, dy + h);
    topRightCtx.lineTo(dx + easedRadius, dy + h);
    topRightCtx.quadraticCurveTo(dx, dy + h, dx, dy + h - easedRadius);
    topRightCtx.lineTo(dx, dy + easedRadius);
    topRightCtx.quadraticCurveTo(dx, dy, dx + easedRadius, dy);
    topRightCtx.closePath();
    topRightCtx.clip();

    topRightCtx.drawImage(img, sx, sy, sw, sh, dx, dy, w, h);
    topRightCtx.restore();

    topRightCtx.lineWidth = 1;
    topRightCtx.strokeStyle = `rgba(255,255,255,${0.005 + 0.02 * t})`;
    topRightCtx.beginPath();
    topRightCtx.moveTo(dx + easedRadius, dy);
    topRightCtx.lineTo(dx + w - easedRadius, dy);
    topRightCtx.quadraticCurveTo(dx + w, dy, dx + w, dy + easedRadius);
    topRightCtx.lineTo(dx + w, dy + h - easedRadius);
    topRightCtx.quadraticCurveTo(dx + w, dy + h, dx + w - easedRadius, dy + h);
    topRightCtx.lineTo(dx + easedRadius, dy + h);
    topRightCtx.quadraticCurveTo(dx, dy + h, dx, dy + h - easedRadius);
    topRightCtx.lineTo(dx, dy + easedRadius);
    topRightCtx.quadraticCurveTo(dx, dy, dx + easedRadius, dy);
    topRightCtx.closePath();
    topRightCtx.stroke();
  }
}

function loadAndDrawBackground() {
  const newBgUrl = lensFx_getBackgroundImageUrl();
  if (!newBgUrl) {
    console.error("背景画像が取得できませんでした");
    return;
  }
  if (newBgUrl === currentBgUrl) return;

  currentBgUrl = newBgUrl;
  lensFx_img = new Image();
  lensFx_img.crossOrigin = "anonymous";
  lensFx_img.src = currentBgUrl;
  lensFx_img.onload = () => {
    lensFx_draw(lensFx_img);
    drawLensFxOnTopRightCanvas(lensFx_img);
  };
}

loadAndDrawBackground();

window.addEventListener("resize", () => {
  if (lensFx_img) {
    lensFx_draw(lensFx_img);
    drawLensFxOnTopRightCanvas(lensFx_img);
  }
});

const observer = new MutationObserver(() => {
  loadAndDrawBackground();
});
const canvasResizeObserver = new ResizeObserver(() => {
  if (lensFx_img) {
    lensFx_draw(lensFx_img);
    drawLensFxOnTopRightCanvas(lensFx_img);
  }
});
canvasResizeObserver.observe(lensFx_canvas);
canvasResizeObserver.observe(topRightCanvas);
observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });


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
