/* SaeTab 拡張機能「検索の近道」
   検索ボックスに「!yt 猫」のように打つと、YouTube など決めたサイトで直接さがす。
   近道の一覧は拡張機能ページの設定で変えられる（localStorage の ext:search-shortcuts:settings）。
   SaeTab の検索より先に動くよう、keydown・click をキャプチャで受け取る */
(() => {
  "use strict";

  const EXT_ID = "search-shortcuts";
  const SETTINGS_KEY = `ext:${EXT_ID}:settings`;
  const HINT_ID = "sx-bang-hint";
  // 拡張機能ページ（extensions/catalog.js）の初期値と同じ
  const DEFAULTS = [
    { key: "g", name: "Google", url: "https://www.google.com/search?q=%s" },
    { key: "yt", name: "YouTube", url: "https://www.youtube.com/results?search_query=%s" },
    { key: "w", name: "Wikipedia", url: "https://ja.wikipedia.org/w/index.php?search=%s" },
    { key: "a", name: "Amazon", url: "https://www.amazon.co.jp/s?k=%s" },
    { key: "m", name: "Google マップ", url: "https://www.google.com/maps/search/%s" },
    { key: "t", name: "Google 翻訳", url: "https://translate.google.com/?sl=auto&tl=ja&text=%s" },
    { key: "x", name: "X", url: "https://x.com/search?q=%s" },
    { key: "gh", name: "GitHub", url: "https://github.com/search?q=%s" },
    { key: "i", name: "Google 画像", url: "https://www.google.com/search?tbm=isch&q=%s" }
  ];

  if (window.__saetabSearchShortcuts) return;
  window.__saetabSearchShortcuts = true;

  // 「Developed by SK」の表示（extension/sk-credit.js。何回読み込んでも1回だけ動く）
  if (!document.querySelector("script[data-sk-credit]")) {
    const credit = document.createElement("script");
    credit.src = new URL("sk-credit.js", (document.currentScript && document.currentScript.src) || new URL("./extension/", location.href)).href;
    credit.dataset.skCredit = "";
    document.head.appendChild(credit);
  }

  function loadShortcuts() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (saved && Array.isArray(saved.shortcuts)) {
        return saved.shortcuts.filter((s) => s && s.key && s.url && s.url.includes("%s"));
      }
    } catch (error) { console.error("[Ext:search-shortcuts] 設定を読めませんでした:", error); }
    return DEFAULTS;
  }

  // 「!yt 猫」→ { shortcut, query: "猫" }。キーが見つからなければ null
  function parse(value, shortcuts) {
    const m = /^\s*!(\S+)(?:\s+([\s\S]*))?$/.exec(value || "");
    if (!m) return null;
    const key = m[1].toLowerCase();
    const shortcut = shortcuts.find((s) => s.key.toLowerCase() === key);
    return shortcut ? { shortcut, query: (m[2] || "").trim() } : null;
  }

  function go(hit) {
    const url = hit.query
      ? hit.shortcut.url.split("%s").join(encodeURIComponent(hit.query))
      // 言葉がないときは、そのサイトのトップを開く
      : new URL(hit.shortcut.url.replace("%s", "")).origin;
    console.info(`[Ext:search-shortcuts] !${hit.shortcut.key} → ${hit.shortcut.name}`);
    window.location.href = url;
  }

  const box = () => document.getElementById("searchBox");

  // Enter（SaeTab の検索より先に）
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing || e.target !== box()) return;
    const hit = parse(box().value, loadShortcuts());
    if (!hit) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    go(hit);
  }, true);

  // 検索ボタン
  document.addEventListener("click", (e) => {
    if (!e.target.closest || !e.target.closest("#searchButton") || !box()) return;
    const hit = parse(box().value, loadShortcuts());
    if (!hit) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    go(hit);
  }, true);

  // 「!」を打ったら、使える近道を検索ボックスの上に出す
  const style = document.createElement("style");
  style.textContent = `
    /* 置き場所と枠は SaeTab の「@」アプリ内検索の候補（.app-search-dropdown）と同じ。テーマもそのまま効く */
    #${HINT_ID}[hidden] { display: none !important; }
    #${HINT_ID} .sx-bang-title { margin: 4px 8px 8px; font-size: 12px; opacity: .65; }
    #${HINT_ID} .sx-bang-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 4px 4px; }
    #${HINT_ID} .sx-chip {
      display: inline-flex; align-items: center; gap: 6px; height: 34px; margin: 0; padding: 0 12px;
      border: 0; border-radius: 99px; background: rgba(127, 127, 127, .14); color: inherit;
      font: inherit; font-size: 13px; cursor: pointer;
    }
    #${HINT_ID} .sx-chip:hover { background: rgba(127, 127, 127, .26); }
    #${HINT_ID} .sx-chip.is-match { box-shadow: inset 0 0 0 2px currentColor; }
    #${HINT_ID} .sx-key { font-weight: 700; }
    #${HINT_ID} { color: #000; }
    /* 近道を出しているあいだは、SaeTab のふつうの検索候補を隠す（同じ場所に重なるので） */
    html.sx-bang-mode #mainSuggestionDropdown, html.sx-bang-mode #intelBox { display: none !important; }
    @media (prefers-color-scheme: dark) { #${HINT_ID} { color: #fff; } }
  `;
  document.head.appendChild(style);

  const hint = document.createElement("div");
  hint.id = HINT_ID;
  hint.className = "app-search-dropdown visible";
  hint.hidden = true;
  hint.setAttribute("aria-live", "polite");
  const hintTitle = document.createElement("p");
  hintTitle.className = "sx-bang-title";
  hintTitle.textContent = "検索の近道 ─ 「!キー 言葉」でそのサイトをさがします";
  const hintChips = document.createElement("div");
  hintChips.className = "sx-bang-chips";
  hint.append(hintTitle, hintChips);
  document.body.appendChild(hint);

  function renderHint() {
    const input = box();
    const value = input ? input.value : "";
    const m = /^\s*!(\S*)$/.exec(value);
    if (!m) { hint.hidden = true; document.documentElement.classList.remove("sx-bang-mode"); return; }
    const typed = m[1].toLowerCase();
    const list = loadShortcuts().filter((s) => s.key.toLowerCase().startsWith(typed));
    hintChips.replaceChildren();
    list.slice(0, 10).forEach((s) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "sx-chip" + (s.key.toLowerCase() === typed ? " is-match" : "");
      const key = document.createElement("span");
      key.className = "sx-key";
      key.textContent = "!" + s.key;
      chip.append(key, s.name);
      // 押したら「!yt 」まで入れて、続けて言葉を打てるようにする
      chip.addEventListener("mousedown", (e) => e.preventDefault());
      chip.addEventListener("click", () => {
        input.value = `!${s.key} `;
        input.focus();
        renderHint();
      });
      hintChips.appendChild(chip);
    });
    hint.hidden = list.length === 0;
    document.documentElement.classList.toggle("sx-bang-mode", !hint.hidden);
  }

  document.addEventListener("input", (e) => { if (e.target === box()) renderHint(); }, true);
  document.addEventListener("focusout", (e) => { if (e.target === box()) setTimeout(() => { hint.hidden = true; document.documentElement.classList.remove("sx-bang-mode"); }, 150); }, true);
  document.addEventListener("focusin", (e) => { if (e.target === box()) renderHint(); }, true);
})();
