/* SaeTab 7 の拡張機能とテーマの一覧
   ・拡張機能（kind: "extension"）… SaeTab に機能を足すもの。いくつでも同時に使える
   ・テーマ（kind: "theme"）… SaeTab の見た目を変えるもの。同時に使えるのは1つだけ
   テーマは SaeTab のすべての部品に効かせる:
     ホーム（.search / .searchbtn / .search-btn / .history / #clock）・アプリ一覧（.shortcut / .main-shortcut-*）
     検索候補（.app-search-dropdown / #mainSuggestionDropdown）
     ダイアログ（.newtab-dialog* … 同期と管理・カスタマイズ・履歴）と中の部品（.newtab-settings-* / .newtab-shortcut-*）
   css は <style> に入れる。js があれば、テーマを読み込むときに一緒に実行する */
(() => {
  "use strict";

  const EXTENSIONS = [
    {
      id: "saetab-bridge",
      // saetab-bridge.html が保存するときと同じ名前・同じ読み込みコードにする（どちらから入れても同じ扱いになる）
      recordName: "saetab-bridge",
      name: "SK's Toolbox 連携",
      icon: "sync_alt",
      description: "SK's Toolbox の今日の時間割と最新のメモを、SaeTab の時計の上に表示します。",
      note: "「追加」を押すと SK's Toolbox が開きます。「共有して設定」を押すと表示されるようになります。",
      // 追加したあと、SK's Toolbox の「新しいタブに設定」の確認まで飛ばす（共有の許可は SK's Toolbox 側でする）
      addUrl: "https://sk-hub.jp/toolbox/?saetab=connect",
      loader: "./extension/saetab-bridge.js",
      settings: [
        { type: "switch", key: "timetable", label: "時間割", sub: "今日の時間割（放課後は明日の時間割）", default: true },
        { type: "switch", key: "memo", label: "最新のメモ", sub: "SK's Toolbox の Memo の新しい順", default: true },
        { type: "switch", key: "apps", label: "アプリのアイコン", sub: "Toolbox・Todo・Calc・Countdown・Roulette をすぐ開けるように", default: true },
        { type: "switch", key: "clockLink", label: "時計を押して SK Clock を開く", sub: "オフにすると、時計の位置も元のままになります", default: true },
        { type: "link", label: "共有をやめる・もう一度許可する", sub: "SK's Toolbox のホームの Saetab ボタンから", url: "https://sk-hub.jp/toolbox/" }
      ]
    },
    {
      id: "search-shortcuts",
      name: "検索の近道",
      icon: "bolt",
      description: "検索ボックスに「!yt 猫」と打つと、YouTube で「猫」をさがします。「!」だけ打つと、使える近道が出ます。",
      loader: "./extension/search-shortcuts.js",
      settings: [
        {
          type: "shortcuts", key: "shortcuts", label: "近道",
          // extension/search-shortcuts.js の DEFAULTS と同じ
          default: [
            { key: "g", name: "Google", url: "https://www.google.com/search?q=%s" },
            { key: "yt", name: "YouTube", url: "https://www.youtube.com/results?search_query=%s" },
            { key: "w", name: "Wikipedia", url: "https://ja.wikipedia.org/w/index.php?search=%s" },
            { key: "a", name: "Amazon", url: "https://www.amazon.co.jp/s?k=%s" },
            { key: "m", name: "Google マップ", url: "https://www.google.com/maps/search/%s" },
            { key: "t", name: "Google 翻訳", url: "https://translate.google.com/?sl=auto&tl=ja&text=%s" },
            { key: "x", name: "X", url: "https://x.com/search?q=%s" },
            { key: "gh", name: "GitHub", url: "https://github.com/search?q=%s" },
            { key: "i", name: "Google 画像", url: "https://www.google.com/search?tbm=isch&q=%s" }
          ]
        }
      ]
    },
    {
      id: "today-anniversary",
      name: "今日は何の日",
      icon: "event",
      description: "今日の記念日やできごとを、検索ボックスの中に1つずつ表示します。何か打ちはじめると消えます。",
      note: "日本語版 Wikipedia の日付のページから、1日1回読み込みます。",
      loader: "./extension/today.js",
      settings: [
        {
          type: "choice", key: "kind", label: "出す内容", default: "anniversary",
          options: [
            { value: "anniversary", label: "記念日" },
            { value: "event", label: "できごと" },
            { value: "both", label: "両方" }
          ]
        }
      ]
    }
  ];


  // ---- SK's Brand のテーマカラー（SK's Toolbox の /toolbox/shared/settings.js と同じ配色）----
  // [ライト, ダーク] の順に ROLES の色を 6 桁ずつつなげたもの
  const SK_ROLES = ["primary", "on-primary", "primary-container", "on-primary-container", "secondary-container", "on-secondary-container", "tertiary", "tertiary-container", "on-tertiary-container", "error", "error-container", "on-error-container", "surface", "on-surface", "on-surface-variant", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest", "outline", "outline-variant", "inverse-surface", "inverse-on-surface", "inverse-primary"];
  const SK_PALETTES = {
    blue: ["004ac6ffffff2563ebeeefffacbfff394c84943700bc4800ffede6ba1a1affdad693000afaf8ff191b23434655f3f3feededf9e7e7f3e1e2ed737686c3c6d72e3039f0f0fbb4c5ff", "b4c5ff002a782563ebeeefff33467ea4b6f5ffb596bc4800ffede6ffb4ab93000affdad611131be1e2edc3c6d7191b231d1f27282a3232343d8d90a0434655e1e2ed2e30390053db"],
    sakura: ["b7005effffffdb2777fffdfffc86ac761b40006c1c008826fafff4ba1a1affdad693000afff8f826171c594047fff0f2ffe8edfde1e7f7dce18d6f77e1bec63d2c30ffecefffb1c7", "ffb1c7650031db2777fffdff83254aff9bb96ede70008826fafff4ffb4ab93000affdad61d0f13f7dce1e1bec626171c2b1b2036262a413035a88990594047f7dce13d2c30ba0060"],
    matcha: ["006b2cffffff00873af7fff2baecbc406c46a72d51c74668fffbffba1a1affdad693000af4fcf0171d163e4a3deff6eae9f0e5e3eadfdde5d96e7b6cbdcaba2b322becf3e762df7d", "62df7d0039141ca64d002e0f23502c90c193ffb2bfec628455001fffb4ab93000affdad60e150fdde5d9bdcaba171d161b211a252c2430372f8794853e4a3ddde5d92b322b006e2d"],
    mikan: ["a33900ffffffcc4900fffbffff9971772f0f005da80076d2fdfcffba1a1affdad693000afff8f62618135a4138fff1ecffe9e2fee2d9f8ddd48e7166e2bfb23d2d27ffede7ffb599", "ffb5995a1c00f660184011007c3313ffa17ca4c9ff2192fd002141ffb4ab93000affdad61d100bf8ddd4e2bfb22618132b1c1736262142312ba98a7e5a4138f8ddd43d2d27a73a00"],
    fuji: ["630ed4ffffff7c3aedede0ffc4a7ff5237877d3d00a15100ffe0cdba1a1affdad693000afef7ff1d1a244a4455f9f1fff3ebfaede5f4e8dfee7b7487ccc3d8332f39f6eefcd2bbff", "d2bbff3f008e7c3aedede0ff523787c3a6ffffb784a15100ffe0cdffb4ab93000affdad615121be8dfeeccc3d81d1a24221e282c283337333e958da14a4455e8dfee332f39732ee4"],
    sora: ["00647cffffff007f9dfafdffc3e8f8466977894e00a86516fffbffba1a1affdad693000af6fafd171c1e3e484df0f4f7eaeef1e5e9ebdfe3e66e797ebdc8ce2c3133edf1f46cd3f7", "6cd3f7003543269dbe00212b2a4e5a9abecdffb873c98031301800ffb4ab93000affdad60f1416dfe3e6bdc8ce171c1e1b2022262b2d3135388792983e484ddfe3e62c3133006780"],
    sumi: ["1d2b3effffff3341559eadc5dee2ee5f656e38270a503d1ec3a881ba1a1affdad693000afbf9fa1b1b1d44474cf5f3f5efedefeae7e9e4e2e475777dc5c6cd303032f2f0f2b9c7e0", "b9c7e02331443341559eadc5424750b0b5c0dfc299503d1ec3a881ffb4ab93000affdad6131315e4e2e4c5c6cd1b1b1d1f1f212a2a2b3435368e919744474ce4e2e4303032515f74"]
  };
  // 名前と見本の色は SK's Brand（https://sk-hub.jp/brand/）と同じ。"default" は SK's Toolbox のホームと同じ色
  const SK_COLORS = [
    { key: "default", name: "標準", note: "SK's Toolbox と同じ色", sw: "#415f91" },
    { key: "blue", name: "SK's Blue", note: "いつもの青", sw: "#2563eb" },
    { key: "sakura", name: "SK's Sakura", note: "さくら", sw: "#db2777" },
    { key: "matcha", name: "SK's Matcha", note: "抹茶", sw: "#16a34a" },
    { key: "mikan", name: "SK's Mikan", note: "みかん", sw: "#ea580c" },
    { key: "fuji", name: "SK's Fuji", note: "藤", sw: "#7c3aed" },
    { key: "sora", name: "SK's Sora", note: "空", sw: "#0891b2" },
    { key: "sumi", name: "SK's Sumi", note: "墨", sw: "#334155" }
  ];
  const skRole = (key, dark, role) => "#" + SK_PALETTES[key][dark ? 1 : 0].substr(SK_ROLES.indexOf(role) * 6, 6);
  const skPaletteVars = (key, dark) => SK_ROLES.map((r, i) => `--md-${r}:#${SK_PALETTES[key][dark ? 1 : 0].substr(i * 6, 6)}`).join(";");
  // テーマの CSS のあとに足して、--md-* をその色で上書きする
  const skColorCss = (key) => SK_PALETTES[key]
    ? `:root:root{${skPaletteVars(key, false)}}\n@media (prefers-color-scheme:dark){:root:root{${skPaletteVars(key, true)}}}`
    : "";
  // 拡張機能ページの見本の色
  const skColorPreview = (key) => SK_PALETTES[key] ? {
    wall: `radial-gradient(circle at 20% 10%,${skRole(key, false, "primary")}59,transparent 55%),radial-gradient(circle at 85% 40%,${skRole(key, false, "tertiary")}38,transparent 55%),${skRole(key, false, "surface")}`,
    bar: skRole(key, false, "surface-container-high"), btn: skRole(key, false, "primary"),
    box: `color-mix(in srgb,${skRole(key, false, "primary")} 9%,${skRole(key, false, "surface-container-low")})`
  } : {};

  // ダイアログの中のボタン（どのテーマでも同じ組み合わせで使う）
  const BTN = ".newtab-settings-action,.newtab-settings-choice,.newtab-settings-link";

  const THEMES = [
    /* ---------- Ultra Glass（Liquid Glass 風） ---------- */
    {
      id: "ultra-glass",
      name: "Ultra Glass",
      description: "Liquid Glass のような、向こうが曲がって見える透明なガラス。",
      preview: { wall: "linear-gradient(135deg,#5b7fd6,#b78ad8 55%,#f2a7b5)", bar: "linear-gradient(135deg,rgba(255,255,255,.4),rgba(255,255,255,.08) 50%,rgba(255,255,255,.22))", barInk: "#fff", btn: "rgba(255,255,255,.4)", box: "linear-gradient(135deg,rgba(255,255,255,.42),rgba(255,255,255,.1))", radius: "99px", boxRadius: "14px", border: "rgba(255,255,255,.7)", shadow: "0 6px 16px rgba(0,0,0,.18)" },
      // Chrome 系だけ、SVG フィルターで背景を曲げる（Safari・Firefox は backdrop-filter の url() を使えないので、ふつうのガラスになる）
      js: `
const NS = "http://www.w3.org/2000/svg";
if (!document.getElementById("saetab-lg-svg")) {
  const svg = document.createElementNS(NS, "svg");
  svg.id = "saetab-lg-svg";
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  svg.innerHTML = '<filter id="saetab-lg" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'
    + '<feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="11" result="noise"/>'
    + '<feGaussianBlur in="noise" stdDeviation="2.5" result="map"/>'
    + '<feDisplacementMap in="SourceGraphic" in2="map" scale="46" xChannelSelector="R" yChannelSelector="G" result="bent"/>'
    + '<feGaussianBlur in="bent" stdDeviation="0.6"/>'
    + '</filter>';
  document.body.appendChild(svg);
}
const brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
if (brands.some((b) => /Chromium/.test(b.brand))) document.documentElement.classList.add("saetab-lg-refract");
`,
      css: `
:root{--lg-tint:rgba(255,255,255,.08);--lg-sheen:linear-gradient(135deg,rgba(255,255,255,.26),rgba(255,255,255,.04) 42%,rgba(255,255,255,0) 60%,rgba(255,255,255,.12));--lg-rim:inset 1.5px 1.5px 0 rgba(255,255,255,.75),inset -1px -1px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(255,255,255,.18),inset 0 0 18px rgba(255,255,255,.12);--lg-drop:0 10px 30px rgba(0,0,0,.18),0 2px 6px rgba(0,0,0,.1);--lg-blur:blur(3px) saturate(1.9) brightness(1.08);--lg-blur-strong:blur(22px) saturate(1.9) brightness(1.04)}
.search,.search-btn,.history,.main-shortcut-box,.searchbtn{background:var(--lg-sheen),var(--lg-tint)!important;-webkit-backdrop-filter:var(--lg-blur)!important;backdrop-filter:var(--lg-blur)!important;box-shadow:var(--lg-rim),var(--lg-drop)!important}
html.saetab-lg-refract .search,html.saetab-lg-refract .search-btn,html.saetab-lg-refract .history,html.saetab-lg-refract .main-shortcut-box{backdrop-filter:url(#saetab-lg) blur(1.5px) saturate(1.9) brightness(1.08)!important}
.searchbtn{background:linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.18))!important}
#searchBox,.search-btn,.history,#clock{color:#fff!important}
#searchBox::placeholder{color:rgba(255,255,255,.78)!important}
#searchBox,.search-btn,.history{text-shadow:0 1px 3px rgba(0,0,0,.35)}
#clock{text-shadow:0 2px 16px rgba(0,0,0,.25)}
.search-btn svg path,.searchbtn svg path{fill:#fff!important}
.search-btn{transition:transform .5s cubic-bezier(.2,1.6,.4,1)!important}
.search-btn:hover{transform:translate(0,-2px) scale(1.07)!important}
.search-btn:active{transform:scale(.96)!important}
.shortcut{background:rgba(255,255,255,.06)!important;-webkit-backdrop-filter:blur(40px) saturate(1.8);backdrop-filter:blur(40px) saturate(1.8)}
.main-shortcut-title,.main-shortcut-name{color:#fff!important;text-shadow:0 1px 8px rgba(0,0,0,.4)}
.app-search-dropdown,#mainSuggestionDropdown{background:var(--lg-sheen),rgba(255,255,255,.12)!important;-webkit-backdrop-filter:var(--lg-blur-strong)!important;backdrop-filter:var(--lg-blur-strong)!important;box-shadow:var(--lg-rim),var(--lg-drop)!important}
.app-search-item-name{color:#fff!important}
.app-search-item:hover{background:rgba(255,255,255,.16)!important}
.newtab-dialog{background:rgba(0,0,0,.12)!important}
.newtab-dialog-content{background:var(--lg-sheen),rgba(255,255,255,.3)!important;color:#111!important;-webkit-backdrop-filter:var(--lg-blur-strong)!important;backdrop-filter:var(--lg-blur-strong)!important;box-shadow:var(--lg-rim),0 24px 80px rgba(0,0,0,.3)!important}
.newtab-dialog-close,${BTN}{background:rgba(255,255,255,.32)!important;color:inherit!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.8),inset 0 0 0 1px rgba(255,255,255,.3)!important;border-radius:99px!important}
.newtab-settings-action:hover,.newtab-settings-choice:hover,.newtab-settings-link:hover,.newtab-dialog-close:hover{background:rgba(255,255,255,.5)!important}
.newtab-settings-choice[aria-pressed="true"]{background:rgba(255,255,255,.92)!important;color:#0a64ff!important;font-weight:600}
.newtab-settings-danger{background:rgba(255,59,48,.78)!important;color:#fff!important;border-radius:99px!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.45)!important}
.newtab-settings-row>input{background:rgba(255,255,255,.35)!important;border:0!important;border-radius:99px!important;box-shadow:inset 0 1px 3px rgba(0,0,0,.12),inset 0 0 0 1px rgba(255,255,255,.4)!important}
.newtab-settings-hint,.newtab-shortcut-entry-url,.dialog-empty{color:rgba(0,0,0,.6)!important}
.newtab-shortcut-entry{background:rgba(255,255,255,.28)!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.6)}
.newtab-dialog-content>ul>li{border-bottom-color:rgba(255,255,255,.35)!important}
@media (prefers-color-scheme:dark){
.newtab-dialog-content{background:var(--lg-sheen),rgba(40,40,46,.38)!important;color:#fff!important}
.newtab-dialog-close,${BTN}{background:rgba(255,255,255,.12)!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(255,255,255,.12)!important}
.newtab-settings-action:hover,.newtab-settings-choice:hover,.newtab-settings-link:hover,.newtab-dialog-close:hover{background:rgba(255,255,255,.22)!important}
.newtab-settings-choice[aria-pressed="true"]{background:rgba(255,255,255,.9)!important;color:#0a64ff!important}
.newtab-settings-row>input{background:rgba(0,0,0,.25)!important}
.newtab-settings-hint,.newtab-shortcut-entry-url,.dialog-empty{color:rgba(255,255,255,.65)!important}
.newtab-shortcut-entry{background:rgba(255,255,255,.08)!important;box-shadow:inset 1px 1px 0 rgba(255,255,255,.2)}
.newtab-dialog-content>ul>li{border-bottom-color:rgba(255,255,255,.12)!important}
}
@media (prefers-reduced-transparency:reduce){
.search,.search-btn,.history,.main-shortcut-box,.newtab-dialog-content,.app-search-dropdown,#mainSuggestionDropdown{background:rgba(40,40,46,.85)!important;backdrop-filter:none!important}
}
`
    },

    /* ---------- Material 3（SK Hub のアプリと同じ M3） ----------
       色は SK's Toolbox（/toolbox/home.css）と同じ --md-*。文字は M PLUS 1、角は 28〜32px、
       面は primary を少し混ぜた色、背景に淡い光、押したときはばねのように動く */
    {
      id: "material3",
      name: "SK Material",
      description: "SK Hub のアプリと同じマテリアル。M PLUS 1 の文字と、やわらかい角と色。色は SK's Brand から選べます。",
      colors: SK_COLORS,
      colorCss: skColorCss,
      colorPreview: skColorPreview,
      preview: { wall: "radial-gradient(circle at 20% 10%,rgba(65,95,145,.35),transparent 55%),radial-gradient(circle at 85% 40%,rgba(229,121,63,.22),transparent 55%),#f9f9ff", bar: "#e7e8ee", barInk: "#191c20", btn: "#415f91", box: "color-mix(in srgb,#415f91 9%,#f3f3fa)", radius: "28px", boxRadius: "12px", border: "transparent", shadow: "0 4px 10px -6px rgba(0,0,0,.35)" },
      // SK の fonts.js と同じく、EU などのタイムゾーンでは文字のフォントを読み込まない（端末の文字で表示）
      js: `
let zone = "";
try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
const strict = /^(Europe\\/|Atlantic\\/(Canary|Madeira|Azores|Reykjavik|Faroe)|Africa\\/Ceuta|Asia\\/(Nicosia|Famagusta)|Arctic\\/)/.test(zone);
if (!strict && !document.getElementById("saetab-m3-font")) {
  const link = document.createElement("link");
  link.id = "saetab-m3-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@300;400;500;700&display=swap";
  document.head.appendChild(link);
}
`,
      css: `
:root{--md-primary:#415f91;--md-on-primary:#fff;--md-primary-container:#d6e3ff;--md-on-primary-container:#284777;--md-secondary-container:#dae2f9;--md-on-secondary-container:#3e4759;--md-error:#ba1a1a;--md-on-error:#fff;--md-surface:#f9f9ff;--md-on-surface:#191c20;--md-on-surface-variant:#44474e;--md-surface-container-low:#f3f3fa;--md-surface-container:#ededf4;--md-surface-container-high:#e7e8ee;--md-surface-container-highest:#e2e2e9;--md-outline:#74777f;--md-outline-variant:#c4c6d0;--md-font:"M PLUS 1","Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic UI",Meiryo,system-ui,sans-serif;--md-emphasized:cubic-bezier(.2,0,0,1);--m3-spring:cubic-bezier(.34,1.4,.64,1);--m3-elev:0 4px 8px 3px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.3)}
@media (prefers-color-scheme:dark){:root{--md-primary:#aac7ff;--md-on-primary:#0a305f;--md-primary-container:#284777;--md-on-primary-container:#d6e3ff;--md-secondary-container:#3e4759;--md-on-secondary-container:#dae2f9;--md-error:#ffb4ab;--md-on-error:#690005;--md-surface:#111318;--md-on-surface:#e2e2e9;--md-on-surface-variant:#c4c6d0;--md-surface-container-low:#191c20;--md-surface-container:#1d2024;--md-surface-container-high:#282a2f;--md-surface-container-highest:#333539;--md-outline:#8e9099;--md-outline-variant:#44474e}}
body,#searchBox,.search-btn,.history,.newtab-dialog-content,.newtab-dialog-content button,.newtab-dialog-content input{font-family:var(--md-font)!important;-webkit-font-smoothing:antialiased}
#clock{font-family:var(--md-font)!important;font-weight:500!important;letter-spacing:-.01em}

/* ホーム */
.search{background:var(--md-surface-container-high)!important;border-radius:28px!important;corner-shape:round!important;padding:6px!important;box-shadow:var(--m3-elev)!important}
#searchBox{color:var(--md-on-surface)!important;font-size:20px!important}
#searchBox::placeholder{color:var(--md-on-surface-variant)!important}
.searchbtn{background:var(--md-primary)!important;border-radius:22px!important;corner-shape:round!important;transition:border-radius .3s var(--md-emphasized),transform .18s var(--m3-spring)!important}
.searchbtn:active{border-radius:12px!important;transform:scale(.96)}
.searchbtn svg path{fill:var(--md-on-primary)!important}
.search-btn{background:var(--md-secondary-container)!important;color:var(--md-on-secondary-container)!important;border-radius:20px!important;corner-shape:round!important;font-weight:500!important;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .3s var(--m3-spring),border-radius .3s var(--md-emphasized)!important}
.search-btn:hover{transform:translateY(-3px)!important}
.search-btn:active{transform:scale(.97)!important;border-radius:12px!important}
.search-btn svg path{fill:var(--md-on-secondary-container)!important}
.history{height:auto!important;padding:6px 14px!important;background:var(--md-surface-container-low)!important;color:var(--md-on-surface)!important;border-radius:8px!important;box-shadow:inset 0 0 0 1px var(--md-outline-variant);-webkit-backdrop-filter:none!important;backdrop-filter:none!important;font-weight:500}

/* アプリ一覧（SK's Toolbox のアプリ一覧と同じ: 面に primary を混ぜた色、ゆっくり漂う光） */
.shortcut{background:color-mix(in srgb,var(--md-surface) 92%,transparent)!important;-webkit-backdrop-filter:blur(24px)!important;backdrop-filter:blur(24px)!important;border-radius:32px 32px 0 0;isolation:isolate;overflow:hidden}
.shortcut::before,.shortcut::after{content:"";position:absolute;z-index:-1;pointer-events:none;border-radius:50%;filter:blur(60px)}
.shortcut::before{top:-60px;left:-10%;width:60%;height:420px;background:radial-gradient(circle,color-mix(in srgb,var(--md-primary) 22%,transparent),transparent 70%);animation:saetab-m3-drift 26s ease-in-out infinite alternate}
.shortcut::after{top:160px;right:-8%;width:50%;height:380px;background:radial-gradient(circle,color-mix(in srgb,var(--md-tertiary,#e5793f) 16%,transparent),transparent 70%);animation:saetab-m3-drift 32s ease-in-out -8s infinite alternate-reverse}
@keyframes saetab-m3-drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(6%,4%) scale(1.08);opacity:.8}100%{transform:translate(-4%,8%) scale(.96)}}
.main-shortcut-category{max-width:1120px;margin:0 auto 12px!important;padding:12px 12px 18px;border-radius:32px;background:color-mix(in srgb,var(--md-primary) 6%,var(--md-surface-container-low))}
.main-shortcut-title{color:var(--md-on-surface)!important;font-family:var(--md-font)!important;font-size:18px!important;font-weight:700!important;margin-top:4px!important}
.main-shortcut-box{background-color:color-mix(in srgb,var(--md-primary) 9%,var(--md-surface-container))!important;border-radius:18px!important;corner-shape:round!important;box-shadow:0 6px 16px -8px rgba(0,0,0,.35)}
.main-shortcut-name{color:var(--md-on-surface-variant)!important;font-family:var(--md-font)!important;font-weight:500}

/* 検索候補 */
.app-search-dropdown,#mainSuggestionDropdown{background:var(--md-surface-container)!important;border-radius:28px!important;corner-shape:round!important;box-shadow:var(--m3-elev)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
.app-search-item{border-radius:20px!important;corner-shape:round!important}
.app-search-item:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)!important}
.app-search-item-name{color:var(--md-on-surface)!important;font-family:var(--md-font)}

/* ダイアログ（SK の設定画面・確認ダイアログと同じ形） */
.newtab-dialog{background:rgba(0,0,0,.32)!important}
.newtab-dialog-content{width:min(560px,100%)!important;background:var(--md-surface-container-high)!important;color:var(--md-on-surface)!important;border-radius:28px!important;corner-shape:round!important;padding:8px 0 24px!important;box-shadow:var(--m3-elev)!important}
.newtab-dialog.is-open .newtab-dialog-content{transition:transform .35s var(--md-emphasized),opacity .2s linear!important}
.newtab-dialog-header{min-height:64px;padding:0 8px 0 24px;margin-bottom:0!important}
.newtab-dialog-title{font-size:24px!important;font-weight:400!important;line-height:32px}
.newtab-dialog-close{width:48px!important;height:48px!important;background:transparent!important;color:var(--md-on-surface-variant)!important;border-radius:50%!important}
.newtab-dialog-close:hover{background:color-mix(in srgb,var(--md-on-surface-variant) 8%,transparent)!important}
.newtab-dialog-content>*:not(.newtab-dialog-header){margin-left:24px;margin-right:24px}
.newtab-settings-section{margin-top:0!important;padding:12px 0;gap:10px!important}
.newtab-settings-section+.newtab-settings-section{border-top:1px solid var(--md-outline-variant)}
.newtab-settings-section-title{color:var(--md-primary)!important;font-size:14px!important;font-weight:500!important;line-height:20px}
.newtab-settings-action,.newtab-settings-choice,.newtab-settings-link{min-height:40px!important;padding:0 20px!important;background:var(--md-secondary-container)!important;color:var(--md-on-secondary-container)!important;border-radius:20px!important;font-weight:500!important;letter-spacing:.01em;transition:transform .18s var(--m3-spring),border-radius .3s var(--md-emphasized),background-color .2s linear!important}
.newtab-settings-action:hover,.newtab-settings-choice:hover,.newtab-settings-link:hover{background:color-mix(in srgb,var(--md-on-secondary-container) 8%,var(--md-secondary-container))!important}
.newtab-settings-action:active,.newtab-settings-choice:active,.newtab-settings-link:active,.newtab-settings-danger:active{border-radius:12px!important;transform:scale(.97)!important}
.newtab-settings-choice[aria-pressed="true"]{background:var(--md-primary)!important;color:var(--md-on-primary)!important}
.newtab-settings-danger{min-height:40px!important;padding:0 20px!important;background:transparent!important;color:var(--md-error)!important;border-radius:20px!important;font-weight:500!important;box-shadow:inset 0 0 0 1px var(--md-outline-variant)!important;transition:transform .18s var(--m3-spring),border-radius .3s var(--md-emphasized)!important}
.newtab-settings-danger:hover{background:color-mix(in srgb,var(--md-error) 8%,transparent)!important}
.newtab-settings-row>input{height:48px!important;background:var(--md-surface-container-highest)!important;color:var(--md-on-surface)!important;border:0!important;border-radius:4px 4px 0 0!important;box-shadow:inset 0 -1px 0 var(--md-on-surface-variant)!important;padding:0 16px!important}
.newtab-settings-row>input:focus{box-shadow:inset 0 -2px 0 var(--md-primary)!important}
.newtab-settings-hint,.newtab-shortcut-entry-url,.dialog-empty{color:var(--md-on-surface-variant)!important;font-size:13px!important}
.newtab-shortcut-entry{background:var(--md-surface-container)!important;border-radius:16px!important;padding:10px 12px!important}
.newtab-shortcut-entry-icon{border-radius:12px!important;background:var(--md-surface-container-low)!important}
.newtab-dialog-content>ul>li{border-bottom-color:var(--md-outline-variant)!important;border-radius:12px;padding:12px 8px!important}
.newtab-dialog-content>ul>li:hover{background:color-mix(in srgb,var(--md-on-surface) 8%,transparent)!important}
@media (prefers-reduced-motion:reduce){.shortcut::before,.shortcut::after{animation:none}}
`
    },

    /* ---------- Windows 11 ---------- */
    {
      id: "windows11",
      name: "Windows 11",
      description: "角が少し丸いアクリルの板。Windows 11 のアプリになじみます。",
      preview: { wall: "linear-gradient(135deg,#9ec5ff,#dbe8f8 60%,#c9d6f5)", bar: "rgba(249,249,249,.88)", barInk: "#1b1b1b", btn: "#0067c0", box: "rgba(251,251,251,.85)", radius: "8px", boxRadius: "8px", border: "rgba(0,0,0,.08)" },
      css: `
:root{--w11-accent:#0067c0;--w11-on-accent:#fff;--w11-layer:rgba(249,249,249,.86);--w11-card:rgba(255,255,255,.72);--w11-ink:#1b1b1b;--w11-ink2:#5d5d5d;--w11-stroke:rgba(0,0,0,.07);--w11-danger:#c42b1c}
@media (prefers-color-scheme:dark){:root{--w11-accent:#4cc2ff;--w11-on-accent:#000;--w11-layer:rgba(32,32,32,.88);--w11-card:rgba(255,255,255,.06);--w11-ink:#fff;--w11-ink2:#c5c5c5;--w11-stroke:rgba(255,255,255,.08);--w11-danger:#ff99a4}}
.search{background:var(--w11-layer)!important;border-radius:8px!important;corner-shape:round!important;-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);box-shadow:0 0 0 1px var(--w11-stroke),0 8px 16px rgba(0,0,0,.14)!important}
#searchBox{color:var(--w11-ink)!important;font-size:20px!important}
.searchbtn{background:var(--w11-accent)!important;border-radius:4px!important;corner-shape:round!important}
.searchbtn svg path{fill:var(--w11-on-accent)!important}
.search-btn{background:var(--w11-layer)!important;color:var(--w11-ink)!important;border-radius:4px!important;corner-shape:round!important;-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);box-shadow:0 0 0 1px var(--w11-stroke),0 2px 4px rgba(0,0,0,.08)}
.search-btn svg path{fill:var(--w11-ink)!important}
.history{background:var(--w11-layer)!important;color:var(--w11-ink)!important;border-radius:4px!important}
.shortcut{background:var(--w11-layer)!important;-webkit-backdrop-filter:blur(60px) saturate(1.4);backdrop-filter:blur(60px) saturate(1.4)}
.main-shortcut-box{background-color:var(--w11-card)!important;border-radius:8px!important;corner-shape:round!important;box-shadow:0 0 0 1px var(--w11-stroke)}
.main-shortcut-title,.main-shortcut-name{color:var(--w11-ink)!important}
.main-shortcut-title{font-weight:600!important}
.app-search-dropdown,#mainSuggestionDropdown{background:var(--w11-layer)!important;border-radius:8px!important;corner-shape:round!important;box-shadow:0 0 0 1px var(--w11-stroke),0 8px 16px rgba(0,0,0,.14)!important}
.app-search-item{border-radius:4px!important;corner-shape:round!important}
.app-search-item-name{color:var(--w11-ink)!important}
.newtab-dialog{background:rgba(0,0,0,.3)!important}
.newtab-dialog-content{background:var(--w11-layer)!important;color:var(--w11-ink)!important;border-radius:8px!important;corner-shape:round!important;padding:24px!important;-webkit-backdrop-filter:blur(40px) saturate(1.4);backdrop-filter:blur(40px) saturate(1.4);box-shadow:0 0 0 1px var(--w11-stroke),0 32px 64px rgba(0,0,0,.28)!important}
.newtab-dialog-title{font-size:28px!important;font-weight:600!important}
.newtab-dialog-close{background:transparent!important;border-radius:4px!important;color:var(--w11-ink)!important}
.newtab-dialog-close:hover{background:var(--w11-card)!important}
.newtab-settings-section-title{font-weight:600!important}
${BTN}{background:var(--w11-card)!important;color:var(--w11-ink)!important;border-radius:4px!important;box-shadow:0 0 0 1px var(--w11-stroke),inset 0 -1px 0 var(--w11-stroke)!important}
.newtab-settings-action:hover,.newtab-settings-choice:hover,.newtab-settings-link:hover{filter:brightness(.97)}
.newtab-settings-choice[aria-pressed="true"]{background:var(--w11-accent)!important;color:var(--w11-on-accent)!important}
.newtab-settings-danger{background:var(--w11-danger)!important;color:var(--w11-on-accent)!important;border-radius:4px!important}
.newtab-settings-row>input{background:var(--w11-card)!important;border:1px solid var(--w11-stroke)!important;border-radius:4px!important;box-shadow:inset 0 -1px 0 var(--w11-ink2)!important}
.newtab-settings-row>input:focus{box-shadow:inset 0 -2px 0 var(--w11-accent)!important}
.newtab-settings-hint,.newtab-shortcut-entry-url,.dialog-empty{color:var(--w11-ink2)!important}
.newtab-shortcut-entry{background:var(--w11-card)!important;border-radius:4px!important;box-shadow:0 0 0 1px var(--w11-stroke)}
.newtab-dialog-content>ul>li{border-bottom-color:var(--w11-stroke)!important}
`
    },

    /* ---------- Windows 10 ---------- */
    {
      id: "windows10",
      name: "Windows 10",
      description: "角のないまっすぐな板。いい感じに Windows 10 感。",
      preview: { wall: "linear-gradient(135deg,#0b3d91,#1d6fd8 60%,#5aa9ff)", bar: "rgba(31,31,31,.86)", barInk: "#fff", btn: "#0078d7", box: "#0078d7", radius: "0", boxRadius: "0", border: "transparent" },
      css: `
.search,.searchbtn,.search-btn,.history,.main-shortcut-box,.newtab-dialog-content,.newtab-dialog-close,.app-search-dropdown,#mainSuggestionDropdown,.app-search-item,.newtab-settings-action,.newtab-settings-choice,.newtab-settings-link,.newtab-settings-danger,.newtab-settings-row>input,.newtab-shortcut-entry,.newtab-shortcut-entry-icon{border-radius:0!important;corner-shape:round!important}
.search{background:rgba(31,31,31,.86)!important;padding:4px!important;-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);box-shadow:0 8px 24px rgba(0,0,0,.3)!important}
#searchBox{color:#fff!important;font-size:20px!important}
.searchbtn{background:#0078d7!important}
.searchbtn svg path{fill:#fff!important}
.search-btn{background:rgba(31,31,31,.8)!important;color:#fff!important}
.search-btn svg path{fill:#fff!important}
.search-btn:hover{transform:none!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.4)}
.history{background:rgba(31,31,31,.7)!important;color:#fff!important}
.shortcut{background:rgba(31,31,31,.82)!important;-webkit-backdrop-filter:blur(40px);backdrop-filter:blur(40px)}
.main-shortcut-box{background-color:#0078d7!important}
.main-shortcut-item:hover .main-shortcut-box{box-shadow:inset 0 0 0 2px rgba(255,255,255,.5)}
.main-shortcut-title,.main-shortcut-name{color:#fff!important}
.main-shortcut-title{text-align:left!important;font-weight:300!important}
.app-search-dropdown,#mainSuggestionDropdown{background:rgba(31,31,31,.92)!important}
.app-search-item-name{color:#fff!important}
.app-search-item:hover{background:rgba(255,255,255,.1)!important}
.newtab-dialog{background:rgba(0,0,0,.45)!important}
.newtab-dialog-content{background:rgba(31,31,31,.94)!important;color:#fff!important;padding:24px!important;-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);box-shadow:0 0 0 1px #0078d7,0 24px 48px rgba(0,0,0,.4)!important}
.newtab-dialog-title{font-size:30px!important;font-weight:300!important}
.newtab-dialog-close{background:transparent!important;color:#fff!important;width:46px!important}
.newtab-dialog-close:hover{background:#e81123!important}
.newtab-settings-section-title{font-weight:400!important;color:#fff!important}
.newtab-settings-action,.newtab-settings-choice,.newtab-settings-link{background:rgba(255,255,255,.12)!important;color:#fff!important;box-shadow:none!important}
.newtab-settings-action:hover,.newtab-settings-choice:hover,.newtab-settings-link:hover{box-shadow:inset 0 0 0 2px rgba(255,255,255,.45)!important}
.newtab-settings-choice[aria-pressed="true"]{background:#0078d7!important;color:#fff!important}
.newtab-settings-danger{background:#e81123!important;color:#fff!important}
.newtab-settings-row>input{background:rgba(0,0,0,.35)!important;color:#fff!important;border:2px solid rgba(255,255,255,.45)!important}
.newtab-settings-row>input:focus{border-color:#0078d7!important;box-shadow:none!important}
.newtab-settings-hint,.newtab-shortcut-entry-url,.dialog-empty{color:rgba(255,255,255,.65)!important}
.newtab-shortcut-entry{background:rgba(255,255,255,.08)!important}
.newtab-dialog-content>ul>li{border-bottom-color:rgba(255,255,255,.12)!important}
.newtab-dialog-content>ul>li:hover{background:rgba(255,255,255,.08)!important}
`
    },

    /* ---------- Material 2 ---------- */
    {
      id: "material2",
      name: "Material 2",
      description: "影で浮かぶカードと藍色のボタン。やっぱり Google 感。",
      preview: { wall: "linear-gradient(135deg,#e8eaf6,#fafafa)", bar: "#fff", barInk: "#212121", btn: "#3f51b5", box: "#fff", radius: "4px", boxRadius: "4px", border: "transparent", shadow: "0 2px 4px rgba(0,0,0,.24)" },
      css: `
:root{--m2-primary:#3f51b5;--m2-accent:#ff4081;--m2-surface:#fff;--m2-bg:rgba(250,250,250,.94);--m2-ink:#212121;--m2-ink2:rgba(0,0,0,.6);--m2-line:rgba(0,0,0,.12);--m2-chip:#e0e0e0}
@media (prefers-color-scheme:dark){:root{--m2-primary:#9fa8da;--m2-accent:#ff80ab;--m2-surface:#424242;--m2-bg:rgba(33,33,33,.94);--m2-ink:#fff;--m2-ink2:rgba(255,255,255,.7);--m2-line:rgba(255,255,255,.12);--m2-chip:#616161}}
.search{background:var(--m2-surface)!important;border-radius:4px!important;corner-shape:round!important;box-shadow:0 2px 4px rgba(0,0,0,.14),0 4px 12px rgba(0,0,0,.12)!important}
#searchBox{color:var(--m2-ink)!important;font-size:20px!important}
.searchbtn{background:#3f51b5!important;border-radius:2px!important;corner-shape:round!important;box-shadow:0 2px 2px rgba(0,0,0,.24)}
.searchbtn svg path{fill:#fff!important}
.search-btn{background:var(--m2-surface)!important;color:var(--m2-primary)!important;border-radius:2px!important;corner-shape:round!important;text-transform:uppercase;letter-spacing:.04em;box-shadow:0 2px 2px rgba(0,0,0,.2),0 1px 5px rgba(0,0,0,.12)}
.search-btn svg path{fill:var(--m2-primary)!important}
.history{background:var(--m2-surface)!important;color:var(--m2-ink)!important;border-radius:16px!important;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.shortcut{background:var(--m2-bg)!important}
.main-shortcut-box{background-color:var(--m2-surface)!important;border-radius:4px!important;corner-shape:round!important;box-shadow:0 2px 4px rgba(0,0,0,.18),0 3px 8px rgba(0,0,0,.1)}
.main-shortcut-title{color:var(--m2-primary)!important;font-weight:500!important}
.main-shortcut-name{color:var(--m2-ink2)!important}
.app-search-dropdown,#mainSuggestionDropdown{background:var(--m2-surface)!important;border-radius:4px!important;corner-shape:round!important;box-shadow:0 8px 10px rgba(0,0,0,.14),0 3px 14px rgba(0,0,0,.12)!important}
.app-search-item{border-radius:0!important;corner-shape:round!important}
.app-search-item-name{color:var(--m2-ink)!important}
.newtab-dialog{background:rgba(0,0,0,.5)!important}
.newtab-dialog-content{background:var(--m2-surface)!important;color:var(--m2-ink)!important;border-radius:4px!important;corner-shape:round!important;padding:24px!important;box-shadow:0 24px 38px rgba(0,0,0,.14),0 9px 46px rgba(0,0,0,.12),0 11px 15px rgba(0,0,0,.2)!important}
.newtab-dialog-title{font-size:22px!important;font-weight:500!important}
.newtab-dialog-close{background:transparent!important;color:var(--m2-ink2)!important}
.newtab-dialog-close:hover{background:var(--m2-line)!important}
.newtab-settings-section-title{color:var(--m2-primary)!important;font-weight:500!important}
.newtab-settings-action,.newtab-settings-choice,.newtab-settings-link{background:transparent!important;color:var(--m2-primary)!important;border-radius:2px!important;text-transform:uppercase;letter-spacing:.05em;font-weight:500;box-shadow:inset 0 0 0 1px var(--m2-line)!important}
.newtab-settings-action:hover,.newtab-settings-choice:hover,.newtab-settings-link:hover{background:color-mix(in srgb,var(--m2-primary) 10%,transparent)!important}
.newtab-settings-choice[aria-pressed="true"]{background:var(--m2-primary)!important;color:var(--m2-surface)!important;box-shadow:0 2px 2px rgba(0,0,0,.24)!important}
.newtab-settings-danger{background:#f44336!important;color:#fff!important;border-radius:2px!important;text-transform:uppercase;letter-spacing:.05em;font-weight:500;box-shadow:0 2px 2px rgba(0,0,0,.24)}
.newtab-settings-row>input{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:inset 0 -1px 0 var(--m2-ink2)!important}
.newtab-settings-row>input:focus{box-shadow:inset 0 -2px 0 var(--m2-primary)!important}
.newtab-settings-hint,.newtab-shortcut-entry-url,.dialog-empty{color:var(--m2-ink2)!important}
.newtab-shortcut-entry{background:transparent!important;border-radius:0!important;box-shadow:inset 0 -1px 0 var(--m2-line)}
.newtab-dialog-content>ul>li{border-bottom-color:var(--m2-line)!important}
`
    }
  ];

  window.SAETAB_CATALOG = { EXTENSIONS, THEMES };
})();
