/* SaeTab 拡張機能「今日は何の日」
   日本語版 Wikipedia の日付のページ（例: 10月16日）から、記念日やできごとを読んで、検索ボックスの中に1つずつ出す。
   ・読み込むのは1日1回（localStorage の ext:today-anniversary:cache に保存）
   ・表示する内容は拡張機能ページの設定で選べる（ext:today-anniversary:settings の kind: anniversary / event / both）
   ・何か打ちはじめると消える（検索のじゃまをしない） */
(() => {
  "use strict";

  const EXT_ID = "today-anniversary";
  const SETTINGS_KEY = `ext:${EXT_ID}:settings`;
  const CACHE_KEY = `ext:${EXT_ID}:cache`;
  const CHIP_ID = "sx-today";
  const ROTATE_MS = 7000;
  const MAX_ITEMS = 15;
  const API = "https://ja.wikipedia.org/w/api.php";
  const SECTIONS = { anniversary: "記念日", event: "できごと" };

  if (document.getElementById(CHIP_ID)) return;

  const now = new Date();
  const pageTitle = `${now.getMonth() + 1}月${now.getDate()}日`;
  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  function settings() {
    try { return { kind: "anniversary", ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; }
    catch { return { kind: "anniversary" }; }
  }

  // ---- Wikipedia の書き方（ウィキテキスト）を読みやすい文に ----
  function clean(text) {
    let s = String(text);
    s = s.replace(/<ref[^>]*\/>/g, "").replace(/<ref[\s\S]*?<\/ref>/g, "");
    let prev;
    do { prev = s; s = s.replace(/\{\{[^{}]*\}\}/g, ""); } while (s !== prev); // {{...}}（入れ子も）
    s = s.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1");                      // [[a|b]] → b
    s = s.replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, "$1");                        // [URL 文字] → 文字
    s = s.replace(/'''?/g, "").replace(/<[^>]+>/g, "");
    s = s.replace(/（\s*）|\(\s*\)/g, "").replace(/\s+/g, " ").trim();
    return s;
  }

  function parseSection(wikitext, kind) {
    const items = [];
    for (const line of wikitext.split("\n")) {
      // 箇条書きの1段目だけ（「*:」の説明や「**」の下の段は使わない）
      const m = /^\*(?![*:#])\s*(.+)$/.exec(line);
      if (!m) continue;
      let text = clean(m[1]);
      if (!text) continue;
      if (kind === "event") text = text.replace(/^(\d+年)\s*[-–—]\s*/, "$1 ");
      items.push({ kind, text });
    }
    return items;
  }

  async function api(params) {
    const url = new URL(API);
    Object.entries({ format: "json", formatversion: "2", origin: "*", ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
    return res.json();
  }

  async function fetchItems(kinds) {
    const info = await api({ action: "parse", page: pageTitle, prop: "sections" });
    const sections = (info.parse && info.parse.sections) || [];
    const result = [];
    for (const kind of kinds) {
      const sec = sections.find((s) => s.line.includes(SECTIONS[kind]));
      if (!sec) continue;
      const data = await api({ action: "parse", page: pageTitle, prop: "wikitext", section: sec.index });
      result.push(...parseSection((data.parse && data.parse.wikitext) || "", kind));
    }
    return result;
  }

  async function loadItems(kind) {
    const kinds = kind === "both" ? ["anniversary", "event"] : [kind === "event" ? "event" : "anniversary"];
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cache && cache.day === dayKey && cache.kind === kind && Array.isArray(cache.items)) return cache.items;
    } catch { /* 読み直す */ }
    const items = await fetchItems(kinds);
    // できごとは数が多いので、毎日ちがうものが出るように混ぜてから絞る
    const shuffled = items.map((it) => [Math.random(), it]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const picked = kind === "both"
      ? [...shuffled.filter((x) => x.kind === "anniversary").slice(0, 8), ...shuffled.filter((x) => x.kind === "event").slice(0, 7)]
      : shuffled.slice(0, MAX_ITEMS);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ day: dayKey, kind, items: picked })); } catch { /* 保存できなくても表示はする */ }
    return picked;
  }

  // ---- 表示（検索ボックスの中。何も打っていないときだけ、プレースホルダーの代わりに出す）----
  // 本物の placeholder はふわっと切りかえられないので、文字を検索ボックスの上に重ねる（押すと下の検索ボックスに届く）
  const input = document.getElementById("searchBox");
  const bar = input && input.closest(".search");
  if (!input || !bar) { console.info("[Ext:today-anniversary] 検索ボックスが見つかりませんでした。"); return; }

  const style = document.createElement("style");
  style.textContent = `
    #${CHIP_ID} {
      position: absolute; top: 50%; z-index: 1; transform: translateY(-50%);
      display: flex; align-items: baseline; gap: .4em; min-width: 0;
      pointer-events: none; white-space: nowrap; overflow: hidden;
      transition: opacity .35s ease, filter .35s ease;
    }
    #${CHIP_ID}[hidden] { display: none; }
    #${CHIP_ID}.is-hiding { opacity: 0; filter: blur(4px); }
    #${CHIP_ID} .sx-today-label { flex: none; font-weight: 700; }
    #${CHIP_ID} .sx-today-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    #searchBox.sx-today-on::placeholder { color: transparent !important; }
    @media (prefers-reduced-motion: reduce) { #${CHIP_ID} { transition: none; } }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = CHIP_ID;
  overlay.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  const label = document.createElement("span");
  label.className = "sx-today-label";
  const text = document.createElement("span");
  text.className = "sx-today-text";
  overlay.append(label, text);
  bar.appendChild(overlay);

  // 検索ボックスの文字の位置・大きさ・色に合わせる（テーマで変わるので、出すたびに測る）
  function fit() {
    const cs = getComputedStyle(input);
    let ph = "";
    try { ph = getComputedStyle(input, "::placeholder").color; } catch { /* 読めなければ文字の色を薄くして使う */ }
    const barRect = bar.getBoundingClientRect();
    const inRect = input.getBoundingClientRect();
    const left = inRect.left - barRect.left + parseFloat(cs.paddingLeft || "0");
    overlay.style.left = `${left}px`;
    overlay.style.maxWidth = `${Math.max(0, inRect.width - parseFloat(cs.paddingLeft || "0") - 8)}px`;
    overlay.style.fontFamily = cs.fontFamily;
    overlay.style.fontSize = cs.fontSize;
    overlay.style.color = ph && ph !== "rgba(0, 0, 0, 0)" ? ph : cs.color;
    overlay.style.opacity = ph && ph !== "rgba(0, 0, 0, 0)" ? "" : ".55";
  }

  let ready = false;
  function update() {
    const show = ready && input.value === "";
    overlay.hidden = !show;
    input.classList.toggle("sx-today-on", show);
    if (show) fit();
  }
  ["input", "focus", "blur", "change"].forEach((type) => input.addEventListener(type, update));
  window.addEventListener("resize", update);

  function show(item) {
    label.textContent = item.kind === "event" ? "今日のできごと" : "今日は";
    text.textContent = item.text;
    input.title = `${pageTitle}：${item.text}`;
  }

  loadItems(settings().kind).then((items) => {
    if (!items.length) { console.info("[Ext:today-anniversary] 今日の項目が見つかりませんでした。"); return; }
    let i = 0;
    show(items[0]);
    ready = true;
    update();
    if (items.length < 2) return;
    setInterval(() => {
      if (document.hidden || overlay.hidden) return;
      overlay.classList.add("is-hiding");
      setTimeout(() => {
        i = (i + 1) % items.length;
        show(items[i]);
        overlay.classList.remove("is-hiding");
      }, 350);
    }, ROTATE_MS);
  }).catch((error) => console.error("[Ext:today-anniversary] 読み込めませんでした:", error));
})();
