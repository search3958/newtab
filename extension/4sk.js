(() => {
  "use strict";

  // ===== 設定 =====
  const REQUEST_TYPE = "saetab_bridge_request";
  const BRIDGE_TYPE = "saetab_bridge_data";

  const BRIDGE_KEY = "saetab_bridge_enabled";
  const TIMETABLE_KEY = "sk_timetable";
  const MEMO_KEY = "sk_memo";

  const MEMO_LIMIT = 10;
  const REFRESH_MS = 60 * 1000;
  const FEATURE_NAME = "saetab Bridge";

  // データの受信を許可する親ページ
  const ALLOWED_PARENT_ORIGINS = new Set([
    "https://search3958.github.io"
  ]);

  let parentOrigin = null;

  // 親ページから最後に受信したストレージのスナップショット。
  // ブリッジページ自身の localStorage は許可判定・データ取得に使わない。
  let activeStorage = null;

  const dateFmt = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });

  // ===== ログ =====
  function log(message, details) {
    if (details === undefined) {
      console.info(`[${FEATURE_NAME}] ${message}`);
    } else {
      console.info(`[${FEATURE_NAME}] ${message}`, details);
    }
  }

  function logError(message, error) {
    console.error(`[${FEATURE_NAME}] ${message}`, error);
  }

  // ===== 親ページ確認 =====
  function isAllowedParentOrigin(origin) {
    if (ALLOWED_PARENT_ORIGINS.has(origin)) {
      return true;
    }

    try {
      const url = new URL(origin);
      return (
        (url.hostname === "localhost" ||
          url.hostname === "127.0.0.1" ||
          url.hostname === "[::1]" ||
          url.hostname === "::1") &&
        (url.protocol === "http:" || url.protocol === "https:")
      );
    } catch {
      return false;
    }
  }

  // localStorage.getItem() の値は通常 "true"。
  // 以前 JSON.stringify("true") で保存された値も扱う。
  function isEnabledValue(value) {
    if (value === true || value === "true") return true;
    if (typeof value !== "string") return false;

    try {
      return JSON.parse(value) === "true";
    } catch {
      return false;
    }
  }

  // storage.enabled は、送信元の親ページが読み取って送ってきた許可値。
  // 必ず送信元の検証後に使用する。
  function checkBridgeEnabled(storage = activeStorage) {
    return !!storage && isEnabledValue(storage.enabled);
  }

  function getRawStorageValue(key) {
    if (!activeStorage) return null;

    if (key === TIMETABLE_KEY) {
      return activeStorage.timetable ?? null;
    }

    if (key === MEMO_KEY) {
      return activeStorage.memo ?? null;
    }

    if (key === BRIDGE_KEY) {
      return activeStorage.enabled ?? null;
    }

    return null;
  }

  function getElements() {
    return {
      status: document.getElementById("bridgeStatus"),
      timetable: document.getElementById("timetableDisplay"),
      tomorrow: document.getElementById("tomorrowDisplay"),
      memo: document.getElementById("memoDisplay")
    };
  }

  // ===== ユーティリティ =====
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function ymd(date) {
    return date.getFullYear() + "-" +
      pad(date.getMonth() + 1) + "-" +
      pad(date.getDate());
  }

  function readJson(key) {
    try {
      const raw = getRawStorageValue(key);

      if (raw === null || raw === undefined || raw === "") {
        log(`送信データが見つかりません: ${key}`);
        return null;
      }

      // postMessage 側が JSON 文字列ではなくオブジェクトを渡した場合にも対応。
      if (typeof raw !== "string") {
        return raw;
      }

      return JSON.parse(raw);
    } catch (error) {
      logError(`送信データの読み込みに失敗しました: ${key}`, error);
      return null;
    }
  }

  // ===== 時間割 =====
  function getTimetableData(now = new Date()) {
    const store = readJson(TIMETABLE_KEY) || {};

    let tb = store.table || null;
    let title = (tb && tb.name) || "時間割";
    let source = "自分の時間割";

    if (
      store.view &&
      store.view !== "mine" &&
      store.received &&
      store.received[store.view]
    ) {
      tb = store.received[store.view].table;
      title = store.received[store.view].title || title;
      source = "配信された時間割";
    }

    const result = {
      title,
      source,
      dateText: dateFmt.format(now),
      special: "",
      note: "",
      off: false,
      none: false,
      slots: []
    };

    if (!tb) {
      result.none = true;
      return result;
    }

    const ds = ymd(now);

    const specials = (Array.isArray(tb.special) ? tb.special : [])
      .filter(sp =>
        sp &&
        sp.from &&
        sp.to &&
        ds >= sp.from &&
        ds <= sp.to
      );

    const sp = specials.length
      ? specials[specials.length - 1]
      : null;

    const day = sp
      ? ((sp.days || {})[ds] || {
          type: sp.kind === "off" ? "off" : "normal"
        })
      : null;

    if (sp) {
      result.special = sp.name || "";
      result.note = (day && day.note) || "";
    }

    if (day && day.type === "off") {
      result.off = true;
      return result;
    }

    if (day && day.type === "custom") {
      result.slots = (Array.isArray(day.slots) ? day.slots : [])
        .filter(x => x && x.subject)
        .map(x => ({
          period: "",
          s: x.s || "",
          e: x.e || "",
          subject: x.subject,
          room: x.room || ""
        }))
        .sort((a, b) =>
          a.s < b.s ? -1 : a.s > b.s ? 1 : 0
        )
        .map((x, i) => ({
          ...x,
          period: String(i + 1)
        }));

      return result;
    }

    // 月曜日=0 ～ 土曜日=5
    const di = (now.getDay() + 6) % 7;
    const days = tb.days === 6 ? 6 : 5;

    if (di >= days) {
      result.none = true;
      return result;
    }

    const periods = Math.min(
      10,
      Math.max(1, Number(tb.periods) || 6)
    );

    const cells = tb.cells || {};
    const times = Array.isArray(tb.times) ? tb.times : [];

    for (let p = 0; p < periods; p++) {
      const cell = cells[di + "-" + p];
      if (!cell || !cell.subject) continue;

      const time = times[p] || {};

      result.slots.push({
        period: String(p + 1),
        s: time.s || "",
        e: time.e || "",
        subject: cell.subject,
        room: cell.room || "",
        teacher: cell.teacher || "",
        color: cell.color || ""
      });
    }

    return result;
  }

  // ===== 明日の時間割 =====
  function getTomorrowData() {
    const now = new Date();
    return getTimetableData(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      )
    );
  }

  // ===== メモ =====
  function getMemoData() {
    const store = readJson(MEMO_KEY) || {};
    const notes = Array.isArray(store.notes) ? store.notes : [];

    const items = notes
      .filter(note => note && !note.deleted)
      .sort((a, b) =>
        (b.updated || 0) - (a.updated || 0)
      )
      .slice(0, MEMO_LIMIT)
      .map(note => {
        let title;

        if (note.locked) {
          title = "ロックされたメモ";
        } else {
          title = String(note.text || "")
            .split("\n")
            .map(line => line.trim())
            .find(Boolean) || "（無題）";
        }

        return {
          id: note.id,
          title,
          updated: note.updated || note.created || 0,
          locked: !!note.locked,
          pinned: !!note.pinned
        };
      });

    return {
      lastUpdated: new Date().toISOString(),
      items
    };
  }

  // ===== 送信データ =====
  function buildPayload() {
    return {
      timetable: getTimetableData(),
      tomorrow: getTomorrowData(),
      memo: getMemoData()
    };
  }

  // ===== 画面表示 =====
  function showDisabled() {
    const elements = getElements();

    if (elements.status) {
      elements.status.className = "status disabled";
      elements.status.textContent =
        "連携は無効です。ブリッジ側の設定を確認してください。";
    }

    if (elements.timetable) elements.timetable.textContent = "連携は無効です。";
    if (elements.tomorrow) elements.tomorrow.textContent = "連携は無効です。";
    if (elements.memo) elements.memo.textContent = "連携は無効です。";
  }

  function updateUI(payload) {
    const elements = getElements();

    if (
      !elements.status ||
      !elements.timetable ||
      !elements.tomorrow ||
      !elements.memo
    ) {
      logError("必要なHTML要素が見つかりません。");
      return;
    }

    elements.status.className = "status enabled";
    elements.status.textContent = "ブリッジは有効です。";
    elements.timetable.textContent = JSON.stringify(payload.timetable, null, 2);
    elements.tomorrow.textContent = JSON.stringify(payload.tomorrow, null, 2);
    elements.memo.textContent = JSON.stringify(payload.memo, null, 2);
  }

  // ===== 親ページへの送信 =====
  function sendToParent(data) {
    if (!checkBridgeEnabled()) {
      parentOrigin = null;
      activeStorage = null;
      showDisabled();
      log("許可されていないため、データ送信を拒否しました。");
      return false;
    }

    if (window.parent === window || !parentOrigin) {
      return false;
    }

    try {
      window.parent.postMessage(
        {
          type: BRIDGE_TYPE,
          timestamp: Date.now(),
          data
        },
        parentOrigin
      );

      log("親ページへデータを送信しました。", {
        targetOrigin: parentOrigin
      });
      return true;
    } catch (error) {
      logError("データ送信に失敗しました。", error);
      return false;
    }
  }

  // ===== 親ページからのリクエスト =====
  window.addEventListener("message", event => {
    if (event.source !== window.parent) return;
    if (!event.data || event.data.type !== REQUEST_TYPE) return;

    // 先に送信元を検証する。未許可の送信元の値は一切使わない。
    if (!isAllowedParentOrigin(event.origin)) {
      log("許可されていない親ページからのリクエストを拒否しました。", {
        origin: event.origin
      });
      return;
    }

    const incomingStorage = event.data.storage;

    if (!incomingStorage || typeof incomingStorage !== "object") {
      parentOrigin = null;
      activeStorage = null;
      showDisabled();
      logError("リクエストに storage が含まれていません。親ページ側の送信内容を確認してください。");
      return;
    }

    // 重要：許可判定は bridge 自身の localStorage ではなく、
    // 検証済みの親ページから受信した storage.enabled で行う。
    if (!checkBridgeEnabled(incomingStorage)) {
      parentOrigin = null;
      activeStorage = null;
      showDisabled();
      log("ブリッジ側の許可設定が無効なため、リクエストを拒否しました。", {
        enabledValue: incomingStorage.enabled
      });
      return;
    }

    // 許可を確認した後にだけ、受信したデータを利用可能にする。
    activeStorage = incomingStorage;
    parentOrigin = event.origin;

    try {
      const payload = buildPayload();
      updateUI(payload);
      sendToParent(payload);
    } catch (error) {
      logError("リクエストへの応答に失敗しました。", error);
    }
  });

  // ===== 更新 =====
  function refresh() {
    // 許可とデータは、最後に親ページから受け取ったスナップショットを使う。
    // 親ページでデータや許可状態が変わった場合は、親ページが再度リクエストを送る。
    if (!checkBridgeEnabled()) {
      parentOrigin = null;
      activeStorage = null;
      showDisabled();
      return;
    }

    try {
      const payload = buildPayload();
      updateUI(payload);

      if (parentOrigin) {
        sendToParent(payload);
      }
    } catch (error) {
      logError("データ更新中にエラーが発生しました。", error);
    }
  }

  // ===== 初期化 =====
  function init() {
    log("初期化を開始します。", {
      origin: window.location.origin,
      framed: window.parent !== window
    });

    // 初期化時点では、親ページから許可とデータが届くまで読み込まない。
    showDisabled();

    window.setInterval(refresh, REFRESH_MS);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    });

    log("初期化が完了しました。親ページからのリクエストを待機しています。");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
