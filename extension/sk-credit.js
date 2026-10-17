/* SK が作った拡張機能・テーマの「Developed by SK」表示（SaeTab の中）
   SK の拡張機能（SK's Toolbox 連携・検索の近道・今日は何の日）と SK Material テーマが読み込む。何回読み込まれても1回だけ動く。
   ・「同期と管理」の拡張機能の欄で、SK のものの名前の横に印を付ける
   ・SK Material を使っているときだけ、ホームの左上に小さく出す */
(() => {
  "use strict";

  if (window.__saetabSkCredit) return;
  window.__saetabSkCredit = true;

  const LABEL = "Developed by SK";
  const LINK = "https://sk-hub.jp/";
  const LOGO = "https://sk-hub.jp/assets/sk-32.png";
  const HOME_ID = "sk-credit-home";
  // 拡張機能のレコードの名前（extensions/catalog.js の recordName・name と同じ）
  const SK_NAMES = ["saetab-bridge", "検索の近道", "今日は何の日"];
  const isSkName = (name) => SK_NAMES.includes(name) || /^テーマ: SK Material/.test(name);
  const usingSkMaterial = () => document.documentElement.dataset.saetabTheme === "material3";

  const style = document.createElement("style");
  style.textContent = `
    .sk-credit-badge {
      display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;
      margin-left: 8px; padding: 2px 8px 2px 3px; border-radius: 999px;
      background: color-mix(in srgb, currentColor 10%, transparent);
      color: inherit; text-decoration: none; font-size: 10.5px; font-weight: 600; letter-spacing: .02em; white-space: nowrap; opacity: .85;
    }
    .sk-credit-badge:hover { opacity: 1; }
    .sk-credit-badge img { width: 13px; height: 13px; border-radius: 4px; }
    #${HOME_ID} {
      position: fixed; top: 20px; left: 20px; z-index: 3;
      display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px 5px 5px; border-radius: 999px;
      background: color-mix(in srgb, var(--md-surface-container-high, #e7e8ee) 82%, transparent);
      color: var(--md-on-surface-variant, #44474e); text-decoration: none;
      font-family: var(--md-font, inherit); font-size: 12px; font-weight: 500; letter-spacing: .02em;
      -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, .18); opacity: .9;
      transition: opacity .2s linear, transform .3s cubic-bezier(.34, 1.4, .64, 1);
    }
    #${HOME_ID}:hover { opacity: 1; transform: translateY(1px); }
    #${HOME_ID} img { width: 20px; height: 20px; border-radius: 6px; }
    #${HOME_ID}[hidden] { display: none; }
  `;
  document.head.appendChild(style);

  function badge(className) {
    const a = document.createElement("a");
    a.className = className;
    a.href = LINK;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = "SK Hub";
    const img = document.createElement("img");
    img.src = LOGO;
    img.alt = "";
    a.append(img, LABEL);
    return a;
  }

  // ホームの左上（SK Material のときだけ）
  const home = badge("");
  home.id = HOME_ID;
  home.hidden = true;
  document.body.appendChild(home);
  const updateHome = () => { home.hidden = !usingSkMaterial(); };
  updateHome();
  new MutationObserver(updateHome).observe(document.documentElement, { attributes: true, attributeFilter: ["data-saetab-theme"] });

  // 「同期と管理」の拡張機能の欄（ダイアログは開くたびに作り直されるので、出てきたら印を付ける）
  function markRows(root) {
    root.querySelectorAll(".newtab-settings-row > span:first-child").forEach((span) => {
      if (span.querySelector(".sk-credit-badge")) return;
      const name = (span.firstChild && span.firstChild.nodeType === Node.TEXT_NODE ? span.firstChild.textContent : span.textContent).trim();
      if (isSkName(name)) span.appendChild(badge("sk-credit-badge"));
    });
  }
  new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => { if (n.nodeType === 1) markRows(n); });
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
