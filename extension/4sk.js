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

  // 許可設定とデータは sk-hub.jp の非分割ストレージのみを参照する。
  // 親ページから送られた値を同意の根拠にはしない。
  let bridgeStorage = null;
  let storageAccessGranted = false;
  let storageAccessPromise = null;

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

  // Chrome のクロスサイト iframe では StorageAccessHandle.localStorage を使って、
  // sk-hub.jp のトップレベル保存領域へアクセスする。
  async function acquireStorageAccess() {
    if (bridgeStorage) return true;
    if (storageAccessPromise) return storageAccessPromise;

    storageAccessPromise = (async () => {
      try {
        if (window.parent === window) {
          bridgeStorage = window.localStorage;
          storageAccessGranted = true;
          return true;
        }

        if (typeof document.requestStorageAccess !== "function") {
          logError("このブラウザは localStorage 用の Storage Access API に対応していません。");
          return false;
        }

        const handle = await document.requestStorageAccess({ localStorage: true });
        if (!handle || !handle.localStorage) {
          logError("ブラウザから非分割 localStorage が返されませんでした。");
          return false;
        }

        bridgeStorage = handle.localStorage;
        storageAccessGranted = true;
        return true;
      } catch (error) {
        // 初回ロード時はユーザー操作がないため、ここで拒否されても正常。
        // 画面内のボタンを押した操作から再要求する。
        log("ストレージアクセスはまだ許可されていません。");
        return false;
      } finally {
        storageAccessPromise = null;
      }
    })();

    return storageAccessPromise;
  }

  function checkBridgeEnabled() {
    return getRawStorageValue(BRIDGE_KEY) === "true";
  }

  function showStorageAccessGate() {
    // 定期リクエストが来ても、表示中のボタンを作り直さない。
    if (document.getElementById("bridgeStorageAccessGate")) return;
    document.body.replaceChildren();
    Object.assign(document.body.style, {
      margin: "0",
      padding: "16px",
      boxSizing: "border-box",
      fontFamily: "system-ui, sans-serif",
      background: "#fff",
      color: "#202124"
    });

    const panel = document.createElement("main");
    panel.id = "bridgeStorageAccessGate";
    Object.assign(panel.style, {
      display: "grid",
      gap: "10px",
      alignContent: "start",
      maxWidth: "560px",
      margin: "0 auto"
    });

    const heading = document.createElement("strong");
    heading.textContent = "Saetab Bridge の接続設定";
    heading.style.fontSize = "16px";

    const message = document.createElement("p");
    message.textContent = "ブラウザが別サイト内の sk-hub.jp の保存領域を分離しています。sk-hub.jp 側で許可した連携設定と時間割・メモを読み取るには、ここでストレージアクセスを許可してください。";
    Object.assign(message.style, {
      margin: "0",
      fontSize: "13px",
      lineHeight: "1.5"
    });

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "ストレージへのアクセスを許可";
    Object.assign(button.style, {
      justifySelf: "start",
      border: "0",
      borderRadius: "999px",
      padding: "10px 16px",
      background: "#1a73e8",
      color: "white",
      font: "inherit",
      fontWeight: "600",
      cursor: "pointer"
    });

    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.style.cssText = "margin:0;font-size:12px;line-height:1.45";

    button.addEventListener("click", async () => {
      if (typeof document.requestStorageAccess !== "function") {
        status.textContent = "このブラウザでは localStorage のクロスサイトアクセスに対応していません。";
        return;
      }

      button.disabled = true;
      status.textContent = "ブラウザに保存領域へのアクセスを要求しています…";
      try {
        const handle = await document.requestStorageAccess({ localStorage: true });
        if (!handle || !handle.localStorage) {
          throw new Error("StorageAccessHandle.localStorage が返されませんでした。");
        }
        bridgeStorage = handle.localStorage;
        storageAccessGranted = true;
        // 許可後はトップレベルの保存領域を使えるようになったので再読み込みする。
        // 再読み込み後は、保存済みの許可により handle を自動取得できる。
        status.textContent = "許可されました。保存領域を読み直します…";
        location.reload();
      } catch (error) {
        button.disabled = false;
        status.textContent = "アクセスが許可されませんでした。ブラウザの許可画面でブロックされていないか確認してください。";
        logError("ストレージアクセスが拒否されました。", error);
      }
    });

    panel.append(heading, message, button, status);
    document.body.appendChild(panel);
  }

  function getRawStorageValue(key) {
    try {
      if (!bridgeStorage) return null;
      return bridgeStorage.getItem(key);
    } catch (error) {
      logError(`保存データの読み込みに失敗しました: ${key}`, error);
      return null;
    }
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
  window.addEventListener("message", async event => {
    if (event.source !== window.parent) return;
    if (!event.data || event.data.type !== REQUEST_TYPE) return;

    // 親ページは要求だけを送る。許可設定・データの値は提供元自身で読む。
    if (!isAllowedParentOrigin(event.origin)) {
      log("許可されていない親ページからのリクエストを拒否しました。", {
        origin: event.origin
      });
      return;
    }

    let hasAccess = storageAccessGranted || !!bridgeStorage;
    if (!hasAccess && storageAccessPromise) {
      hasAccess = await storageAccessPromise;
    }
    if (!hasAccess) {
      parentOrigin = null;
      showStorageAccessGate();
      log("ストレージアクセスの許可が必要です。");
      return;
    }
    storageAccessGranted = true;

    // 提供元 sk-hub.jp の同意がなければデータを読み出さない。
    if (!checkBridgeEnabled()) {
      parentOrigin = null;
      showDisabled();
      log("sk-hub.jp 側の許可設定が無効なため、リクエストを拒否しました。", {
        enabledValue: getRawStorageValue(BRIDGE_KEY)
      });
      return;
    }

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
  async function refresh() {
    if (!storageAccessGranted || !bridgeStorage) {
      parentOrigin = null;
      showStorageAccessGate();
      return;
    }

    if (!checkBridgeEnabled()) {
      parentOrigin = null;
      showDisabled();
      return;
    }

    try {
      const payload = buildPayload();
      updateUI(payload);
      if (parentOrigin) sendToParent(payload);
    } catch (error) {
      logError("データ更新中にエラーが発生しました。", error);
    }
  }

  // ===== 初期化 =====
  async function init() {
    log("初期化を開始します。", {
      origin: window.location.origin,
      framed: window.parent !== window
    });

    const hasAccess = await acquireStorageAccess();
    if (!hasAccess) {
      showStorageAccessGate();
      log("ストレージアクセス許可を待機しています。");
      return;
    }

    storageAccessGranted = true;
    refresh();

    window.addEventListener("storage", event => {
      if (
        event.key === null ||
        event.key === BRIDGE_KEY ||
        event.key === TIMETABLE_KEY ||
        event.key === MEMO_KEY
      ) {
        refresh();
      }
    });

    window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refresh();
    });

    log("初期化が完了しました。親ページからのリクエストを待機しています。");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
