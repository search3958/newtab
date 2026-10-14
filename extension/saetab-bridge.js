(() => {
  "use strict";

  // ===== 設定 =====
  const BRIDGE_URL = "https://sk-hub.jp/toolbox/saetab-bridge/index.html";
  const BRIDGE_ORIGIN = new URL(BRIDGE_URL).origin;
  const IFRAME_ID = "saetab-bridge";
  const BANNER_ID = "sb-banner";
  const BANNER_BOTTOM = "146px";
  const CLOCK_BOTTOM = "192px";
  const CLOCK_URL = "https://sk-hub.jp/toolbox/clock/?value=from-saetab-bridge-7";
  const MEMO_MAX = 8;
  const BRIDGE_TYPE = "saetab_bridge_data";
  const REQUEST_TYPE = "saetab_bridge_request";
  const REQUEST_EVERY_MS = 15 * 1000;
  const WAIT_MS = 8 * 1000;
  const STALE_MS = 3 * 60 * 1000;
  const TICK_MS = 30 * 1000;

  if (document.getElementById(BANNER_ID)) return;

  // ===== 受け取り用 iframe =====
  let iframe = document.getElementById(IFRAME_ID);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.title = "saetab Bridge";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }
  if (iframe.getAttribute("src") !== BRIDGE_URL) iframe.src = BRIDGE_URL;

  // ===== スタイル =====
  const style = document.createElement("style");
  style.textContent = `
    #${BANNER_ID} {
      position: fixed;
      left: 50%;
      bottom: ${BANNER_BOTTOM};
      transform: translateX(-50%);
      width: min(96vw, 1200px);
      display: flex;
      gap: 12px;
      box-sizing: border-box;
      font-size: 13px;
      z-index: 0;
      justify-content: center;
      height: 46px;
    }
    #${BANNER_ID} .sb-col { transform: translate(0, 0px) scale(1); width: fit-content; display: flex; flex-direction: column; padding: 6px 10px; border-radius: 99px; corner-shape: superellipse(1.6); transition: transform 0.3s cubic-bezier(.26,0,0,1); }
    #${BANNER_ID} .sb-col[data-href] { cursor: pointer; }
    #${BANNER_ID} .sb-col:hover { transform: translate(0, -3px) scale(1.05); }
    #${BANNER_ID} .sb-col:active { opacity:0.7; }
    #${BANNER_ID} .sb-col[data-href]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    #${BANNER_ID} .sb-tt { background: linear-gradient(153deg,rgba(125, 205, 238, 1) 0%, rgba(37, 116, 234, 1) 100%); color: #FFFFFF; }
    #${BANNER_ID} .sb-memo { background: linear-gradient(153deg,rgb(255, 193, 99) 0%, rgba(233, 137, 74, 1) 100%); color: #FFF; }
    #${BANNER_ID} .sb-icon { padding: 0px; height: 100%; }
    #${BANNER_ID} .sb-icon img { border-radius: 99px; corner-shape: superellipse(1.6); height: 100%; aspect-ratio: 1 / 1; }
    #${BANNER_ID} .sb-head { width: fit-content; font-weight: 700; font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 1em; }
    #${BANNER_ID} .sb-status { font-size: 11px; opacity: .6; margin-left: 6px; font-weight: 400; }
    #${BANNER_ID} .sb-slots { width: fit-content; display: flex; gap: 8px; overflow-x: auto; }
    #${BANNER_ID} .sb-slot {
      flex: 0 0 auto;
      min-width: 140px;
      padding: 6px 8px;
      background: rgba(255,255,255,.07);
      border-left: 4px solid var(--cc, #60a5fa);
      border-radius: 6px;
    }
    #${BANNER_ID} .sb-label { font-size: 11px; opacity: .75; margin-bottom: 2px; }
    #${BANNER_ID} .sb-period { font-weight: 700; }
    #${BANNER_ID} .sb-time { opacity: .7; font-size: 11px; }
    #${BANNER_ID} .sb-subject { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #${BANNER_ID} .sb-room { opacity: .7; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #${BANNER_ID} .sb-muted { opacity: .6; padding: 6px 0; }
    #${BANNER_ID} .sb-tomorrow { font-size: 14px; line-height: 1.6; }
    #${BANNER_ID} .sb-memos { width: fit-content; overflow-y: auto; max-height: 96px; }
    #${BANNER_ID} .sb-memo-row { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
    #${BANNER_ID} .sb-memo-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    #${BANNER_ID} .sb-memo-time { display: none; }
    #clock:hover { opacity: 0.7; cursor: pointer; }
  `;
  document.head.appendChild(style);

  // ===== バナー =====
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.innerHTML = `
    <div class="sb-col sb-icon">
      <img src="https://sk-hub.jp/toolbox/icon.svg">
    </div>
    <div class="sb-col sb-tt" data-href="https://sk-hub.jp/toolbox/timetable/?value=from-saetab-bridge-7">
      <div class="sb-head"><span id="sb-tt-head">時間割を待っています…</span><span class="sb-status" id="sb-status"></span></div>
      <div class="sb-slots" id="sb-slots"></div>
    </div>
    <div class="sb-col sb-memo" data-href="https://sk-hub.jp/toolbox/memo/?value=from-saetab-bridge-7">
      <div class="sb-head">最新のメモ</div>
      <div class="sb-memos" id="sb-memos"></div>
    </div>
    <div class="sb-col sb-icon" data-href="https://sk-hub.jp/toolbox/todo/?value=from-saetab-bridge-7">
      <img src="https://sk-hub.jp/toolbox/todo/icon.svg">
    </div>
    <div class="sb-col sb-icon" data-href="https://sk-hub.jp/toolbox/calc/?value=from-saetab-bridge-7">
      <img src="https://sk-hub.jp/toolbox/calc/icon.svg">
    </div>
    <div class="sb-col sb-icon" data-href="https://sk-hub.jp/toolbox/countdown/?value=from-saetab-bridge-7">
      <img src="https://sk-hub.jp/toolbox/countdown/icon.svg">
    </div>
    <div class="sb-col sb-icon" data-href="https://sk-hub.jp/toolbox/roulette/?value=from-saetab-bridge-7">
      <img src="https://sk-hub.jp/toolbox/roulette/icon.svg">
    </div>
  `;
  document.body.appendChild(banner);

  // ===== リンク =====
  const go = (url) => { location.href = url; };

  banner.addEventListener("click", (e) => {
    const target = e.target.closest("[data-href]");
    if (target) go(target.dataset.href);
  });

  banner.querySelectorAll("[data-href]").forEach((c) => {
    c.setAttribute("role", "link");
    c.tabIndex = 0;
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter") go(c.dataset.href);
    });
  });

  // 時計
  const clock = document.getElementById("clock");
  if (clock) {
    clock.style.bottom = CLOCK_BOTTOM;
    clock.addEventListener("click", () => go(CLOCK_URL));
  }

  // ===== 表示ヘルパー =====
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const timeFmt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const clockFmt = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" });

  function toMin(hm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hm || "");
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }

  // ===== 今日の時間割 =====
  let lastTimetable = null;
  let showingTomorrow = false;

  function renderNow() {
    const head = $("sb-tt-head");
    const status = $("sb-status");
    const slotsBox = $("sb-slots");
    slotsBox.replaceChildren();
    showingTomorrow = false;

    if (!lastTimetable) {
      head.textContent = "時間割を待っています…";
      status.textContent = "";
      return;
    }

    const tt = lastTimetable;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const list = (tt.none || tt.off ? [] : (tt.slots || []))
      .map((s) => ({ ...s, sm: toMin(s.s), em: toMin(s.e) }))
      .filter((s) => s.sm !== null && s.em !== null && s.em > s.sm)
      .sort((a, b) => a.sm - b.sm);

    const cur = list.find((s) => nowMin >= s.sm && nowMin < s.em);
    const next = list.find((s) => s.sm > nowMin);

    if (cur || next) {
      head.textContent = [tt.dateText, tt.title || "時間割", tt.special].filter(Boolean).join("　");
      status.textContent = tt.source ? `（${tt.source}）` : "";
      if (cur) slotsBox.appendChild(makeCard("いま", cur, `あと ${cur.em - nowMin} 分`));
      if (next) slotsBox.appendChild(makeCard("次", next, `${next.s} から`));
      return;
    }

    showingTomorrow = true;
    renderTomorrow();
  }

  function makeCard(label, s, note) {
    const card = el("div", "sb-slot");
    if (s.color) card.style.setProperty("--cc", s.color);
    card.appendChild(el("div", "sb-label", `${label} · ${note}`));
    card.appendChild(el("div", "sb-period", s.period + "限"));
    card.appendChild(el("div", "sb-time", s.s && s.e ? s.s + "〜" + s.e : ""));
    card.appendChild(el("div", "sb-subject", s.subject || ""));
    const place = [s.room, s.teacher].filter(Boolean).join(" · ");
    if (place) card.appendChild(el("div", "sb-room", place));
    return card;
  }

  function renderTomorrow() {
    const head = $("sb-tt-head");
    const status = $("sb-status");
    const slotsBox = $("sb-slots");
    status.textContent = "";

    const tm = lastTimetable && lastTimetable.tomorrow;
    if (!tm) {
      head.textContent = "明日";
      slotsBox.appendChild(el("div", "sb-muted", "明日の時間割はまだ届いていません"));
      return;
    }

    head.textContent = ["明日", tm.dateText, tm.special].filter(Boolean).join("　");

    if (tm.none) {
      slotsBox.appendChild(el("div", "sb-muted", "明日は授業がありません"));
      return;
    }
    if (tm.off) {
      slotsBox.appendChild(el("div", "sb-muted", "明日はお休みです"));
      return;
    }

    const lessons = (tm.slots || []).filter((s) => s.subject);
    if (!lessons.length) {
      slotsBox.appendChild(el("div", "sb-muted", "明日の時間割はまだ入っていません"));
      return;
    }

    const line = lessons.map((s) => `${s.period}限 ${s.subject}`).join("　・　");
    slotsBox.appendChild(el("div", "sb-tomorrow", line));
  }

  // ===== メモ =====
  function renderMemo(items) {
    const box = $("sb-memos");
    box.replaceChildren();
    if (!items.length) {
      box.appendChild(el("div", "sb-muted", "メモはまだありません"));
      return;
    }

    items.slice(0, MEMO_MAX).forEach((m) => {
      const row = el("div", "sb-memo-row");
      const title = el("span", "sb-memo-title");
      if (m.pinned) title.appendChild(document.createTextNode("📌 "));
      if (m.locked) title.appendChild(document.createTextNode("🔒 "));
      title.appendChild(document.createTextNode(m.title || "（無題）"));
      row.append(title, el("span", "sb-memo-time", m.updated ? timeFmt.format(new Date(m.updated)) : ""));
      box.appendChild(row);
    });
  }

  // ===== 接続状態 =====
  const pageStart = Date.now();
  let lastReceived = 0;

  function updateConnStatus() {
    if (showingTomorrow) return;
    const s = $("sb-status");
    if (!lastTimetable) {
      s.textContent = Date.now() > pageStart + WAIT_MS ? "未受信（bridge 側の saetab_bridge_enabled を確認）" : "接続待ち";
      return;
    }
    const stale = Date.now() - lastReceived > STALE_MS;
    s.textContent = (stale ? "途切れ · " : "") + "最終受信 " + clockFmt.format(new Date(lastReceived));
  }

  // ===== 要求（保存値を添えて送る）=====
  function requestData() {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: REQUEST_TYPE,
      storage: {
        enabled: localStorage.getItem("saetab_bridge_enabled"),
        timetable: localStorage.getItem("sk_timetable"),
        memo: localStorage.getItem("sk_memo")
      }
    }, BRIDGE_ORIGIN);
  }

  // ===== 受信 =====
  window.addEventListener("message", (e) => {
    if (e.origin !== BRIDGE_ORIGIN) return;
    if (e.source !== iframe.contentWindow) return;
    if (!e.data || e.data.type !== BRIDGE_TYPE || !e.data.data) return;

    const data = e.data.data;
    lastReceived = Date.now();
    lastTimetable = {
      ...(data.timetable || {}),
      tomorrow: data.tomorrow || null
    };
    renderNow();
    renderMemo((data.memo && data.memo.items) || []);
    updateConnStatus();
  });

  iframe.addEventListener("load", requestData);
  setInterval(requestData, REQUEST_EVERY_MS);
  setInterval(() => { renderNow(); updateConnStatus(); }, TICK_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { renderNow(); requestData(); }
  });

  renderNow();
  updateConnStatus();
})();