/* SaeTab 拡張機能ページ
   SaeTab 7 と同じ IndexedDB（Newtab7Extensions / scripts）に保存する。SaeTab は開くたびにここの拡張をすべて実行する。
   レコード: { id, name, encoding: "plain", code, kind: "extension" | "theme", createdAt, updatedAt } */
(() => {
  "use strict";

  const DB_NAME = "Newtab7Extensions";
  const DB_VERSION = 1;
  const STORE = "scripts";
  const THEME_PREFIX = "theme:";
  const THEME_STYLE_ID = "saetab-theme-style";
  const { EXTENSIONS, THEMES } = window.SAETAB_CATALOG || { EXTENSIONS: [], THEMES: [] };

  const $ = (id) => document.getElementById(id);

  // ===== IndexedDB =====
  let dbPromise = null;
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) { reject(new Error("このブラウザでは IndexedDB を使えません。")); return; }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); dbPromise = null; };
        resolve(db);
      };
      request.onerror = () => { dbPromise = null; reject(request.error || new Error("データベースを開けませんでした。")); };
    });
    return dbPromise;
  }

  async function getAll() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // puts と deletes を1つのトランザクションでまとめて行う（テーマの入れかえで途中の状態を作らない）
  async function write({ puts = [], deletes = [] }) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      deletes.forEach((id) => store.delete(id));
      puts.forEach((record) => store.put(record));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("保存が中断されました。"));
    });
    deletes.forEach(removeExtensionStorage);
  }

  // SaeTab 本体と同じく、拡張が NT.storage に保存した値（ext:<id>:）も消す
  function removeExtensionStorage(id) {
    const prefix = `ext:${id}:`;
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) localStorage.removeItem(key);
      }
    } catch (error) { console.error("[Extensions] 保存値を消せませんでした:", error); }
  }

  // SaeTab 本体が実行するのと同じ条件
  const isValid = (r) => Boolean(r && typeof r.id === "string" && r.id && typeof r.name === "string" && r.name.trim()
    && typeof r.code === "string" && r.code && (r.encoding === "plain" || r.encoding === "base122"));
  const isTheme = (r) => r.kind === "theme" || r.id.startsWith(THEME_PREFIX);

  // ===== 保存するコード =====
  // 読み込みコード（相対パスは SaeTab のページ基準で解決される）
  function loaderCode(relPath) {
    return `(() => {
  "use strict";
  const src = new URL(${JSON.stringify(relPath)}, location.href).href;
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => NT.log("読み込み完了:", src);
  script.onerror = () => console.error("[Ext:" + NT.name + "] 読み込み失敗:", src);
  document.head.appendChild(script);
})();`;
  }

  // color は色を選べるテーマ（SK Material）で選んだ色の key
  function themeCode(theme, color) {
    const css = theme.css.trim() + (theme.colorCss && color ? "\n" + theme.colorCss(color) : "");
    return `(() => {
  "use strict";
  const old = document.getElementById(${JSON.stringify(THEME_STYLE_ID)});
  if (old) old.remove();
  const style = document.createElement("style");
  style.id = ${JSON.stringify(THEME_STYLE_ID)};
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
  document.documentElement.dataset.saetabTheme = ${JSON.stringify(theme.id)};
${theme.js ? theme.js.trim() : ""}
})();`;
  }

  function customCode(css, js) {
    const parts = [];
    if (css) {
      parts.push(`(() => {
  const style = document.createElement("style");
  style.dataset.ext = NT.id;
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
})();`);
    }
    if (js) parts.push(js);
    return parts.join("\n");
  }

  const record = (fields) => {
    const now = Date.now();
    return { encoding: "plain", createdAt: now, updatedAt: now, ...fields };
  };

  // ===== 状態 =====
  let records = [];

  async function refresh() {
    try {
      records = (await getAll()).filter(isValid);
      await upgradeThemes();
    } catch (error) {
      console.error("[Extensions] 一覧を読めませんでした:", error);
      showSnackbar("拡張機能の一覧を読み込めませんでした。", false);
      records = [];
    }
    renderExtensions();
    renderInstalled();
    renderThemes();
  }

  // ===== 画面: 拡張機能 =====
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function iconBox(name, variant) {
    const box = el("span", "card-icon" + (variant ? " " + variant : ""));
    box.appendChild(el("span", "msr", name));
    return box;
  }

  function button(label, icon, variant, onClick) {
    const b = el("button", `btn ${variant} m3-state`);
    b.type = "button";
    if (icon) b.appendChild(el("span", "msr", icon));
    b.append(label);
    b.addEventListener("click", onClick);
    return b;
  }

  // SK が作った拡張機能・テーマの印（英語）
  function devBadge(item) {
    if (!item || item.developer !== "SK") return null;
    const a = el("a", "dev-badge");
    a.href = "https://sk-hub.jp/";
    a.target = "_blank";
    a.rel = "noopener";
    a.title = "SK Hub";
    const logo = el("img");
    logo.src = "https://sk-hub.jp/assets/sk-32.png";
    logo.alt = "";
    logo.width = 14;
    logo.height = 14;
    a.append(logo, "Developed by SK");
    return a;
  }
  const appendBadge = (parent, item) => { const b = devBadge(item); if (b) parent.appendChild(b); };

  function activeChip() {
    const chip = el("span", "chip");
    chip.append(el("span", "msr", "check_circle"), "使用中");
    return chip;
  }

  function renderExtensions() {
    const list = $("extensionCatalog");
    list.replaceChildren();
    EXTENSIONS.forEach((ext) => {
      const installed = records.some((r) => r.id === ext.id);
      const body = el("div", "card-body");
      const name = el("div", "card-name", ext.name);
      if (installed) name.appendChild(activeChip());
      appendBadge(name, ext);
      body.append(name, el("span", "card-desc", ext.description));
      if (ext.note) {
        const note = el("p", "card-note", ext.note + " ");
        if (ext.link) {
          const a = el("a", "", ext.link.label);
          a.href = ext.link.url; a.target = "_blank"; a.rel = "noopener";
          note.appendChild(a);
        }
        body.appendChild(note);
      }
      const actions = el("div", "ext-actions");
      if (installed && ext.settings) {
        const open = openSettings.has(ext.id);
        const toggle = button("設定", "tune", "btn-tonal", () => {
          if (openSettings.has(ext.id)) openSettings.delete(ext.id); else openSettings.add(ext.id);
          renderExtensions();
        });
        toggle.setAttribute("aria-expanded", String(open));
        actions.appendChild(toggle);
      }
      actions.appendChild(installed
        ? button("削除", "delete", "btn-danger", () => removeRecord(ext.id, ext.name))
        : button("追加", "add", "btn-filled", () => addCatalogExtension(ext)));
      const row = el("div", "ext-card");
      row.append(iconBox(ext.icon), body, actions);
      const card = el("article", "card ext-item");
      card.appendChild(row);
      if (installed && ext.settings && openSettings.has(ext.id)) card.appendChild(settingsPanel(ext));
      list.appendChild(card);
    });
  }

  // ===== 拡張機能の設定 =====
  // 値は localStorage の ext:<id>:settings に JSON で入れる（SaeTab 本体の NT.storage と同じ場所なので、削除すると一緒に消える）
  const openSettings = new Set();
  const settingsKey = (ext) => `ext:${ext.id}:settings`;
  function readSettings(ext) {
    const defaults = {};
    (ext.settings || []).forEach((f) => { if (f.key) defaults[f.key] = f.default; });
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(settingsKey(ext)) || "{}") }; }
    catch { return defaults; }
  }
  function saveSetting(ext, key, value) {
    const current = readSettings(ext);
    current[key] = value;
    try {
      localStorage.setItem(settingsKey(ext), JSON.stringify(current));
      showSnackbar("保存しました。SaeTab を開き直すと反映されます。");
    } catch (error) {
      console.error("[Extensions] 設定を保存できませんでした:", error);
      showSnackbar("設定を保存できませんでした。", false);
    }
  }

  function settingsPanel(ext) {
    const panel = el("div", "ext-settings");
    const values = readSettings(ext);
    ext.settings.forEach((f) => {
      if (f.type === "switch") {
        const item = el("label", "set-item");
        const text = el("span", "set-label");
        text.append(el("span", "set-title", f.label));
        if (f.sub) text.append(el("span", "set-sub", f.sub));
        const input = el("input", "m3-switch");
        input.type = "checkbox";
        input.setAttribute("role", "switch");
        input.checked = values[f.key] !== false;
        input.addEventListener("change", () => saveSetting(ext, f.key, input.checked));
        item.append(text, input);
        panel.appendChild(item);
      } else if (f.type === "choice") {
        const item = el("div", "set-item set-col");
        item.append(el("span", "set-title", f.label));
        const group = el("div", "set-choices");
        group.setAttribute("role", "radiogroup");
        group.setAttribute("aria-label", f.label);
        f.options.forEach((o) => {
          const b = el("button", "set-chip m3-state", o.label);
          b.type = "button";
          b.setAttribute("role", "radio");
          b.setAttribute("aria-checked", String(values[f.key] === o.value));
          b.addEventListener("click", () => {
            saveSetting(ext, f.key, o.value);
            group.querySelectorAll(".set-chip").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
          });
          group.appendChild(b);
        });
        item.appendChild(group);
        panel.appendChild(item);
      } else if (f.type === "link") {
        const a = el("a", "set-item set-link m3-state");
        a.href = f.url; a.target = "_blank"; a.rel = "noopener";
        const text = el("span", "set-label");
        text.append(el("span", "set-title", f.label));
        if (f.sub) text.append(el("span", "set-sub", f.sub));
        a.append(text, el("span", "msr", "open_in_new"));
        panel.appendChild(a);
      } else if (f.type === "shortcuts") {
        panel.appendChild(shortcutsEditor(ext, f, values[f.key]));
      }
    });
    return panel;
  }

  // 検索の近道の一覧（!キー・名前・URL）。%s のところに言葉が入る
  function shortcutsEditor(ext, field, value) {
    const wrap = el("div", "set-item set-col");
    const head = el("div", "set-label");
    head.append(el("span", "set-title", field.label), el("span", "set-sub", "URL の %s のところに、打った言葉が入ります。"));
    const list = el("div", "bang-list");
    let rows = (Array.isArray(value) ? value : field.default).map((x) => ({ ...x }));

    const save = () => {
      const clean = rows
        .map((r) => ({ key: r.key.trim().replace(/^!+/, "").replace(/\s+/g, ""), name: r.name.trim(), url: r.url.trim() }))
        .filter((r) => r.key && r.url);
      const bad = clean.find((r) => !/^https?:\/\//.test(r.url) || !r.url.includes("%s"));
      if (bad) { showSnackbar(`「!${bad.key}」の URL は https:// で始めて、%s を入れてください。`, false); return; }
      saveSetting(ext, field.key, clean);
    };

    const draw = () => {
      list.replaceChildren();
      rows.forEach((r, i) => {
        const row = el("div", "bang-row");
        const key = el("input", "bang-key");
        key.value = r.key; key.placeholder = "yt"; key.setAttribute("aria-label", "キー（! のあと）");
        const name = el("input", "bang-name");
        name.value = r.name; name.placeholder = "YouTube"; name.setAttribute("aria-label", "名前");
        const url = el("input", "bang-url");
        url.value = r.url; url.placeholder = "https://example.com/search?q=%s"; url.setAttribute("aria-label", "URL");
        url.spellcheck = false; key.spellcheck = false;
        [["key", key], ["name", name], ["url", url]].forEach(([prop, input]) => {
          input.addEventListener("input", () => { r[prop] = input.value; });
          input.addEventListener("change", save);
        });
        const del = el("button", "icon-btn m3-state");
        del.type = "button";
        del.setAttribute("aria-label", `!${r.key} を消す`);
        del.appendChild(el("span", "msr", "close"));
        del.addEventListener("click", () => { rows.splice(i, 1); draw(); save(); });
        const bang = el("span", "bang-mark", "!");
        row.append(bang, key, name, url, del);
        list.appendChild(row);
      });
    };
    draw();

    const actions = el("div", "set-actions");
    actions.append(
      button("近道を足す", "add", "btn-tonal", () => {
        rows.push({ key: "", name: "", url: "" });
        draw();
        const inputs = list.querySelectorAll(".bang-key");
        if (inputs.length) inputs[inputs.length - 1].focus();
      }),
      button("最初の状態に戻す", "restart_alt", "btn-outlined", () => {
        rows = field.default.map((x) => ({ ...x }));
        draw();
        save();
      })
    );
    wrap.append(head, list, actions);
    return wrap;
  }

  function displayName(r) {
    const known = EXTENSIONS.find((ext) => ext.id === r.id);
    return known ? known.name : r.name;
  }

  function renderInstalled() {
    const list = $("installedList");
    list.replaceChildren();
    const items = records.filter((r) => !isTheme(r)).sort((a, b) => displayName(a).localeCompare(displayName(b), "ja"));
    if (items.length === 0) {
      const empty = el("div", "empty");
      empty.append(el("span", "msr", "extension_off"), "入っている拡張機能はありません。");
      list.appendChild(empty);
      return;
    }
    items.forEach((r) => {
      const known = EXTENSIONS.find((ext) => ext.id === r.id);
      const card = el("article", "card ext-card");
      const body = el("div", "card-body");
      const nameRow = el("div", "card-name", displayName(r));
      appendBadge(nameRow, known);
      body.appendChild(nameRow);
      const when = r.updatedAt || r.createdAt;
      const from = known ? "おすすめから追加" : r.custom ? "自分で追加" : "ほかのページから追加";
      body.appendChild(el("span", "card-desc", when ? `${from}・${new Date(when).toLocaleDateString("ja-JP")}` : from));
      card.append(
        iconBox(known ? known.icon : "extension", known ? "" : "is-custom"),
        body,
        button("削除", "delete", "btn-danger", () => removeRecord(r.id, displayName(r)))
      );
      list.appendChild(card);
    });
  }

  async function addCatalogExtension(ext) {
    try {
      await write({ puts: [record({ id: ext.id, name: ext.recordName || ext.name, code: loaderCode(ext.loader), kind: "extension" })] });
      // 共有の許可がほかのサイトで要るもの（SK's Toolbox 連携）は、そのまま許可の画面へ
      if (ext.addUrl) { window.location.href = ext.addUrl; return; }
      showSnackbar(`「${ext.name}」を追加しました。`);
    } catch (error) {
      console.error("[Extensions] 追加できませんでした:", error);
      showSnackbar("追加できませんでした。", false);
    }
    refresh();
  }

  async function removeRecord(id, name) {
    const yes = await confirmDialog(`「${name}」を削除しますか？`, "この拡張機能が保存した設定も消えます。元に戻すことはできません。");
    if (!yes) return;
    try {
      await write({ deletes: [id] });
      showSnackbar(`「${name}」を削除しました。`);
    } catch (error) {
      console.error("[Extensions] 削除できませんでした:", error);
      showSnackbar("削除できませんでした。", false);
    }
    refresh();
  }

  $("customForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = $("customName").value.trim();
    const css = $("customCss").value.trim();
    const js = $("customJs").value.trim();
    if (!name) { $("customName").focus(); return; }
    if (!css && !js) { showSnackbar("CSS か JavaScript のどちらかを入力してください。", false); $("customCss").focus(); return; }
    const id = (crypto.randomUUID && crypto.randomUUID()) || `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      await write({ puts: [record({ id, name, code: customCode(css, js), kind: "extension", custom: true })] });
      event.target.reset();
      showSnackbar(`「${name}」を追加しました。`);
    } catch (error) {
      console.error("[Extensions] 追加できませんでした:", error);
      showSnackbar("追加できませんでした。", false);
    }
    refresh();
  });

  // ===== 画面: テーマ =====
  function preview(theme, color) {
    const box = el("div", "preview" + (theme ? "" : " is-none"));
    box.setAttribute("aria-hidden", "true");
    if (theme) {
      const p = { ...theme.preview, ...(theme.colorPreview && color ? theme.colorPreview(color) : {}) };
      const vars = { "--pv-wall": p.wall, "--pv-bar": p.bar, "--pv-ink": p.barInk, "--pv-btn": p.btn, "--pv-box": p.box,
        "--pv-radius": p.radius, "--pv-box-radius": p.boxRadius, "--pv-border": p.border, "--pv-shadow": p.shadow || "none" };
      Object.entries(vars).forEach(([k, v]) => box.style.setProperty(k, v));
    }
    const boxes = el("div", "pv-boxes");
    for (let i = 0; i < 5; i++) boxes.appendChild(el("span", "pv-box"));
    const bar = el("div", "pv-bar");
    bar.append(el("span", "pv-text"), el("span", "pv-btn"));
    box.append(boxes, el("div", "pv-clock", "10:16"), bar);
    return box;
  }

  // 色を選べるテーマで、まだ使っていないときに選んだ色（「このテーマを使う」でこの色になる）
  const pendingColor = {};
  const colorName = (theme, key) => {
    const c = theme.colors && theme.colors.find((x) => x.key === key);
    return c ? c.name : "";
  };
  const recordName = (theme, color) => {
    const c = colorName(theme, color);
    return `テーマ: ${theme.name}` + (c && color !== "default" ? `（${c}）` : "");
  };

  function swatches(theme, selected, isActive) {
    const wrap = el("div", "swatch-area");
    const row = el("div", "swatches");
    row.setAttribute("role", "radiogroup");
    row.setAttribute("aria-label", `${theme.name} の色`);
    const current = theme.colors.find((c) => c.key === selected) || theme.colors[0];
    const label = el("p", "swatch-name", `${current.name}・${current.note}`);
    theme.colors.forEach((c) => {
      const b = el("button", "swatch m3-state");
      b.type = "button";
      b.style.setProperty("--sw", c.sw);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(c.key === current.key));
      b.setAttribute("aria-label", `${c.name}（${c.note}）`);
      b.title = c.name;
      b.appendChild(el("span", "msr", "check"));
      b.addEventListener("click", () => {
        if (c.key === current.key) return;
        if (isActive) { applyTheme(theme, c.key); return; }
        pendingColor[theme.id] = c.key;
        renderThemes();
      });
      row.appendChild(b);
    });
    wrap.append(row, label);
    return wrap;
  }

  function renderThemes() {
    const grid = $("themeGrid");
    grid.replaceChildren();
    const active = records.find(isTheme);
    const activeId = active ? (active.themeId || active.id.slice(THEME_PREFIX.length)) : null;

    const options = [{ id: null, name: "標準", description: "テーマを使わず、SaeTab そのままの見た目にします。" }, ...THEMES];
    options.forEach((theme) => {
      const isActive = theme.id === activeId || (!theme.id && !active);
      const card = el("article", "theme-card" + (isActive ? " is-active" : ""));
      const body = el("div", "theme-body");
      const name = el("div", "card-name", theme.name);
      if (isActive) name.appendChild(activeChip());
      appendBadge(name, theme);
      body.append(name, el("span", "card-desc", theme.description));
      const color = theme.colors ? (isActive ? active.themeColor || "default" : pendingColor[theme.id] || "default") : null;
      if (theme.colors) body.appendChild(swatches(theme, color, isActive));
      const action = isActive
        ? button("使用中", "check", "btn-tonal", () => {})
        : button(theme.id ? "このテーマを使う" : "標準に戻す", theme.id ? "palette" : "restart_alt", "btn-outlined", () => applyTheme(theme.id ? theme : null, color));
      if (isActive) action.disabled = true;
      body.appendChild(action);
      card.append(preview(theme.id ? theme : null, color), body);
      grid.appendChild(card);
    });

    // 一覧にない（古い・ほかのページから入れた）テーマが入っているとき
    if (active && !THEMES.some((t) => t.id === activeId)) {
      const card = el("article", "theme-card is-active");
      const body = el("div", "theme-body");
      const name = el("div", "card-name", active.name);
      name.appendChild(activeChip());
      body.append(name, el("span", "card-desc", "この一覧にないテーマです。"));
      card.append(preview(null), body);
      grid.prepend(card);
    }
  }

  // 入っているテーマのコードが古ければ、一覧の最新版に置きかえる（テーマを直したときに、選び直さなくても反映されるように）
  async function upgradeThemes() {
    const puts = [];
    records.filter(isTheme).forEach((r) => {
      const theme = THEMES.find((t) => THEME_PREFIX + t.id === r.id);
      if (!theme) return;
      const code = themeCode(theme, r.themeColor);
      const name = recordName(theme, r.themeColor);
      if (r.code !== code || r.name !== name) puts.push({ ...r, code, name, updatedAt: Date.now() });
    });
    if (puts.length === 0) return;
    await write({ puts });
    records = records.map((r) => puts.find((p) => p.id === r.id) || r);
    console.info("[Extensions] テーマを最新版にしました:", puts.map((p) => p.id));
  }

  async function applyTheme(theme, color) {
    const deletes = records.filter(isTheme).map((r) => r.id);
    const themeColor = theme && theme.colors ? color || "default" : undefined;
    const puts = theme
      ? [record({ id: THEME_PREFIX + theme.id, name: recordName(theme, themeColor), code: themeCode(theme, themeColor), kind: "theme", themeId: theme.id, ...(themeColor ? { themeColor } : {}) })]
      : [];
    try {
      await write({ puts, deletes });
      if (theme) delete pendingColor[theme.id];
      const shown = themeColor ? `${theme.name}・${colorName(theme, themeColor)}` : theme && theme.name;
      showSnackbar(theme ? `テーマを「${shown}」にしました。` : "標準の見た目に戻しました。");
    } catch (error) {
      console.error("[Extensions] テーマを変えられませんでした:", error);
      showSnackbar("テーマを変えられませんでした。", false);
    }
    refresh();
  }

  // ===== タブ =====
  function selectTab(name, focus) {
    document.querySelectorAll(".segment").forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    $("panel-extensions").hidden = name !== "extensions";
    $("panel-themes").hidden = name !== "themes";
    const hash = name === "themes" ? "#themes" : "";
    if (location.hash !== hash) history.replaceState(null, "", location.pathname + location.search + hash);
  }
  document.querySelectorAll(".segment").forEach((tab) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") selectTab(tab.dataset.tab === "themes" ? "extensions" : "themes", true);
    });
  });
  selectTab(location.hash === "#themes" ? "themes" : "extensions");

  // ===== 確認ダイアログ =====
  function confirmDialog(title, text) {
    const scrim = $("confirmDialog");
    $("confirmTitle").textContent = title;
    $("confirmText").textContent = text;
    scrim.hidden = false;
    const cancel = scrim.querySelector('[data-answer="no"]');
    cancel.focus();
    return new Promise((resolve) => {
      const done = (answer) => {
        scrim.hidden = true;
        scrim.removeEventListener("click", onClick);
        document.removeEventListener("keydown", onKey);
        resolve(answer);
      };
      const onClick = (e) => {
        if (e.target === scrim) return done(false);
        const b = e.target.closest("[data-answer]");
        if (b) done(b.dataset.answer === "yes");
      };
      const onKey = (e) => { if (e.key === "Escape") done(false); };
      scrim.addEventListener("click", onClick);
      document.addEventListener("keydown", onKey);
    });
  }

  // ===== スナックバー =====
  let snackTimer = null;
  function showSnackbar(text, withAction = true) {
    const bar = $("snackbar");
    $("snackbarText").textContent = text;
    bar.querySelector(".snackbar-action").hidden = !withAction;
    bar.hidden = true;
    void bar.offsetWidth; // アニメーションをやり直す
    bar.hidden = false;
    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => { bar.hidden = true; }, 5000);
  }

  // ===== 波紋 =====
  document.addEventListener("pointerdown", (e) => {
    const target = e.target.closest(".m3-state");
    if (!target || target.disabled) return;
    const rect = target.getBoundingClientRect();
    const size = Math.hypot(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  // ほかのタブで SaeTab から削除されたときなどに合わせる
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });

  refresh();
})();
