(() => {
"use strict";
const DB_NAME = "WallpaperDB";
const STORE = "images";
const ICON_ZIP_URL = "https://search3958.github.io/newtab/lsr/icons-7.zip?v=1";
const FALLBACK_LIGHT = "bgimg/samag3.webp";
const FALLBACK_DARK = "bgimg/samag3_dark.webp";
const HISTORY_KEY = "searchHistory";
const MAX_HISTORY = 40;
const SETTINGS_DB_NAME = "NewtabSettingsDB";
const SETTINGS_STORE = "data";
const CUSTOM_SHORTCUTS_KEY = "customShortcuts";
const CUSTOM_SHORTCUT_ICON_PREFIX = "customShortcutIcon:";
const LABEL_VISIBLE_KEY = "newtab.labelVisible";
const ICON_SIZE_KEY = "newtab.iconSize";
const DEFAULT_LABEL_VISIBLE = true;
const DEFAULT_ICON_SIZE = "standard";
const FAVICON_API_URL = "https://www.google.com/s2/favicons";
const SELECTED_LANG_KEY = "selectedLang";
const SUPPORTED_LANGS = new Set(["ja", "en", "ko", "ko-kp", "zh", "zh-tw", "ru"]);
const UI_TRANSLATIONS = {
ja: {
pageTitle: "SaeTab 7",
searchPlaceholder: "スクロールして一覧を表示",
appSearch: "アプリ連携",
management: "管理",
customize: "カスタマイズ",
historyButton: "履歴表示",
close: "閉じる",
appNotFound: "該当するアプリが見つかりません",
appOpen: "アプリを開く",
calculate: "計算",
calculationResult: "計算結果",
googleCandidate: "Google候補",
searchHistory: "検索履歴",
historyEmpty: "履歴はありません",
shortcut: "ショートカット",
myShortcuts: "自分のショートカット",
add: "追加",
delete: "削除",
urlPlaceholder: "URLを入力",
labelPlaceholder: "ラベルを入力",
appearance: "外観",
changeWallpaper: "壁紙を変更",
labelVisibility: "ラベルの表示",
show: "表示する",
hide: "表示しない",
iconSize: "アイコンサイズ",
standard: "標準",
large: "大",
extraLarge: "特大",
managementTitle: "管理",
saetab: "SaeTab 7",
settingsDetails: "設定方法と詳細",
simpleVersion: "簡易版",
data: "データ",
resetSettings: "Newtab設定のリセット",
deleteHistory: "検索履歴の削除",
information: "情報",
termsPrivacy: "利用規約 および 個人情報政策",
aboutMe: "私について",
language: "Language",
resetConfirm: "Newtab設定をリセットします。\n\n壁紙、ラベル表示、アイコンサイズのみが初期状態に戻ります。\n検索履歴やショートカットなど、その他のデータは削除されません。\n\n実行しますか？",
deleteHistoryConfirm: "検索履歴をすべて削除します。実行しますか？",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "学習と教育",
"作業効率化": "作業効率化",
"コミュニケーション": "コミュニケーション",
"エンターテイメント": "エンターテイメント",
"開発・技術": "開発・技術",
"ショッピング": "ショッピング",
"情報収集と知識": "情報収集と知識"
},
shortcuts: {
"私について": "私について",
"文字カウンター": "文字カウンター",
"タイマー": "タイマー",
"ストップウォッチ": "ストップウォッチ",
"デジタル時計": "デジタル時計",
"アナログ時計": "アナログ時計",
"記録ノート": "記録ノート",
"千里辞書": "千里辞書",
"ロイロノート": "ロイロノート",
"Lit講座": "Lit講座",
"リモート": "リモート",
"翻訳": "翻訳",
"Google AI検索": "Google AI検索",
"Yahoo!フリマ": "Yahoo!フリマ"
}
},
en: {
pageTitle: "SaeTab 7",
searchPlaceholder: "Scroll to show the list",
appSearch: "App Search",
management: "Manage",
customize: "Customize",
historyButton: "History",
close: "Close",
appNotFound: "No matching apps found",
appOpen: "Open app",
calculate: "Calculate",
calculationResult: "Calculation result",
googleCandidate: "Google suggestion",
searchHistory: "Search history",
historyEmpty: "No history",
shortcut: "Shortcuts",
myShortcuts: "My Shortcuts",
add: "Add",
delete: "Delete",
urlPlaceholder: "Enter URL",
labelPlaceholder: "Enter label",
appearance: "Appearance",
changeWallpaper: "Change wallpaper",
labelVisibility: "Show labels",
show: "Show",
hide: "Hide",
iconSize: "Icon size",
standard: "Standard",
large: "Large",
extraLarge: "Extra large",
managementTitle: "Manage",
saetab: "SaeTab 7",
settingsDetails: "Settings & details",
simpleVersion: "Simple version",
data: "Data",
resetSettings: "Reset Newtab settings",
deleteHistory: "Delete search history",
information: "Information",
termsPrivacy: "Terms of Use & Privacy Policy",
aboutMe: "About me",
language: "Language",
resetConfirm: "Reset Newtab settings?\n\nOnly wallpaper, label visibility, and icon size will be restored to their defaults.\nSearch history, shortcuts, and other data will not be deleted.\n\nContinue?",
deleteHistoryConfirm: "Delete all search history?\n\nContinue?",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "Learning & Education",
"作業効率化": "Productivity",
"コミュニケーション": "Communication",
"エンターテイメント": "Entertainment",
"開発・技術": "Development & Technology",
"ショッピング": "Shopping",
"情報収集と知識": "Information & Knowledge"
},
shortcuts: {
"私について": "About Me",
"文字カウンター": "Character Counter",
"タイマー": "Timer",
"ストップウォッチ": "Stopwatch",
"デジタル時計": "Digital Clock",
"アナログ時計": "Analog Clock",
"記録ノート": "Record Note",
"千里辞書": "Cheonri Dictionary",
"ロイロノート": "LoiLoNote",
"Lit講座": "Lit Course",
"リモート": "Remote Desktop",
"翻訳": "Translate",
"Google AI検索": "Google AI Search",
"Yahoo!フリマ": "Yahoo! Flea Market"
}
},
ko: {
pageTitle: "SaeTab 7",
searchPlaceholder: "스크롤하여 목록 표시",
appSearch: "앱 연동",
management: "관리",
customize: "커스터마이즈",
historyButton: "기록 표시",
close: "닫기",
appNotFound: "일치하는 앱이 없습니다",
appOpen: "앱 열기",
calculate: "계산",
calculationResult: "계산 결과",
googleCandidate: "Google 추천",
searchHistory: "검색 기록",
historyEmpty: "기록이 없습니다",
shortcut: "바로가기",
myShortcuts: "내 바로가기",
add: "추가",
delete: "삭제",
urlPlaceholder: "URL 입력",
labelPlaceholder: "라벨 입력",
appearance: "외관",
changeWallpaper: "배경화면 변경",
labelVisibility: "라벨 표시",
show: "표시",
hide: "표시하지 않음",
iconSize: "아이콘 크기",
standard: "기본",
large: "크게",
extraLarge: "매우 크게",
managementTitle: "관리",
saetab: "SaeTab 7",
settingsDetails: "설정 방법 및 상세",
simpleVersion: "간이 버전",
data: "데이터",
resetSettings: "Newtab 설정 초기화",
deleteHistory: "검색 기록 삭제",
information: "정보",
termsPrivacy: "이용약관 및 개인정보 처리방침",
aboutMe: "소개",
language: "언어",
resetConfirm: "Newtab 설정을 초기화할까요?\n\n배경화면, 라벨 표시, 아이콘 크기만 기본값으로 돌아갑니다.\n검색 기록, 바로가기 및 기타 데이터는 삭제되지 않습니다.\n\n계속하시겠습니까?",
deleteHistoryConfirm: "모든 검색 기록을 삭제할까요?\n\n계속하시겠습니까?",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "학습 및 교육",
"作業効率化": "업무 효율",
"コミュニケーション": "커뮤니케이션",
"エンターテイメント": "엔터테인먼트",
"開発・技術": "개발 및 기술",
"ショッピング": "쇼핑",
"情報収集と知識": "정보 및 지식"
},
shortcuts: {
"私について": "소개",
"文字カウンター": "문자 카운터",
"タイマー": "타이머",
"ストップウォッチ": "스톱워치",
"デジタル時計": "디지털 시계",
"アナログ時計": "아날로그 시계",
"記録ノート": "기록 노트",
"千里辞書": "천리 사전",
"ロイロノート": "LoiLoNote",
"Lit講座": "Lit 강좌",
"リモート": "원격 데스크톱",
"翻訳": "번역",
"Google AI検索": "Google AI 검색",
"Yahoo!フリマ": "Yahoo! 플리마켓"
}
},
"ko-kp": {
pageTitle: "SaeTab 7",
searchPlaceholder: "목록을 보려면 아래로 내리십시오",
appSearch: "응용프로그램 연동",
management: "관리",
customize: "맞춤설정",
historyButton: "기록 표시",
close: "닫기",
appNotFound: "일치하는 응용프로그램이 없습니다",
appOpen: "응용프로그램 열기",
calculate: "계산",
calculationResult: "계산 결과",
googleCandidate: "Google 추천",
searchHistory: "검색 기록",
historyEmpty: "기록이 없습니다",
shortcut: "지름길",
myShortcuts: "나의 지름길",
add: "추가",
delete: "삭제",
urlPlaceholder: "URL 입력",
labelPlaceholder: "표식 입력",
appearance: "외관",
changeWallpaper: "배경화면 변경",
labelVisibility: "표식 표시",
show: "표시",
hide: "표시하지 않음",
iconSize: "아이콘 크기",
standard: "표준",
large: "크게",
extraLarge: "매우 크게",
managementTitle: "관리",
saetab: "SaeTab 7",
settingsDetails: "설정 방법과 상세",
simpleVersion: "간편판",
data: "자료",
resetSettings: "Newtab 설정 초기화",
deleteHistory: "검색 기록 삭제",
information: "정보",
termsPrivacy: "리용규약 및 개인정보정책",
aboutMe: "소개",
language: "언어",
resetConfirm: "Newtab 설정을 초기화하겠습니까?\n\n배경화면, 표식 표시, 아이콘 크기만 초기 상태로 돌아갑니다.\n검색 기록, 지름길 및 기타 자료는 삭제되지 않습니다.\n\n계속하시겠습니까?",
deleteHistoryConfirm: "검색 기록을 모두 삭제하겠습니까?\n\n계속하시겠습니까?",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "학습과 교육",
"作業効率化": "작업 효률화",
"コミュニケーション": "호상교류",
"エンターテイメント": "오락",
"開発・技術": "개발과 기술",
"ショッピング": "상업",
"情報収集と知識": "정보와 지식"
},
shortcuts: {
"私について": "소개",
"文字カウンター": "문자 세기",
"タイマー": "시간기록기",
"ストップウォッチ": "초시계",
"デジタル時計": "전자시계",
"アナログ時計": "아날로그시계",
"記録ノート": "기록수첩",
"千里辞書": "천리사전",
"ロイロノート": "LoiLoNote",
"Lit講座": "Lit강좌",
"リモート": "원격조종",
"翻訳": "번역",
"Google AI検索": "Google 인공지능 검색",
"Yahoo!フリマ": "Yahoo! 벼룩시장"
}
},
zh: {
pageTitle: "SaeTab 7",
searchPlaceholder: "向下滚动以显示列表",
appSearch: "应用联动",
management: "管理",
customize: "自定义",
historyButton: "显示历史",
close: "关闭",
appNotFound: "未找到匹配的应用",
appOpen: "打开应用",
calculate: "计算",
calculationResult: "计算结果",
googleCandidate: "Google 建议",
searchHistory: "搜索历史",
historyEmpty: "暂无历史记录",
shortcut: "快捷方式",
myShortcuts: "我的快捷方式",
add: "添加",
delete: "删除",
urlPlaceholder: "输入 URL",
labelPlaceholder: "输入标签",
appearance: "外观",
changeWallpaper: "更换壁纸",
labelVisibility: "标签显示",
show: "显示",
hide: "不显示",
iconSize: "图标大小",
standard: "标准",
large: "大",
extraLarge: "特大",
managementTitle: "管理",
saetab: "SaeTab 7",
settingsDetails: "设置方法与详细信息",
simpleVersion: "简易版",
data: "数据",
resetSettings: "重置 Newtab 设置",
deleteHistory: "删除搜索历史",
information: "信息",
termsPrivacy: "使用条款及隐私政策",
aboutMe: "关于我",
language: "语言",
resetConfirm: "重置 Newtab 设置？\n\n仅壁纸、标签显示和图标大小会恢复默认值。\n搜索历史、快捷方式和其他数据不会被删除。\n\n继续？",
deleteHistoryConfirm: "删除全部搜索历史？\n\n继续？",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "学习与教育",
"作業効率化": "效率工具",
"コミュニケーション": "交流",
"エンターテイメント": "娱乐",
"開発・技術": "开发与技术",
"ショッピング": "购物",
"情報収集と知識": "信息与知识"
},
shortcuts: {
"私について": "关于我",
"文字カウンター": "字数统计",
"タイマー": "计时器",
"ストップウォッチ": "秒表",
"デジタル時計": "数字时钟",
"アナログ時計": "模拟时钟",
"記録ノート": "记录笔记",
"千里辞書": "千里词典",
"ロイロノート": "LoiLoNote",
"Lit講座": "Lit 课程",
"リモート": "远程桌面",
"翻訳": "翻译",
"Google AI検索": "Google AI 搜索",
"Yahoo!フリマ": "Yahoo! 二手交易"
}
},
"zh-tw": {
pageTitle: "SaeTab 7",
searchPlaceholder: "向下捲動以顯示清單",
appSearch: "應用程式連動",
management: "管理",
customize: "自訂",
historyButton: "顯示歷史",
close: "關閉",
appNotFound: "找不到符合的應用程式",
appOpen: "開啟應用程式",
calculate: "計算",
calculationResult: "計算結果",
googleCandidate: "Google 建議",
searchHistory: "搜尋紀錄",
historyEmpty: "沒有紀錄",
shortcut: "捷徑",
myShortcuts: "我的捷徑",
add: "新增",
delete: "刪除",
urlPlaceholder: "輸入 URL",
labelPlaceholder: "輸入標籤",
appearance: "外觀",
changeWallpaper: "更換桌布",
labelVisibility: "標籤顯示",
show: "顯示",
hide: "不顯示",
iconSize: "圖示大小",
standard: "標準",
large: "大",
extraLarge: "特大",
managementTitle: "管理",
saetab: "SaeTab 7",
settingsDetails: "設定方式與詳細資訊",
simpleVersion: "簡易版",
data: "資料",
resetSettings: "重設 Newtab 設定",
deleteHistory: "刪除搜尋紀錄",
information: "資訊",
termsPrivacy: "使用條款及隱私權政策",
aboutMe: "關於我",
language: "語言",
resetConfirm: "要重設 Newtab 設定嗎？\n\n僅桌布、標籤顯示和圖示大小會恢復預設值。\n搜尋紀錄、捷徑及其他資料不會被刪除。\n\n繼續？",
deleteHistoryConfirm: "要刪除全部搜尋紀錄嗎？\n\n繼續？",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "學習與教育",
"作業効率化": "效率工具",
"コミュニケーション": "社群交流",
"エンターテイメント": "娛樂",
"開発・技術": "開發與技術",
"ショッピング": "購物",
"情報収集と知識": "資訊與知識"
},
shortcuts: {
"私について": "關於我",
"文字カウンター": "字數統計",
"タイマー": "計時器",
"ストップウォッチ": "碼錶",
"デジタル時計": "數位時鐘",
"アナログ時計": "類比時鐘",
"記録ノート": "記錄筆記",
"千里辞書": "千里辭典",
"ロイロノート": "LoiLoNote",
"Lit講座": "Lit 課程",
"リモート": "遠端桌面",
"翻訳": "翻譯",
"Google AI検索": "Google AI 搜尋",
"Yahoo!フリマ": "Yahoo! 二手交易"
}
},
ru: {
pageTitle: "SaeTab 7",
searchPlaceholder: "Прокрутите, чтобы показать список",
appSearch: "Поиск в приложениях",
management: "Управление",
customize: "Настройка",
historyButton: "История",
close: "Закрыть",
appNotFound: "Подходящие приложения не найдены",
appOpen: "Открыть приложение",
calculate: "Вычислить",
calculationResult: "Результат вычисления",
googleCandidate: "Предложение Google",
searchHistory: "История поиска",
historyEmpty: "История пуста",
shortcut: "Ярлыки",
myShortcuts: "Мои ярлыки",
add: "Добавить",
delete: "Удалить",
urlPlaceholder: "Введите URL",
labelPlaceholder: "Введите название",
appearance: "Внешний вид",
changeWallpaper: "Изменить обои",
labelVisibility: "Показывать подписи",
show: "Показывать",
hide: "Не показывать",
iconSize: "Размер значков",
standard: "Стандартный",
large: "Большой",
extraLarge: "Очень большой",
managementTitle: "Управление",
saetab: "SaeTab 7",
settingsDetails: "Настройки и подробности",
simpleVersion: "Упрощённая версия",
data: "Данные",
resetSettings: "Сбросить настройки Newtab",
deleteHistory: "Удалить историю поиска",
information: "Информация",
termsPrivacy: "Условия использования и политика конфиденциальности",
aboutMe: "Обо мне",
language: "Язык",
resetConfirm: "Сбросить настройки Newtab?\n\nТолько обои, отображение подписей и размер значков будут возвращены к значениям по умолчанию.\nИстория поиска, ярлыки и другие данные удалены не будут.\n\nПродолжить?",
deleteHistoryConfirm: "Удалить всю историю поиска?\n\nПродолжить?",
categories: {
"Sentaro": "Sentaro",
"学習と教育": "Учёба и образование",
"作業効率化": "Продуктивность",
"コミュニケーション": "Общение",
"エンターテイメント": "Развлечения",
"開発・技術": "Разработка и технологии",
"ショッピング": "Покупки",
"情報収集と知識": "Информация и знания"
},
shortcuts: {
"私について": "Обо мне",
"文字カウンター": "Счётчик символов",
"タイマー": "Таймер",
"ストップウォッチ": "Секундомер",
"デジタル時計": "Цифровые часы",
"アナログ時計": "Аналоговые часы",
"記録ノート": "Заметки",
"千里辞書": "Словарь Cheonri",
"ロイロノート": "LoiLoNote",
"Lit講座": "Курс Lit",
"リモート": "Удалённый рабочий стол",
"翻訳": "Переводчик",
"Google AI検索": "Поиск Google AI",
"Yahoo!フリマ": "Yahoo! Flea Market"
}
}
};
const normalizeSelectedLanguage = (value) => {
const raw = String(value || "").trim().toLowerCase().replace(/_/g, "-");
const aliases = {"kr": "ko","ko-kr": "ko","cn": "zh","zh-cn": "zh","zh-hans": "zh","tw": "zh-tw","zh-hant": "zh-tw","kp": "ko-kp"};
const normalized = aliases[raw] || raw;
return SUPPORTED_LANGS.has(normalized) ? normalized : "ja";
};
const getSelectedLanguage = () => {
try { return normalizeSelectedLanguage(localStorage.getItem(SELECTED_LANG_KEY)); }
catch (error) { console.error("[Language] selectedLang read failed:", error); return "ja"; }
};
let currentLanguage = getSelectedLanguage();
const getCurrentTranslations = () => UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.ja;
const t = (key) => { const translations = getCurrentTranslations(); return translations[key] ?? UI_TRANSLATIONS.ja[key] ?? key; };
const translateCategoryTitle = (title) => { const translations = getCurrentTranslations(); return translations.categories?.[title] || UI_TRANSLATIONS.ja.categories?.[title] || title; };
const translateShortcutName = (name) => { const translations = getCurrentTranslations(); return translations.shortcuts?.[name] || UI_TRANSLATIONS.ja.shortcuts?.[name] || name; };
const applyUILanguage = () => {
const previousLanguage = currentLanguage;
currentLanguage = getSelectedLanguage();
try {
document.documentElement.lang = currentLanguage === "zh-tw" ? "zh-TW" : currentLanguage;
document.title = t("pageTitle");
const searchBox = document.querySelector("#searchBox");
if (!searchBox) console.error("[Language] Required element not found: #searchBox");
else searchBox.placeholder = t("searchPlaceholder");
document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
const key = element.dataset.i18nPlaceholder;
if (!key) { console.error("[Language] data-i18n-placeholder key is empty."); return; }
element.placeholder = t(key);
});
document.querySelectorAll("[data-i18n]").forEach((element) => {
const key = element.dataset.i18n;
if (!key) { console.error("[Language] data-i18n key is empty."); return; }
element.textContent = t(key);
});
console.log(`[Language] UI applied: ${previousLanguage} -> ${currentLanguage}`);
} catch (error) { console.error("[Language] UI apply failed:", error); }
};
window.addEventListener("storage", (event) => {
if (event.key !== SELECTED_LANG_KEY) return;
applyUILanguage();
renderShortcuts(window._iconMap || new Map());
const openedDialog = document.querySelector(".newtab-dialog");
if (openedDialog) closeNewtabDialog(openedDialog, "language change");
console.log("[Language] selectedLang changed in another tab; UI refreshed.");
}, { passive: true });
const RE_FULL_WIDTH = /[０-９]/g;
const RE_MULTIPLY = /[×✖️xX]/g;
const RE_DIVIDE = /[÷➗]/g;
const RE_MINUS = /[ー]/g;
const RE_PLUS = /[＋]/g;
const RE_INVALID = /[^0-9+\-*/().\s]/g;
const RE_TRAIL_OPS = /[\s+\-*/().]*$/;
const RE_MATH = /^[\d\s+\-*/().]+$/;
const RE_OPERATOR = /[+\-*/]/;
const RE_URL = /^(https?:\/\/|(([a-z0-9-]+\.)+[a-z]{2,}))/i;
const RE_AT = /^@/;
const RE_WHITESPACE_AT = /@.*\s/;
const dom = {};
const cachedElements = new Map();
const getEl = (selector) => {
if (cachedElements.has(selector)) return cachedElements.get(selector);
const el = document.querySelector(selector);
if (el) cachedElements.set(selector, el);
return el;
};
let settingsDbPromise = null;
let customShortcutsCache = [];
const customShortcutIconUrls = new Map();
const openSettingsDb = () => {
if (settingsDbPromise) return settingsDbPromise;
settingsDbPromise = new Promise((resolve, reject) => {
let request;
try { request = indexedDB.open(SETTINGS_DB_NAME, 1); }
catch (error) { console.error("[Settings] IndexedDB open failed:", error); reject(error); return; }
request.onupgradeneeded = (event) => {
const db = event.target.result;
if (!db.objectStoreNames.contains(SETTINGS_STORE)) { db.createObjectStore(SETTINGS_STORE, { keyPath: "key" }); console.log("[Settings] IndexedDB store created."); }
};
request.onsuccess = () => { const db = request.result; db.onversionchange = () => db.close(); console.log("[Settings] IndexedDB ready."); resolve(db); };
request.onerror = () => { const error = request.error || new Error("IndexedDB request failed"); console.error("[Settings] IndexedDB unavailable:", error); reject(error); };
request.onblocked = () => { console.error("[Settings] IndexedDB open blocked."); };
});
return settingsDbPromise;
};
const settingsGet = async (key) => {
if (!key) { console.error("[Settings] Get failed: key is empty."); return null; }
try {
const db = await openSettingsDb();
return await new Promise((resolve, reject) => {
let request;
try { request = db.transaction(SETTINGS_STORE, "readonly").objectStore(SETTINGS_STORE).get(key); }
catch (error) { reject(error); return; }
request.onsuccess = () => resolve(request.result?.value ?? null);
request.onerror = () => reject(request.error || new Error(`IndexedDB get failed: ${key}`));
});
} catch (error) { console.error(`[Settings] Get failed: ${key}`, error); return null; }
};
const settingsPut = async (key, value) => {
if (!key) { console.error("[Settings] Put failed: key is empty."); return false; }
try {
const db = await openSettingsDb();
await new Promise((resolve, reject) => {
let request;
try { request = db.transaction(SETTINGS_STORE, "readwrite").objectStore(SETTINGS_STORE).put({ key, value }); }
catch (error) { reject(error); return; }
request.onsuccess = () => resolve();
request.onerror = () => reject(request.error || new Error(`IndexedDB put failed: ${key}`));
});
console.log(`[Settings] Saved: ${key}`);
return true;
} catch (error) { console.error(`[Settings] Save failed: ${key}`, error); return false; }
};
const settingsDelete = async (key) => {
if (!key) { console.error("[Settings] Delete failed: key is empty."); return false; }
try {
const db = await openSettingsDb();
await new Promise((resolve, reject) => {
let request;
try { request = db.transaction(SETTINGS_STORE, "readwrite").objectStore(SETTINGS_STORE).delete(key); }
catch (error) { reject(error); return; }
request.onsuccess = () => resolve();
request.onerror = () => reject(request.error || new Error(`IndexedDB delete failed: ${key}`));
});
console.log(`[Settings] Deleted: ${key}`);
return true;
} catch (error) { console.error(`[Settings] Delete failed: ${key}`, error); return false; }
};
const isValidCustomShortcut = (shortcut) => Boolean(shortcut && typeof shortcut === "object" && typeof shortcut.id === "string" && shortcut.id && typeof shortcut.name === "string" && shortcut.name.trim() && typeof shortcut.url === "string" && /^https?:\/\//i.test(shortcut.url));
const releaseCustomShortcutIconUrls = () => {
for (const url of customShortcutIconUrls.values()) { try { URL.revokeObjectURL(url); } catch (error) { console.error("[Settings] Icon URL revoke failed:", error); } }
customShortcutIconUrls.clear();
};
const loadCustomShortcutData = async () => {
releaseCustomShortcutIconUrls();
const stored = await settingsGet(CUSTOM_SHORTCUTS_KEY);
customShortcutsCache = Array.isArray(stored) ? stored.filter(isValidCustomShortcut).map(item => ({ id: item.id, name: item.name.trim(), url: item.url, iconKey: typeof item.iconKey === "string" ? item.iconKey : null })) : [];
await Promise.all(customShortcutsCache.map(async (shortcut) => {
if (!shortcut.iconKey) return;
const blob = await settingsGet(`${CUSTOM_SHORTCUT_ICON_PREFIX}${shortcut.iconKey}`);
if (!(blob instanceof Blob) || blob.size === 0) { console.error(`[Settings] Custom icon missing: ${shortcut.name}`); return; }
try { customShortcutIconUrls.set(shortcut.id, URL.createObjectURL(blob)); }
catch (error) { console.error(`[Settings] Custom icon URL creation failed: ${shortcut.name}`, error); }
}));
console.log(`[Settings] Loaded ${customShortcutsCache.length} custom shortcut(s).`);
};
const saveCustomShortcuts = async () => settingsPut(CUSTOM_SHORTCUTS_KEY, customShortcutsCache);
const normalizeShortcutUrl = (input) => {
const raw = String(input || "").trim();
if (!raw) return null;
const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw) ? raw : `https://${raw}`;
try {
const url = new URL(candidate);
if (url.protocol !== "http:" && url.protocol !== "https:") { console.error(`[Settings] Unsupported shortcut protocol: ${url.protocol}`); return null; }
return url.href;
} catch (error) { console.error(`[Settings] Invalid shortcut URL: ${raw}`); return null; }
};
const buildFaviconApiUrl = (url) => {
try { const parsed = new URL(url); return `${FAVICON_API_URL}?domain=${encodeURIComponent(parsed.hostname)}&sz=128`; }
catch (error) { console.error("[Settings] Favicon URL build failed:", error); return null; }
};
const fetchAndStoreFavicon = async (shortcutId, shortcutUrl) => {
const apiUrl = buildFaviconApiUrl(shortcutUrl);
if (!apiUrl) return false;
try {
const response = await fetch(apiUrl, { method: "GET", cache: "force-cache" });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const blob = await response.blob();
if (!blob.size) throw new Error("Favicon response was empty.");
const iconKey = shortcutId;
const saved = await settingsPut(`${CUSTOM_SHORTCUT_ICON_PREFIX}${iconKey}`, blob);
if (!saved) return false;
try {
const existing = customShortcutIconUrls.get(shortcutId);
if (existing) URL.revokeObjectURL(existing);
customShortcutIconUrls.set(shortcutId, URL.createObjectURL(blob));
} catch (error) { console.error("[Settings] Favicon object URL creation failed:", error); }
console.log(`[Settings] Favicon stored: ${shortcutUrl}`);
return true;
} catch (error) { console.error(`[Settings] Favicon fetch failed: ${shortcutUrl}`, error); return false; }
};
const getShortcutCategories = () => {
const customLinks = customShortcutsCache.map(shortcut => ({ name: shortcut.name, url: shortcut.url, bg: "var(--iconbg)", icon: null, iconUrl: customShortcutIconUrls.get(shortcut.id) || null, customId: shortcut.id }));
const builtInCategories = Array.isArray(SHORTCUT_DATA?.categories) ? SHORTCUT_DATA.categories.map((category) => ({ ...category, title: translateCategoryTitle(category.title), links: Array.isArray(category.links) ? category.links.map((link) => ({ ...link, name: translateShortcutName(link.name) })) : [] })) : [];
const categories = [...builtInCategories];
if (customLinks.length > 0) { categories.unshift({ title: t("myShortcuts"), links: customLinks }); console.log(`[Shortcut] Added custom shortcut category: ${customLinks.length} item(s).`); }
else console.log("[Shortcut] Custom shortcut category hidden: 0 item(s).");
return categories;
};
const getLabelVisibleSetting = () => { try { const stored = localStorage.getItem(LABEL_VISIBLE_KEY); return stored === null ? DEFAULT_LABEL_VISIBLE : stored !== "false"; } catch (error) { console.error("[Settings] Label visibility read failed:", error); return DEFAULT_LABEL_VISIBLE; } };
const getIconSizeSetting = () => { try { const stored = localStorage.getItem(ICON_SIZE_KEY); return ["standard", "large", "extra-large"].includes(stored) ? stored : DEFAULT_ICON_SIZE; } catch (error) { console.error("[Settings] Icon size read failed:", error); return DEFAULT_ICON_SIZE; } };
const applyAppearanceSettings = () => {
const root = getEl("#mainShortcuts");
if (!root) { console.error("[Settings] Required element not found: #mainShortcuts"); return; }
const labelVisible = getLabelVisibleSetting();
const iconSize = getIconSizeSetting();
root.dataset.labelVisible = String(labelVisible);
root.dataset.iconSize = iconSize;
console.log(`[Settings] Appearance applied: labels=${labelVisible}, iconSize=${iconSize}`);
};
const saveAppearanceSetting = (key, value) => { try { localStorage.setItem(key, value); console.log(`[Settings] localStorage saved: ${key}=${value}`); return true; } catch (error) { console.error(`[Settings] localStorage save failed: ${key}`, error); return false; } };
const deleteOnlyWallpaperSettings = async () => {
try {
const request = indexedDB.open(DB_NAME);
await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error || new Error("WallpaperDB open failed")); request.onblocked = () => reject(new Error("WallpaperDB open blocked")); });
const db = request.result;
const deleteKeys = ["newtabRandom", "newtab", "light", "dark"];
if (!db.objectStoreNames.contains(STORE)) { db.close(); console.log("[Settings] Wallpaper store not found; nothing to reset."); return true; }
await new Promise((resolve, reject) => {
let transaction;
try { transaction = db.transaction(STORE, "readwrite"); const store = transaction.objectStore(STORE); for (const key of deleteKeys) store.delete(key); }
catch (error) { reject(error); return; }
transaction.oncomplete = () => resolve();
transaction.onerror = () => reject(transaction.error || new Error("Wallpaper reset transaction failed"));
transaction.onabort = () => reject(transaction.error || new Error("Wallpaper reset transaction aborted"));
});
db.close();
if (document.body) { document.body.style.removeProperty("--wallpaper-light"); document.body.style.removeProperty("--wallpaper-dark"); }
console.log("[Settings] Wallpaper reset: only Newtab wallpaper records were deleted.");
return true;
} catch (error) { console.error("[Settings] Wallpaper reset failed:", error); return false; }
};
const resetNewtabSettings = async () => {
const confirmed = window.confirm(t("resetConfirm"));
if (!confirmed) { console.log("[Settings] Newtab settings reset cancelled."); return; }
let localStorageReset = false;
try { localStorage.removeItem(LABEL_VISIBLE_KEY); localStorage.removeItem(ICON_SIZE_KEY); localStorageReset = true; console.log("[Settings] Appearance settings reset."); }
catch (error) { console.error("[Settings] Appearance reset failed:", error); }
const wallpaperReset = await deleteOnlyWallpaperSettings();
applyAppearanceSettings();
console.log(`[Settings] Newtab reset completed: appearance=${localStorageReset}, wallpaper=${wallpaperReset}.`);
};
const deleteSearchHistory = () => {
const confirmed = window.confirm(t("deleteHistoryConfirm"));
if (!confirmed) { console.log("[Settings] Search history deletion cancelled."); return; }
try { localStorage.removeItem(HISTORY_KEY); historyCache = []; const historyList = getEl("#historyList"); if (historyList) historyList.replaceChildren(); console.log("[Settings] Search history deleted."); }
catch (error) { console.error("[Settings] Search history deletion failed:", error); }
};
const setWallpaper = (light, dark) => {
if (!document.body) return;
const lightUrl = light ? URL.createObjectURL(light) : FALLBACK_LIGHT;
const darkUrl = dark ? URL.createObjectURL(dark) : lightUrl;
document.body.style.setProperty("--wallpaper-light", `url("${lightUrl}")`);
document.body.style.setProperty("--wallpaper-dark", `url("${darkUrl}")`);
};
const idbGet = (db, key) => new Promise(resolve => { try { const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); } catch { resolve(null); } });
const initWallpaper = () => {
let request;
try { request = indexedDB.open(DB_NAME, 1); } catch { return; }
request.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
request.onsuccess = async () => {
const db = request.result;
try {
const random = await idbGet(db, "newtabRandom");
if (Array.isArray(random?.wallpapers) && random.wallpapers.length) {
const list = random.wallpapers.filter(item => item?.light || item?.dark);
if (list.length) { const w = list[Math.floor(Math.random() * list.length)]; setWallpaper(w.light || w.dark, w.dark || w.light); return; }
}
const normal = await idbGet(db, "newtab");
if (normal?.light || normal?.dark) { setWallpaper(normal.light || normal.dark, normal.dark || normal.light); return; }
const light = await idbGet(db, "light");
const dark = await idbGet(db, "dark");
if (light?.light || dark?.dark) setWallpaper(light.light || dark.dark, dark.dark || light.light);
} catch {} finally { db.close(); }
};
};
const findEOCD = (bytes) => { const min = 22, max = 0xffff, start = Math.max(0, bytes.length - min - max); for (let i = bytes.length - min; i >= start; i--) { if (bytes[i] === 0x50 && bytes[i+1] === 0x4b && bytes[i+2] === 0x05 && bytes[i+3] === 0x06) return i; } return -1; };
const createZipReader = async (buffer) => {
const bytes = new Uint8Array(buffer);
const view = new DataView(buffer);
const eocd = findEOCD(bytes);
if (eocd < 0) throw new Error("ZIP EOCD not found");
const cdSize = view.getUint32(eocd + 12, true);
const cdOffset = view.getUint32(eocd + 16, true);
const entries = new Map();
let cursor = cdOffset;
const end = cdOffset + cdSize;
const dec = new TextDecoder();
while (cursor < end) {
if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Invalid ZIP entry");
const cm = view.getUint16(cursor + 10, true);
const cs = view.getUint32(cursor + 20, true);
const us = view.getUint32(cursor + 24, true);
const fnLen = view.getUint16(cursor + 28, true);
const exLen = view.getUint16(cursor + 30, true);
const coLen = view.getUint16(cursor + 32, true);
const lho = view.getUint32(cursor + 42, true);
const fn = dec.decode(bytes.subarray(cursor + 46, cursor + 46 + fnLen));
entries.set(fn, { cm, cs, us, lho });
cursor += 46 + fnLen + exLen + coLen;
}
const read = async (filename) => {
const entry = entries.get(filename);
if (!entry) return null;
if (view.getUint32(entry.lho, true) !== 0x04034b50) throw new Error(`Invalid local header: ${filename}`);
const lfn = view.getUint16(entry.lho + 26, true);
const el = view.getUint16(entry.lho + 28, true);
const doff = entry.lho + 30 + lfn + el;
const comp = bytes.slice(doff, doff + entry.cs);
if (entry.cm === 0) return comp;
if (entry.cm !== 8) throw new Error(`Unsupported compression: ${entry.cm}`);
if (typeof DecompressionStream === "undefined") throw new Error("DecompressionStream unsupported");
return new Uint8Array(await new Response(new Blob([comp]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
};
return { entries, read };
};
const loadIconsFromZip = async () => {
const res = await fetch(ICON_ZIP_URL, { cache: "force-cache" });
if (!res.ok) throw new Error(`Icon ZIP failed: ${res.status}`);
const zip = await createZipReader(await res.arrayBuffer());
const urls = new Map();
const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", avif: "image/avif" };
for (const [filename] of zip.entries) {
if (filename.endsWith("/") || filename.includes("../")) continue;
try { const data = await zip.read(filename); if (!data) continue; const ext = filename.split(".").pop()?.toLowerCase(); const blob = new Blob([data], { type: mimeMap[ext] || "application/octet-stream" }); urls.set(filename, URL.createObjectURL(blob)); }
catch {}
}
return urls;
};
const SHORTCUT_DATA = {
categories: [
{
title: "Sentaro",
links: [
{ name: "私について", bg: "var(--iconbg)", url: "https://search3958.github.io/", icon: "3958.webp" },
{ name: "文字カウンター", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/counter.html", icon: "counter.webp" },
{ name: "タイマー", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/timer/ja.html", icon: "timer.webp" },
{ name: "ストップウォッチ", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/stopwatch/ja.html", icon: "stopwatch.webp" },
{ name: "デジタル時計", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/dclock/ja.html", icon: "dclock.webp" },
{ name: "アナログ時計", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/aclock/ja.html", icon: "aclock.webp" },
{ name: "記録ノート", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/girog/", icon: "girog.webp" },
{ name: "ToolBoard", bg: "var(--iconbg)", url: "https://search3958.github.io/toolboard", icon: "toolboard.webp" },
{ name: "Baram Code", bg: "var(--iconbg)", url: "https://search3958.github.io/baram/", icon: "garam.webp" },
{ name: "千里辞書", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/sajon/", icon: "cheonri.webp" },
{ name: "Oneul launcher", bg: "var(--iconbg)", url: "https://nidele206.github.io/product/ja/oneul-launcher", icon: "oneul-launcher.webp" },
{ name: "Wo Checker", bg: "var(--iconbg)", url: "https://nidele206.github.io/product/ja/wo-checker", icon: "wo-checker.webp" },
{ name: "Easy Flowchart", bg: "var(--iconbg)", url: "https://nidele206.github.io/product/ja/easy-flowchart", icon: "easy-flowchart.webp" },
{ name: "WebP変換", bg: "var(--iconbg)", url: "https://search3958.github.io/tools/webp.html", icon: "webp.webp" }
]
},
{
title: "学習と教育",
links: [
{ name: "Classroom", bg: "var(--iconbg)", url: "https://classroom.google.com/", icon: "classroom.webp" },
{ name: "Monoxer", bg: "#0073ffbb", url: "https://app.monoxer.com/", icon: "monoxer.webp" },
{ name: "MALU辞書", bg: "var(--iconbg)", url: "https://sy9-k.github.io/dictionary/", icon: "malu.png" },
{ name: "Scratch", bg: "var(--iconbg)", url: "https://scratch.mit.edu/", icon: "scratch.webp" },
{ name: "ロイロノート", bg: "var(--iconbg)", url: "https://loilonote.app/", icon: "loilo.webp" },
{ name: "Lit講座", bg: "var(--iconbg)", url: "https://member.lifeistech-lesson.jp/home", icon: "lit.webp" }
]
},
{
title: "Google",
links: [
{ name: "Gmail", bg: "var(--iconbg)", url: "https://mail.google.com/", icon: "gmail.webp" },
{ name: "Keep", bg: "var(--iconbg)", url: "https://keep.google.com/", icon: "keep.webp" },
{ name: "ドキュメント", bg: "var(--iconbg)", url: "https://docs.google.com/document/", icon: "document.webp" },
{ name: "スライド", bg: "var(--iconbg)", url: "https://docs.google.com/presentation/", icon: "slide.webp" },
{ name: "スプレッドシート", bg: "var(--iconbg)", url: "https://docs.google.com/spreadsheets/", icon: "spreadsheet.webp" },
{ name: "ドライブ", bg: "var(--iconbg)", url: "https://drive.google.com/", icon: "drive.webp" },
{ name: "Photos", bg: "var(--iconbg)", url: "https://photos.google.com/", icon: "photos.webp" },
{ name: "Forms", bg: "var(--iconbg)", url: "https://docs.google.com/forms/", icon: "forms.webp" },
{ name: "リモート", bg: "var(--iconbg)", url: "https://remotedesktop.google.com/", icon: "remotedesktop.webp" }
]
},
{
title: "作業効率化",
links: [
{ name: "ChatGPT", bg: "#fff9", url: "https://chatgpt.com/", icon: "chatgpt.webp" },
{ name: "Qwen", bg: "var(--iconbg)", url: "https://chat.qwen.ai/", icon: "qwen.webp" },
{ name: "TurboWarp", bg: "var(--iconbg)", url: "https://turbowarp.org/", icon: "turbowarp.webp" },
{ name: "Copilot", bg: "var(--iconbg)", url: "https://copilot.microsoft.com/", icon: "copilot.webp" },
{ name: "Claude", bg: "var(--iconbg)", url: "https://claude.ai/", icon: "claude.webp" },
{ name: "NotebookLM", bg: "#fff9", url: "https://notebooklm.google.com/?icid=home_maincta", icon: "notebooklm.webp" },
{ name: "Canva", bg: "var(--iconbg)", url: "https://www.canva.com/", icon: "canva.webp" },
{ name: "Microsoft 365", bg: "var(--iconbg)", url: "https://www.microsoft365.com", icon: "microsodt.webp" },
{ name: "翻訳", bg: "var(--iconbg)", url: "https://translate.google.com/", icon: "translate.webp" }
]
},
{
title: "コミュニケーション",
links: [
{ name: "Discord", bg: "#5618ffbb", url: "https://discord.com/app", icon: "discord.webp" },
{ name: "Snapchat", bg: "#fffc03bb", url: "https://www.snapchat.com/web/", icon: "snapchat.webp" },
{ name: "TikTok", bg: "#000000bb", url: "https://www.tiktok.com/", icon: "tiktok.webp" },
{ name: "Instagram", bg: "var(--iconbg)", url: "https://www.instagram.com/", icon: "instagram.webp" },
{ name: "Weverse", bg: "#27ffbfbb", url: "https://weverse.io/", icon: "weverse.webp" },
{ name: "WeChat", bg: "var(--iconbg)", url: "https://www.wechat.com/", icon: "wechat.webp" }
]
},
{
title: "エンターテイメント",
links: [
{ name: "Youtube", bg: "var(--iconbg)", url: "https://www.youtube.com/", icon: "youtube.webp" },
{ name: "Kahoot", bg: "#1b00a8bb", url: "https://kahoot.it/", icon: "kahoot.webp" },
{ name: "Netflix", bg: "var(--iconbg)", url: "https://www.netflix.com/", icon: "netflix.webp" },
{ name: "Prime Video", bg: "#0398ffbb", url: "https://www.amazon.co.jp/Prime-Video/", icon: "primevideo.webp" },
{ name: "Apple Music", bg: "#FB4058bb", url: "https://music.apple.com/jp/new", icon: "applemusic.webp" },
{ name: "Spotify", bg: "var(--iconbg)", url: "https://www.spotify.com/", icon: "spotify.webp" },
{ name: "poki", bg: "rgba(255, 255, 255, 0.759)", url: "https://poki.com/", icon: "poki.webp" },
{ name: "小红书", bg: "var(--iconbg)", url: "https://www.xiaohongshu.com/explore", icon: "xiaohongshu.webp" },
{ name: "X.com", bg: "#0005", url: "https://x.com/", icon: "x.webp" }
]
},
{
title: "開発・技術",
links: [
{ name: "GitHub", bg: "var(--iconbg)", url: "https://github.com/", icon: "github.webp" },
{ name: "Figma", bg: "var(--iconbg)", url: "https://www.figma.com/", icon: "figma.webp" },
{ name: "Firebase", bg: "var(--iconbg)", url: "https://firebase.google.com/", icon: "firebase.webp" },
{ name: "Codepen", bg: "#000000bb", url: "https://codepen.io/", icon: "codepen.webp" },
{ name: "AdSense", bg: "var(--iconbg)", url: "https://www.google.com/adsense/", icon: "adsense.webp" },
{ name: "Fonts", bg: "var(--iconbg)", url: "https://fonts.google.com/", icon: "fonts.webp" },
{ name: "Analytics", bg: "var(--iconbg)", url: "https://analytics.google.com/analytics/web/", icon: "analytics.webp" },
{ name: "Search Console", bg: "var(--iconbg)", url: "https://search.google.com/search-console", icon: "searchconsole.webp" },
{ name: "AdMob", bg: "var(--iconbg)", url: "https://admob.google.com/", icon: "admob.webp" }
]
},
{
title: "ショッピング",
links: [
{ name: "Amazon", bg: "rgba(255, 255, 255, 0.759)", url: "https://www.amazon.co.jp/", icon: "amazon.webp" },
{ name: "AliExpress", bg: "var(--iconbg)", url: "https://www.aliexpress.com/", icon: "aliexpress.webp" },
{ name: "Mercari", bg: "var(--iconbg)", url: "https://www.mercari.com/jp/", icon: "mercari.webp" },
{ name: "Yahoo!フリマ", bg: "var(--iconbg)", url: "https://paypayfleamarket.yahoo.co.jp/", icon: "pfm.webp" },
{ name: "闲鱼", bg: "#FBE74F", url: "https://2.taobao.com/", icon: "xianyu.webp" }
]
},
{
title: "情報収集と知識",
links: [
{ name: "Google AI検索", bg: "var(--iconbg)", url: "https://www.google.com/search?q=&sca_esv=b5f8bcc5c9e9d517&sxsrf=AE3TifOLFMGi2WEgIHToTWbz6pxHrjaJKA%3A1765700172965&source=hp&ei=THI-adCJOPefvr0PnN3g2Ak&iflsig=AOw8s4IAAAAAaT6AXAWcMaV5a1YrcKo_owUU2NFfS4yC&aep=22&udm=50&ved=0ahUKEwjQ39jc0byRAxX3j68BHZwuGJsQteYPCBQ&oq=&gs_lp=Egdnd3Mtd2l6IgBIAFAAWABwAHgAkAEAmAEAoAEAqgEAuAEByAEAmAIAoAIAmAMAkgcAoAcAsgcAuAcAwgcAyAcAgAgA&sclient=gws-wiz", icon: "products.webp" },
{ name: "Wikipedia", bg: "#fff9", url: "https://ja.wikipedia.org/wiki/", icon: "wikipedia.webp" },
{ name: "Zenn", bg: "var(--iconbg)", url: "https://zenn.dev//", icon: "zenn.webp" },
{ name: "Qiita", bg: "var(--iconbg)", url: "https://qiita.com/", icon: "qitta.webp" },
{ name: "NAVER", bg: "#07cd85", url: "https://www.naver.com/", icon: "naver.webp" },
{ name: "Papago", bg: "var(--iconbg)", url: "https://papago.naver.com/", icon: "papago.webp" },
{ name: "Dola", bg: "var(--iconbg)", url: "https://www.dola.com/chat/", icon: "doubao.webp" },
{ name: "Kimi", bg: "#000b", url: "https://kimi.moonshot.cn/", icon: "kimi.webp" },
{ name: "Perplexity", bg: "var(--iconbg)", url: "https://www.perplexity.ai/", icon: "perproxity.webp" }
]
}
]
};
const APP_SEARCH_DATA = [
{ name: "Scratch", icon: "scratch.webp", url: "https://scratch.mit.edu/search/projects?q=", placeholder: "q" },
{ name: "YouTube", icon: "youtube.webp", url: "https://www.youtube.com/results?search_query=", placeholder: "search_query" },
{ name: "X", icon: "x.webp", url: "https://x.com/search?q=", placeholder: "q" },
{ name: "ChatGPT", icon: "chatgpt.webp", url: "https://chatgpt.com?q=", placeholder: "q" },
{ name: "Mercari", icon: "mercari.webp", url: "https://jp.mercari.com/search?keyword=", placeholder: "keyword" },
{ name: "AliExpress", icon: "aliexpress.webp", url: "https://ja.aliexpress.com/w/wholesale-.html?spm=a2g0o.home.search.0", placeholder: null, pattern: "wholesale-*.html" },
{ name: "Amazon", icon: "amazon.webp", url: "https://www.amazon.co.jp/s?k=", placeholder: "k" },
{ name: "Qiita", icon: "qitta.webp", url: "https://qiita.com/search?q=", placeholder: "q" },
{ name: "PayPayフリマ", icon: "pfm.webp", url: "https://paypayfleamarket.yahoo.co.jp/search/?page=1", placeholder: null },
{ name: "Gmail", icon: "gmail.webp", url: "https://mail.google.com/mail/q=" }
];
const APP_MAP = new Map(APP_SEARCH_DATA.map(a => [a.name.toLowerCase(), a]));
const fullWidthToHalf = (str) => { const map = { '０':'0','１':'1','２':'2','３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9','＋':'+','－':'-','×':'*','÷':'/','＝':'=' }; return str.split('').map(c => map[c] || c).join(''); };
const evaluateMath = (str) => { const cleaned = fullWidthToHalf(str).trim(); if (!cleaned || !RE_MATH.test(cleaned) || !cleaned.includes('+') && !cleaned.includes('-') && !cleaned.includes('*') && !cleaned.includes('/')) return null; try { const r = Function('"use strict"; return (' + cleaned + ')')(); if (typeof r === 'number' && isFinite(r)) return `${cleaned}=${r}`; } catch {} return null; };
const resolveIconUrl = (iconName, iconMap) => { if (!iconName) return null; if (iconMap.has(iconName)) return iconMap.get(iconName); for (const [f, u] of iconMap) if (f.endsWith("/" + iconName) || f.endsWith("\\" + iconName)) return u; return null; };
let historyCache = null;
const getHistory = () => { if (historyCache !== null) return historyCache; try { historyCache = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { historyCache = []; } return historyCache; };
const updateHistory = (query) => { const h = getHistory().filter(s => s !== query); h.unshift({ query, time: Date.now() }); if (h.length > MAX_HISTORY) h.length = MAX_HISTORY; localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); historyCache = h; };
const formatDateTime = (date) => { const m = String(date.getMonth() + 1).padStart(2, "0"); const d = String(date.getDate()).padStart(2, "0"); const h = String(date.getHours()).padStart(2, "0"); const min = String(date.getMinutes()).padStart(2, "0"); return `${m}.${d} ${h}:${min}`; };
let appSearchIconMap = null;
let lastDropdownQuery = null;
const iconCache = new Map();
let searchEngine = "google";
const MAIN_SUGGESTION_ID = "mainSuggestionDropdown";
const GOOGLE_SUGGESTION_DELAY = 120;
let mainSuggestionTimer = null;
let googleSuggestionController = null;
let mainSuggestionItems = [];
const ensureMainSuggestionDropdown = () => { let dropdown = getEl(`#${MAIN_SUGGESTION_ID}`); if (dropdown) return dropdown; if (!document.body) { console.error("[MainSuggestion] document.body not found."); return null; } dropdown = document.createElement("div"); dropdown.id = MAIN_SUGGESTION_ID; dropdown.setAttribute("role", "listbox"); if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) dropdown.style.background = "rgba(28,28,28,0.95)"; document.body.appendChild(dropdown); cachedElements.set(`#${MAIN_SUGGESTION_ID}`, dropdown); console.log("[MainSuggestion] Dropdown created."); return dropdown; };
const setMainSuggestionVisibility = (visible) => { const dropdown = ensureMainSuggestionDropdown(); if (!dropdown) return; dropdown.style.display = visible ? "block" : "none"; };
const hideMainSuggestions = (reason = "unknown") => { if (mainSuggestionTimer) { clearTimeout(mainSuggestionTimer); mainSuggestionTimer = null; } if (googleSuggestionController) { googleSuggestionController.abort(); googleSuggestionController = null; } mainSuggestionItems = []; const dropdown = getEl(`#${MAIN_SUGGESTION_ID}`); if (dropdown) { dropdown.replaceChildren(); dropdown.style.display = "none"; } console.log(`[MainSuggestion] Hidden: ${reason}`); };
const normalizeSuggestionText = (value) => typeof value === "string" ? value.trim() : "";
const getMainAccessCandidates = (query) => { const q = normalizeSuggestionText(query).toLowerCase(); if (!q) return []; const seen = new Set(); const matches = []; const categories = getShortcutCategories(); for (const category of categories) { if (!category || !Array.isArray(category.links)) continue; for (const link of category.links) { if (!link?.name || !link?.url) continue; const name = String(link.name); const key = name.toLowerCase(); if (seen.has(key)) continue; if (key.startsWith(q)) { seen.add(key); matches.push(link); } } } return matches.slice(0, 2); };
const createMainSuggestionItem = (item, index) => { const button = document.createElement("button"); button.type = "button"; button.className = "app-search-item"; button.dataset.index = String(index); button.dataset.value = item.value || ""; button.dataset.action = item.action || "insert"; button.setAttribute("role", "option"); Object.assign(button.style, { width: "100%", border: "0", textAlign: "left", color: "inherit" }); const icon = document.createElement("div"); icon.className = "app-search-item-icon"; icon.style.cssText = "width:32px;height:32px;border-radius:99px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;"; if (item.icon) { const iconUrl = resolveAppIconUrlCached(item.icon, appSearchIconMap || new Map()); if (iconUrl) { const img = document.createElement("img"); img.src = iconUrl; img.alt = ""; img.width = 32; img.height = 32; img.style.objectFit = "contain"; img.addEventListener("error", () => { console.error(`[MainSuggestion] Icon failed: ${item.icon}`); img.remove(); }, { once: true }); icon.appendChild(img); } } if (!icon.firstChild) { icon.textContent = item.type === "math" ? "=" : item.type === "app" ? (item.label?.[0] || "") : ""; icon.style.background = "rgba(24,90,242,0)"; icon.style.fontSize = "15px"; } const name = document.createElement("span"); name.className = "app-search-item-name"; name.textContent = item.label || item.value || ""; const meta = document.createElement("span"); meta.className = "app-search-item-url"; meta.textContent = item.meta || (item.type === "math" ? t("calculate") : t("googleCandidate")); button.append(icon, name, meta); return button; };
const renderMainSuggestions = (items) => { const dropdown = ensureMainSuggestionDropdown(); if (!dropdown) return; mainSuggestionItems = Array.isArray(items) ? items.slice(0, 10) : []; dropdown.replaceChildren(); if (!mainSuggestionItems.length) { dropdown.style.display = "none"; console.log("[MainSuggestion] No candidates."); return; } const fragment = document.createDocumentFragment(); mainSuggestionItems.forEach((item, index) => { const el = createMainSuggestionItem(item, index); if (el) fragment.appendChild(el); }); dropdown.appendChild(fragment); dropdown.style.display = "block"; console.log(`[MainSuggestion] Rendered ${mainSuggestionItems.length} candidate(s). Top: ${mainSuggestionItems[0]?.label || ""}`); };
const fetchGoogleSuggestions = async (query) => { const q = normalizeSuggestionText(query); if (!q || q.startsWith("@")) { console.log("[GoogleSuggest] Skipped: app-search mode or empty query."); return []; } if (googleSuggestionController) googleSuggestionController.abort(); googleSuggestionController = new AbortController(); const uuid = localStorage.getItem("uuid") || ""; const requestUrl = "https://search-helper.takesen2278.workers.dev/?q=" + encodeURIComponent(q) + "&uuid=" + uuid; console.log(`[GoogleSuggest] Request: ${q}`); try { const response = await fetch(requestUrl, { method: "GET", cache: "force-cache", signal: googleSuggestionController.signal }); if (!response.ok) throw new Error(`HTTP ${response.status}`); const data = await response.json(); const suggestions = Array.isArray(data?.[1]) ? data[1].filter(value => typeof value === "string").map(normalizeSuggestionText).filter(Boolean) : []; console.log(`[GoogleSuggest] Received ${suggestions.length} candidate(s).`); return suggestions; } catch (error) { if (error?.name === "AbortError") { console.log("[GoogleSuggest] Request aborted."); return []; } console.error("[GoogleSuggest] Request failed:", error); return []; } finally { googleSuggestionController = null; } };
const buildMainSuggestionList = async (query) => { const q = normalizeSuggestionText(query); if (!q || q.startsWith("@")) { hideMainSuggestions("@ mode or empty query"); return; } const localItems = []; const appMatches = getMainAccessCandidates(q); for (const app of appMatches) localItems.push({ type: "app", label: app.name, value: app.name, url: app.url, icon: app.icon, meta: t("appOpen"), action: "open" }); const mathResult = evaluateMath(q); if (mathResult) localItems.push({ type: "math", label: mathResult, value: mathResult, meta: t("calculationResult"), action: "insert" }); if (localItems.length) renderMainSuggestions(localItems); else hideMainSuggestions("waiting for Google suggestions"); const googleSuggestions = await fetchGoogleSuggestions(q); const googleItems = googleSuggestions.filter(value => value.toLowerCase() !== q.toLowerCase()).filter(value => !localItems.some(item => item.label.toLowerCase() === value.toLowerCase())).slice(0, 7).map(value => ({ type: "google", label: value, value, meta: t("googleCandidate"), action: "insert" })); if (q !== normalizeSuggestionText(getEl("#searchBox")?.value || "")) { console.log("[MainSuggestion] Query changed before Google response; result ignored."); return; } renderMainSuggestions([...localItems, ...googleItems]); };
const scheduleMainSuggestions = (query) => { const q = normalizeSuggestionText(query); if (mainSuggestionTimer) { clearTimeout(mainSuggestionTimer); mainSuggestionTimer = null; } if (googleSuggestionController) { googleSuggestionController.abort(); googleSuggestionController = null; } if (!q || q.startsWith("@")) { hideMainSuggestions(q.startsWith("@") ? "app-search active" : "empty query"); return; } const localItems = []; for (const app of getMainAccessCandidates(q)) localItems.push({ type: "app", label: app.name, value: app.name, url: app.url, icon: app.icon, meta: "アプリを開く", action: "open" }); const mathResult = evaluateMath(q); if (mathResult) localItems.push({ type: "math", label: mathResult, value: mathResult, meta: "計算結果", action: "insert" }); if (localItems.length) renderMainSuggestions(localItems); else hideMainSuggestions("no local candidate"); mainSuggestionTimer = setTimeout(() => { mainSuggestionTimer = null; buildMainSuggestionList(q).catch(error => console.error("[MainSuggestion] Build failed:", error)); }, GOOGLE_SUGGESTION_DELAY); console.log(`[MainSuggestion] Google request scheduled in ${GOOGLE_SUGGESTION_DELAY}ms: ${q}`); };
const applyMainSuggestion = (index = 0, mode = "tab") => { const item = mainSuggestionItems[index]; const sb = getEl("#searchBox"); if (!item || !sb) { console.error("[MainSuggestion] Cannot apply candidate: item or searchBox missing."); return false; } if (mode === "enter" && item.action === "open" && item.url) { updateHistory(item.label); console.log(`[MainSuggestion] Opening app: ${item.label}`); window.location.href = item.url; return true; } sb.value = item.value || item.label || ""; sb.focus(); const end = sb.value.length; try { sb.setSelectionRange(end, end); } catch {} scheduleMainSuggestions(sb.value); console.log(`[MainSuggestion] Candidate applied (${mode}): ${sb.value}`); return true; };
const showIntelBox = (text, url) => { const box = getEl("#intelBox"); const ans = getEl("#intelAnswer"); if (!box || !ans) { console.error("[Intel] Required element not found: #intelBox or #intelAnswer"); return; } ans.textContent = text || ""; ans.onclick = null; ans.classList.remove("hide"); if (url) { ans.style.cursor = "pointer"; ans.onclick = () => { console.log(`[Intel] Opening URL: ${url}`); window.location.href = url; }; } else ans.style.cursor = "default"; box.classList.add("visible"); console.log(`[Intel] Shown: ${text || ""}`); };
const hideIntelBox = () => { const box = getEl("#intelBox"); const ans = getEl("#intelAnswer"); if (box) box.classList.remove("visible"); if (ans) { ans.classList.add("hide"); ans.onclick = null; } };
const searchApp = (text) => { if (!text) return null; const q = text.replace(RE_AT, '').toLowerCase().trim(); if (q.length < 1) return null; return APP_MAP.get(q) || null; };
const resolveAppIconUrlCached = (iconName, iconMap) => { if (!iconName) return null; const key = `${iconName}_${iconMap.size}`; if (iconCache.has(key)) return iconCache.get(key); const url = resolveIconUrl(iconName, iconMap); if (url) iconCache.set(key, url); return url; };
const updateIntelFromDropdown = (query) => { if (!query) { hideIntelBox(); return; } const match = APP_SEARCH_DATA.find(a => a.name.toLowerCase().includes(query.toLowerCase())); if (match) { const iconUrl = resolveAppIconUrlCached(match.icon, appSearchIconMap); const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="${match.name}" style="width:20px;height:20px;object-fit:contain">` : ''; showIntelBox(`${iconHtml} ${match.name}`, match.url); } else hideIntelBox(); };
const showAppSearchDropdown = (query) => { const dropdown = getEl("#appSearchDropdown"); if (!dropdown) return; if (query === lastDropdownQuery) { updateIntelFromDropdown(query); return; } lastDropdownQuery = query; updateIntelFromDropdown(query); const filtered = query ? APP_SEARCH_DATA.filter(a => a.name.toLowerCase().includes(query.toLowerCase())) : APP_SEARCH_DATA; if (filtered.length === 0) dropdown.innerHTML = '<div style="padding:12px;text-align:center;color:#999;font-size:14px">該当するアプリが見つかりません</div>'; else dropdown.innerHTML = filtered.map(app => { const iconUrl = resolveAppIconUrlCached(app.icon, appSearchIconMap); const iconHtml = iconUrl ? `<div class="app-search-item-icon"><img src="${iconUrl}" alt="${app.name}"></div>` : `<div class="app-search-item-icon" style="background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:16px">${app.name[0]}</div>`; return `<div class="app-search-item" data-url="${app.url}" data-name="${app.name}" data-placeholder="${app.placeholder || ''}">${iconHtml}<span class="app-search-item-name">${app.name}</span><span class="app-search-item-url">${app.url.replace(/=$/, "")}…</span></div>`; }).join(""); dropdown.classList.add("visible"); };
const hideAppSearchDropdown = () => { const d = getEl("#appSearchDropdown"); if (d) d.classList.remove("visible"); };
const performAppSearch = () => { const sb = getEl("#searchBox"); if (!sb) return; const val = sb.value.trim(); if (!val.startsWith("@")) return; const app = searchApp(val); if (app) { hideAppSearchDropdown(); hideIntelBox(); let searchUrl; if (app.name === "AliExpress") searchUrl = app.url.replace("wholesale-", "wholesale-" + encodeURIComponent("")); else if (app.placeholder) searchUrl = app.url.replace(app.placeholder + "=", app.placeholder + "=" + encodeURIComponent("")); else searchUrl = app.url + encodeURIComponent(""); updateHistory(`@${app.name}`); window.location.href = searchUrl; } };
const handleAppSearchClick = () => { const sb = getEl("#searchBox"); if (!sb) return; const val = sb.value; if (val === "") { sb.value = "@"; sb.focus(); showAppSearchDropdown(""); } else if (val === "@") { sb.value = ""; hideAppSearchDropdown(); hideIntelBox(); } else if (val.startsWith("@")) { const si = val.indexOf(" "); if (si > 0) sb.value = val.substring(0, si); else sb.value = ""; hideAppSearchDropdown(); hideIntelBox(); } else { sb.value = val + "@"; sb.focus(); showAppSearchDropdown(""); } };
const selectFirstDropdownItem = () => { const dropdown = getEl("#appSearchDropdown"); if (!dropdown || !dropdown.classList.contains("visible")) return false; const first = dropdown.querySelector(".app-search-item"); if (!first) return false; const name = first.dataset.name; hideAppSearchDropdown(); hideIntelBox(); const app = APP_SEARCH_DATA.find(a => a.name === name); if (app) { showIntelBox(app.name, app.url); const sb = getEl("#searchBox"); if (sb) sb.focus(); let searchUrl; if (app.name === "AliExpress") searchUrl = app.url.replace("wholesale-", "wholesale-" + encodeURIComponent("")); else if (app.placeholder) searchUrl = app.url.replace(app.placeholder + "=", app.placeholder + "=" + encodeURIComponent("")); else searchUrl = app.url + encodeURIComponent(""); updateHistory(`@${name}`); window.location.href = searchUrl; } return true; };
const filterAppDropdown = () => { const sb = getEl("#searchBox"); if (!sb) return; const val = sb.value; const ai = val.lastIndexOf("@"); if (ai >= 0) { const after = val.substring(ai + 1); if (!after.includes(" ")) showAppSearchDropdown(after); else hideAppSearchDropdown(); } else hideAppSearchDropdown(); };
const performSearch = (query) => { const q = query.trim(); if (!q) return; updateHistory(q); let url = ""; switch (searchEngine) { case "google": url = `https://www.google.com/search?q=${encodeURIComponent(q)}`; break; case "bing": url = `https://www.bing.com/search?q=${encodeURIComponent(q)}`; break; case "yahoo": url = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(q)}`; break; case "duckduckgo": url = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`; break; case "nenara": url = `https://www.naenara.com.kp/main/search_first?sVal=${encodeURIComponent(q)}`; break; case "neighb": url = `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`; break; default: url = `https://www.google.com/search?q=${encodeURIComponent(q)}`; break; } window.location.href = url; };
const showHistoryDialog = () => { const history = getHistory(); createNewtabDialog(t("searchHistory"), (content, dialog) => { if (!content || !dialog) { console.error("[History] Dialog content or dialog element missing."); return; } if (history.length === 0) { const empty = document.createElement("p"); empty.className = "dialog-empty"; empty.textContent = t("historyEmpty"); content.appendChild(empty); console.log("[History] Dialog opened with no history."); return; } const list = document.createElement("ul"); history.slice(-40).reverse().forEach((item) => { const query = typeof item === "string" ? item : item?.query; if (!query) { console.error("[History] Skipped invalid history item."); return; } const time = typeof item === "string" ? null : item?.time; const dateStr = time ? formatDateTime(new Date(time)) : ""; const li = document.createElement("li"); const queryText = document.createElement("span"); queryText.textContent = query; const timeText = document.createElement("span"); timeText.textContent = dateStr; timeText.style.color = "#999"; timeText.style.fontSize = "12px"; timeText.style.whiteSpace = "nowrap"; li.append(queryText, timeText); li.addEventListener("click", () => { closeNewtabDialog(dialog, "history item"); if (query.startsWith("http://") || query.startsWith("https://")) { console.log(`[History] Opening URL from history: ${query}`); window.location.href = query; } else { console.log(`[History] Searching history item: ${query}`); performSearch(query); } }); list.appendChild(li); }); content.appendChild(list); console.log(`[History] Dialog rendered: ${list.children.length} item(s).`); }); console.log("[History] Dialog requested."); };
const closeNewtabDialog = (dialog, reason = "close") => { if (!dialog) { console.error("[Dialog] Close failed: element missing."); return; } if (!document.body.contains(dialog)) { console.error("[Dialog] Close ignored: dialog is not attached."); return; } if (dialog.dataset.closing === "true") { console.log(`[Dialog] Close already running: ${reason}`); return; } if (reason === "replaced") { dialog.remove(); console.log("[Dialog] Replaced dialog removed immediately."); return; } dialog.dataset.closing = "true"; dialog.setAttribute("aria-hidden", "true"); dialog.classList.remove("is-open"); dialog.classList.add("is-closing"); const removeDialog = () => { if (dialog.parentNode) dialog.remove(); console.log(`[Dialog] Dialog closed: ${reason}`); }; window.setTimeout(removeDialog, 170); };
const createNewtabDialog = (titleText, contentBuilder) => { if (!document.body) { console.error("[Settings] document.body not found."); return null; } const existing = document.querySelector(".newtab-dialog"); if (existing) closeNewtabDialog(existing, "replaced"); const dialog = document.createElement("div"); dialog.className = "newtab-dialog"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true"); const content = document.createElement("div"); content.className = "newtab-dialog-content"; const header = document.createElement("div"); header.className = "newtab-dialog-header"; const title = document.createElement("h3"); title.className = "newtab-dialog-title"; title.textContent = titleText; const closeBtn = document.createElement("button"); closeBtn.type = "button"; closeBtn.className = "newtab-dialog-close"; closeBtn.setAttribute("aria-label", t("close")); closeBtn.textContent = "×"; closeBtn.addEventListener("click", () => closeNewtabDialog(dialog, "button")); header.append(title, closeBtn); content.appendChild(header); if (typeof contentBuilder !== "function") console.error("[Settings] Dialog content builder missing."); else contentBuilder(content, dialog); dialog.appendChild(content); dialog.addEventListener("click", (event) => { if (event.target === dialog) closeNewtabDialog(dialog, "backdrop"); }); document.body.appendChild(dialog); requestAnimationFrame(() => { if (!document.body.contains(dialog)) { console.error(`[Dialog] Open animation cancelled: ${titleText}`); return; } dialog.classList.add("is-open"); closeBtn.focus(); console.log(`[Dialog] Dialog opened: ${titleText}`); }); return dialog; };
const createSettingsSection = (parent, titleText) => { const section = document.createElement("section"); section.className = "newtab-settings-section"; const title = document.createElement("h4"); title.className = "newtab-settings-section-title"; title.textContent = titleText; section.appendChild(title); parent.appendChild(section); return section; };
const createSettingsLink = (parent, label, url) => { if (!parent) { console.error(`[Settings] Link button parent missing: ${label}`); return null; } if (!url) { console.error(`[Settings] Link URL missing: ${label}`); return null; } const button = document.createElement("button"); button.type = "button"; button.className = "newtab-settings-link"; button.textContent = label; button.title = label; button.addEventListener("click", () => { try { const opened = window.open(url, "_blank", "noopener,noreferrer"); if (!opened) { console.error(`[Settings] Could not open link: ${url}`); return; } console.log(`[Settings] Opened link: ${url}`); } catch (error) { console.error(`[Settings] Link open failed: ${url}`, error); } }); parent.appendChild(button); return button; };
const createChoiceButton = (parent, label, value, currentValue, onSelect) => { const button = document.createElement("button"); button.type = "button"; button.className = "newtab-settings-choice"; button.textContent = label; button.dataset.value = value; button.setAttribute("aria-pressed", String(value === currentValue)); button.addEventListener("click", () => { if (typeof onSelect !== "function") { console.error(`[Settings] Choice handler missing: ${label}`); return; } onSelect(value); }); parent.appendChild(button); return button; };
const refreshChoiceButtons = (group, selectedValue) => { if (!group) { console.error("[Settings] Choice group missing."); return; } group.querySelectorAll(".newtab-settings-choice").forEach((button) => { button.setAttribute("aria-pressed", String(button.dataset.value === selectedValue)); }); };
const renderCustomShortcutDialogList = (listRoot, dialog) => { if (!listRoot) { console.error("[Settings] Custom shortcut list root missing."); return; } listRoot.replaceChildren(); for (const shortcut of customShortcutsCache) { const entry = document.createElement("div"); entry.className = "newtab-shortcut-entry"; const iconWrap = document.createElement("div"); iconWrap.className = "newtab-shortcut-entry-icon"; const iconUrl = customShortcutIconUrls.get(shortcut.id); if (iconUrl) { const img = document.createElement("img"); img.src = iconUrl; img.alt = ""; img.width = 32; img.height = 32; img.decoding = "async"; img.addEventListener("error", () => { console.error(`[Settings] Custom dialog icon failed: ${shortcut.name}`); img.remove(); }, { once: true }); iconWrap.appendChild(img); } else iconWrap.textContent = shortcut.name.slice(0, 1); const info = document.createElement("div"); info.className = "newtab-shortcut-entry-info"; const name = document.createElement("div"); name.className = "newtab-shortcut-entry-name"; name.textContent = shortcut.name; const url = document.createElement("div"); url.className = "newtab-shortcut-entry-url"; url.textContent = shortcut.url; info.append(name, url); const deleteButton = document.createElement("button"); deleteButton.type = "button"; deleteButton.className = "newtab-settings-danger"; deleteButton.textContent = t("delete"); deleteButton.addEventListener("click", async () => { const index = customShortcutsCache.findIndex(item => item.id === shortcut.id); if (index < 0) { console.error(`[Settings] Custom shortcut not found: ${shortcut.name}`); return; } const [removed] = customShortcutsCache.splice(index, 1); const saved = await saveCustomShortcuts(); await settingsDelete(`${CUSTOM_SHORTCUT_ICON_PREFIX}${removed.id}`); const iconUrlToRelease = customShortcutIconUrls.get(removed.id); if (iconUrlToRelease) { try { URL.revokeObjectURL(iconUrlToRelease); } catch (error) { console.error("[Settings] Icon URL revoke failed:", error); } customShortcutIconUrls.delete(removed.id); } if (!saved) { console.error(`[Settings] Custom shortcut metadata save failed after deleting: ${removed.name}`); return; } renderCustomShortcutDialogList(listRoot, dialog); renderShortcuts(window._iconMap || new Map()); console.log(`[Settings] Custom shortcut deleted: ${removed.name}`); }); entry.append(iconWrap, info, deleteButton); listRoot.appendChild(entry); } console.log(`[Settings] Custom shortcut dialog list rendered: ${customShortcutsCache.length} item(s).`); };
const showCustomizeDialog = () => { createNewtabDialog(t("customize"), (content, dialog) => { const shortcutSection = createSettingsSection(content, t("shortcut")); const addRow = document.createElement("div"); addRow.className = "newtab-settings-row"; const urlInput = document.createElement("input"); urlInput.type = "url"; urlInput.placeholder = t("urlPlaceholder"); urlInput.autocomplete = "off"; urlInput.inputMode = "url"; const nameInput = document.createElement("input"); nameInput.type = "text"; nameInput.placeholder = t("labelPlaceholder"); nameInput.maxLength = 80; nameInput.autocomplete = "off"; const addButton = document.createElement("button"); addButton.type = "button"; addButton.className = "newtab-settings-action"; addButton.textContent = t("add"); const listRoot = document.createElement("div"); listRoot.className = "newtab-shortcut-list"; const addShortcut = async () => { const name = nameInput.value.trim(); const normalizedUrl = normalizeShortcutUrl(urlInput.value); if (!name) { console.error("[Settings] Custom shortcut add blocked: label is empty."); nameInput.focus(); return; } if (!normalizedUrl) { console.error("[Settings] Custom shortcut add blocked: invalid URL."); urlInput.focus(); return; } const existing = customShortcutsCache.find(shortcut => shortcut.url.toLowerCase() === normalizedUrl.toLowerCase()); if (existing) { console.error(`[Settings] Custom shortcut already exists: ${existing.name}`); return; } const id = typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : `shortcut-${Date.now()}-${Math.random().toString(36).slice(2)}`; const iconKey = id; const shortcut = { id, name, url: normalizedUrl, iconKey }; const faviconSaved = await fetchAndStoreFavicon(id, normalizedUrl); if (!faviconSaved) console.error(`[Settings] Custom shortcut added without stored favicon: ${name}`); customShortcutsCache.unshift(shortcut); const saved = await saveCustomShortcuts(); if (!saved) { customShortcutsCache.shift(); await settingsDelete(`${CUSTOM_SHORTCUT_ICON_PREFIX}${iconKey}`); const orphanUrl = customShortcutIconUrls.get(id); if (orphanUrl) { try { URL.revokeObjectURL(orphanUrl); } catch (error) { console.error("[Settings] Orphan icon URL revoke failed:", error); } customShortcutIconUrls.delete(id); } console.error(`[Settings] Custom shortcut add failed: ${name}`); return; } urlInput.value = ""; nameInput.value = ""; renderCustomShortcutDialogList(listRoot, dialog); renderShortcuts(window._iconMap || new Map()); console.log(`[Settings] Custom shortcut added: ${name} -> ${normalizedUrl}`); urlInput.focus(); }; addButton.addEventListener("click", () => { addShortcut().catch(error => console.error("[Settings] Custom shortcut add error:", error)); }); urlInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); addShortcut().catch(error => console.error("[Settings] Custom shortcut add error:", error)); } }); nameInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); addShortcut().catch(error => console.error("[Settings] Custom shortcut add error:", error)); } }); addRow.append(urlInput, nameInput, addButton); shortcutSection.appendChild(addRow); shortcutSection.appendChild(listRoot); renderCustomShortcutDialogList(listRoot, dialog); const appearanceSection = createSettingsSection(content, t("appearance")); const wallpaperRow = document.createElement("div"); wallpaperRow.className = "newtab-settings-row"; createSettingsLink(wallpaperRow, t("changeWallpaper"), "https://search3958.github.io/project/images/2/"); appearanceSection.appendChild(wallpaperRow); const labelRow = document.createElement("div"); labelRow.className = "newtab-settings-row"; const labelTitle = document.createElement("span"); labelTitle.textContent = t("labelVisibility"); labelRow.appendChild(labelTitle); const labelChoices = document.createElement("div"); labelChoices.className = "newtab-settings-row"; const currentLabelVisible = getLabelVisibleSetting(); createChoiceButton(labelChoices, t("show"), "true", String(currentLabelVisible), (value) => { const saved = saveAppearanceSetting(LABEL_VISIBLE_KEY, value); if (!saved) return; const root = getEl("#mainShortcuts"); if (!root) { console.error("[Settings] #mainShortcuts missing while changing labels."); return; } root.dataset.labelVisible = value; refreshChoiceButtons(labelChoices, value); console.log(`[Settings] Label visibility changed: ${value}`); }); createChoiceButton(labelChoices, t("hide"), "false", String(currentLabelVisible), (value) => { const saved = saveAppearanceSetting(LABEL_VISIBLE_KEY, value); if (!saved) return; const root = getEl("#mainShortcuts"); if (!root) { console.error("[Settings] #mainShortcuts missing while changing labels."); return; } root.dataset.labelVisible = value; refreshChoiceButtons(labelChoices, value); console.log(`[Settings] Label visibility changed: ${value}`); }); appearanceSection.appendChild(labelRow); appearanceSection.appendChild(labelChoices); const iconSizeRow = document.createElement("div"); iconSizeRow.className = "newtab-settings-row"; const iconSizeTitle = document.createElement("span"); iconSizeTitle.textContent = t("iconSize"); const iconSizeChoices = document.createElement("div"); iconSizeChoices.className = "newtab-settings-row"; const currentIconSize = getIconSizeSetting(); const applyIconSize = (value) => { const saved = saveAppearanceSetting(ICON_SIZE_KEY, value); if (!saved) return; const root = getEl("#mainShortcuts"); if (!root) { console.error("[Settings] #mainShortcuts missing while changing icon size."); return; } root.dataset.iconSize = value; refreshChoiceButtons(iconSizeChoices, value); console.log(`[Settings] Icon size changed: ${value}`); }; createChoiceButton(iconSizeChoices, t("standard"), "standard", currentIconSize, applyIconSize); createChoiceButton(iconSizeChoices, t("large"), "large", currentIconSize, applyIconSize); createChoiceButton(iconSizeChoices, t("extraLarge"), "extra-large", currentIconSize, applyIconSize); iconSizeRow.appendChild(iconSizeTitle); appearanceSection.appendChild(iconSizeRow); appearanceSection.appendChild(iconSizeChoices); }); console.log("[Settings] Customize dialog requested."); };
const showManagementDialog = () => { createNewtabDialog(t("managementTitle"), (content) => { const newtabSection = createSettingsSection(content, t("saetab")); const newtabLinks = document.createElement("div"); newtabLinks.className = "newtab-settings-links"; createSettingsLink(newtabLinks, t("settingsDetails"), "https://search3958.github.io/i/newtab/"); createSettingsLink(newtabLinks, t("simpleVersion"), "https://search3958.github.io/newtab/newtab-simple"); newtabSection.appendChild(newtabLinks); const dataSection = createSettingsSection(content, t("data")); const resetButton = document.createElement("button"); resetButton.type = "button"; resetButton.className = "newtab-settings-action"; resetButton.textContent = t("resetSettings"); resetButton.addEventListener("click", () => { resetNewtabSettings().catch(error => console.error("[Settings] Newtab reset error:", error)); }); dataSection.appendChild(resetButton); const deleteHistoryButton = document.createElement("button"); deleteHistoryButton.type = "button"; deleteHistoryButton.className = "newtab-settings-danger"; deleteHistoryButton.textContent = t("deleteHistory"); deleteHistoryButton.addEventListener("click", deleteSearchHistory); dataSection.appendChild(deleteHistoryButton); const infoSection = createSettingsSection(content, t("information")); const infoLinks = document.createElement("div"); infoLinks.className = "newtab-settings-links"; createSettingsLink(infoLinks, t("termsPrivacy"), "https://search3958.github.io/policies/"); createSettingsLink(infoLinks, t("aboutMe"), "https://search3958.github.io/"); createSettingsLink(infoLinks, t("language"), "https://search3958.github.io/accounts/lang?next=https://search3958.github.io/newtab/"); infoSection.appendChild(infoLinks); }); console.log("[Settings] Management dialog requested."); };
const setupSettingsControls = () => { const customizeBtn = getEl("#customizeBtn"); const managementBtn = getEl("#managementBtn"); if (!customizeBtn) console.error("[Settings] Required element not found: #customizeBtn"); else customizeBtn.addEventListener("click", showCustomizeDialog); if (!managementBtn) console.error("[Settings] Required element not found: #managementBtn"); else managementBtn.addEventListener("click", showManagementDialog); document.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; const dialog = document.querySelector(".newtab-dialog"); if (dialog) { event.preventDefault(); closeNewtabDialog(dialog, "Escape"); } }); console.log("[Settings] Settings controls initialized."); };
const getRequiredElement = (selector) => { const el = document.querySelector(selector); if (!el) console.error(`[Shortcut] Required element not found: ${selector}`); return el; };
const createShortcut = (link, iconMap) => { if (!link || typeof link !== "object") return null; if (!link.name || !link.url) return null; const anchor = document.createElement("a"); anchor.className = "main-shortcut-item"; anchor.href = link.url; anchor.rel = "noopener noreferrer"; const box = document.createElement("div"); box.className = "main-shortcut-box"; const iconContainer = document.createElement("div"); iconContainer.className = "main-shortcut-icon"; if (link.bg) iconContainer.style.background = link.bg; const iconUrl = link.iconUrl || resolveIconUrl(link.icon, iconMap); if (iconUrl) { const img = document.createElement("img"); img.src = iconUrl; img.alt = ""; img.loading = "lazy"; img.decoding = "async"; img.addEventListener("error", () => { console.error(`[Shortcut] Icon failed: ${link.icon}`); img.remove(); }, { once: true }); iconContainer.appendChild(img); } box.appendChild(iconContainer); const name = document.createElement("span"); name.className = "main-shortcut-name"; name.textContent = link.name; anchor.appendChild(box); anchor.appendChild(name); anchor.addEventListener("mousemove", (e) => { const rect = box.getBoundingClientRect(); const x = (e.clientX - rect.left - rect.width / 2) / rect.width; const y = (e.clientY - rect.top - rect.height / 2) / rect.height; box.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`; }); anchor.addEventListener("mouseleave", () => { box.style.transform = "rotateX(0deg) rotateY(0deg)"; }); return anchor; };
const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151036058675874";
const ADSENSE_CLIENT = "ca-pub-6151036058675874";
const ADSENSE_SLOT = "6909508295";
let adsenseScriptPromise = null;
const ensureAdsenseScript = () => {
if (!document.head) { console.error("[ShortcutAd] document.head not found."); return Promise.resolve(false); }
if (adsenseScriptPromise) return adsenseScriptPromise;
const existing = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
if (existing) {
console.log("[ShortcutAd] AdSense script already exists.");
if (window.adsbygoogle) { adsenseScriptPromise = Promise.resolve(true); return adsenseScriptPromise; }
adsenseScriptPromise = new Promise((resolve) => {
let settled = false;
const finish = (success) => { if (settled) return; settled = true; existing.removeEventListener("load", onLoad); existing.removeEventListener("error", onError); if (success) console.log("[ShortcutAd] Existing AdSense script loaded."); else console.error("[ShortcutAd] Existing AdSense script failed to load."); resolve(success); };
const onLoad = () => finish(true);
const onError = (event) => { console.error("[ShortcutAd] Existing AdSense script load error:", event); finish(false); };
existing.addEventListener("load", onLoad, { once: true });
existing.addEventListener("error", onError, { once: true });
window.setTimeout(() => { if (window.adsbygoogle) finish(true); else finish(false); }, 0);
});
return adsenseScriptPromise;
}
const script = document.createElement("script");
script.async = true;
script.src = ADSENSE_SCRIPT_SRC;
script.crossOrigin = "anonymous";
adsenseScriptPromise = new Promise((resolve) => {
script.addEventListener("load", () => { console.log("[ShortcutAd] AdSense script loaded."); resolve(true); }, { once: true });
script.addEventListener("error", (event) => { console.error("[ShortcutAd] AdSense script failed to load.", event); resolve(false); }, { once: true });
document.head.appendChild(script);
console.log("[ShortcutAd] AdSense script appended.");
});
return adsenseScriptPromise;
};
const createShortcutAd = () => {
const wrapper = document.createElement("div");
wrapper.className = "main-shortcut-ad";
const ad = document.createElement("ins");
ad.className = "adsbygoogle";
ad.style.display = "block";
ad.dataset.adClient = ADSENSE_CLIENT;
ad.dataset.adSlot = ADSENSE_SLOT;
ad.dataset.adFormat = "auto";
ad.dataset.fullWidthResponsive = "true";
wrapper.appendChild(ad);
console.log(`[ShortcutAd] Ad slot created: ${ADSENSE_SLOT}`);
return wrapper;
};
const requestShortcutAds = async (root) => {
if (!root) { console.error("[ShortcutAd] Root element is missing."); return; }
const ads = Array.from(root.querySelectorAll(".main-shortcut-ad ins.adsbygoogle"));
if (ads.length === 0) { console.error("[ShortcutAd] No ad slots found in rendered DOM."); return; }
const scriptReady = await ensureAdsenseScript();
if (!scriptReady) { console.error("[ShortcutAd] AdSense script is not ready."); return; }
window.adsbygoogle = window.adsbygoogle || [];
let requestedCount = 0;
for (const ad of ads) {
if (!ad) { console.error("[ShortcutAd] Ad element is missing."); continue; }
if (ad.dataset.shortcutAdRequested === "true") { console.log("[ShortcutAd] Ad already requested; skipped."); continue; }
if (ad.getAttribute("data-adsbygoogle-status")) { ad.dataset.shortcutAdRequested = "true"; console.log("[ShortcutAd] Ad already initialized by AdSense; skipped."); continue; }
try {
window.adsbygoogle.push({});
ad.dataset.shortcutAdRequested = "true";
requestedCount += 1;
console.log(`[ShortcutAd] Ad requested successfully: slot=${ADSENSE_SLOT}`);
} catch (error) { console.error("[ShortcutAd] Ad request failed.", error, ad); }
}
console.log(`[ShortcutAd] Ad request processing completed: ${requestedCount}/${ads.length}`);
};
const renderShortcuts = (iconMap) => {
const root = getRequiredElement("#mainShortcuts");
if (!root) return;
root.replaceChildren();
const fragment = document.createDocumentFragment();
const categories = getShortcutCategories();
let renderedCategoryCount = 0;
let adSlotCount = 0;
for (const category of categories) {
if (!category || !Array.isArray(category.links)) { console.error("[Shortcut] Skipped invalid category."); continue; }
const section = document.createElement("section");
section.className = "main-shortcut-category";
const title = document.createElement("h2");
title.className = "main-shortcut-title";
title.textContent = category.title || "";
const links = document.createElement("div");
links.className = "main-shortcut-links";
for (const link of category.links) { const sc = createShortcut(link, iconMap); if (sc) links.appendChild(sc); }
section.append(title, links);
fragment.appendChild(section);
renderedCategoryCount += 1;
if (renderedCategoryCount === 5) { const adWrapper = createShortcutAd(); if (adWrapper) { fragment.appendChild(adWrapper); adSlotCount += 1; console.log("[ShortcutAd] Inserted ad after the 5th category."); } }
}
const finalAdWrapper = createShortcutAd();
if (finalAdWrapper) { fragment.appendChild(finalAdWrapper); adSlotCount += 1; console.log("[ShortcutAd] Inserted final ad at the bottom of the shortcut list."); }
root.appendChild(fragment);
console.log(`[Shortcut] Rendered ${renderedCategoryCount} categories and ${adSlotCount} ad slot(s).`);
requestShortcutAds(root).catch(error => console.error("[ShortcutAd] Ad request processing failed:", error));
};
const setupSearchAndHistory = () => {
const searchBox = getEl("#searchBox");
const searchButton = getEl("#searchButton");
const clearHistoryBtn = getEl("#clearHistory");
const appSearchBtn = getEl("#appSearchBtn");
if (!searchBox) console.error("[Search] Required element not found: #searchBox");
if (!searchButton) console.error("[Search] Required element not found: #searchButton");
if (!clearHistoryBtn) console.error("[Search] Required element not found: #clearHistory");
if (!appSearchBtn) console.error("[Search] Required element not found: #appSearchBtn");
appSearchIconMap = window._iconMap || new Map();
console.log(`[Search] Icon map ready: ${appSearchIconMap.size} item(s).`);
if (!searchBox) return;
searchBox.addEventListener("keydown", (e) => {
const dropdown = getEl("#appSearchDropdown");
const mainDropdown = getEl(`#${MAIN_SUGGESTION_ID}`);
const isAtMode = searchBox.value.trimStart().startsWith("@");
if (isAtMode) {
if (e.key === "Tab") { e.preventDefault(); const atValue = searchBox.value.trim(); const appQuery = atValue.slice(1).trim(); const matches = APP_SEARCH_DATA.filter(app => app.name.toLowerCase().startsWith(appQuery.toLowerCase())); if (matches.length > 0) { searchBox.value = `@${matches[0].name} `; searchBox.focus(); hideAppSearchDropdown(); hideMainSuggestions("@ Tab completed"); console.log(`[AppSearch] Tab completed: ${searchBox.value}`); } else console.log("[AppSearch] Tab: no matching app."); return; }
if (e.key === "Enter") { e.preventDefault(); hideMainSuggestions("@ Enter"); const value = searchBox.value.trim(); const si = value.indexOf(" "); if (si > 0) { const app = searchApp(value.slice(0, si)); if (app) { performAppSearch(); return; } } const app = searchApp(value); if (app) { performAppSearch(); return; } performSearch(value); return; }
if (e.key === "Escape") { e.preventDefault(); hideAppSearchDropdown(); hideMainSuggestions("Escape in @ mode"); hideIntelBox(); console.log("[AppSearch] Escape closed suggestions."); return; }
return;
}
hideAppSearchDropdown();
if (e.key === "Tab") { if (mainSuggestionItems.length > 0) { e.preventDefault(); applyMainSuggestion(0, "tab"); } else console.log("[MainSuggestion] Tab: no visible candidate."); return; }
if (e.key === "Enter") { const top = mainSuggestionItems[0]; if (top?.action === "open" && top.url) { e.preventDefault(); applyMainSuggestion(0, "enter"); return; } e.preventDefault(); const value = searchBox.value.trim(); if (!value) { console.log("[Search] Enter ignored: empty query."); return; } performSearch(value); return; }
if (e.key === "Escape") { if ((mainDropdown && mainDropdown.style.display !== "none") || (getEl("#intelBox")?.classList.contains("visible"))) { e.preventDefault(); hideMainSuggestions("Escape"); hideIntelBox(); console.log("[MainSuggestion] Escape closed suggestions."); } return; }
});
searchBox.addEventListener("input", () => { const value = searchBox.value; const trimmed = value.trim(); if (trimmed.startsWith("@")) { hideMainSuggestions("@ mode active"); filterAppDropdown(); console.log(`[Search] @ mode: ${value}`); return; } hideAppSearchDropdown(); scheduleMainSuggestions(trimmed); hideIntelBox(); console.log(`[Search] Normal input: ${trimmed}`); });
searchBox.addEventListener("focus", () => { const trimmed = searchBox.value.trim(); if (trimmed.startsWith("@")) { filterAppDropdown(); hideMainSuggestions("@ focus"); } else if (trimmed) scheduleMainSuggestions(trimmed); console.log(`[Search] Focus: ${trimmed}`); });
searchBox.addEventListener("blur", () => { console.log("[Search] Blur: suggestions remain available."); });
const dropdownEl = getEl("#appSearchDropdown");
if (dropdownEl) dropdownEl.addEventListener("mousedown", (e) => e.preventDefault());
else console.error("[Search] Required element not found: #appSearchDropdown");
const mainDropdown = ensureMainSuggestionDropdown();
if (mainDropdown) { mainDropdown.addEventListener("mousedown", (e) => e.preventDefault()); mainDropdown.addEventListener("click", (e) => { const button = e.target.closest(".app-search-item"); if (!button || !mainDropdown.contains(button)) return; const index = Number(button.dataset.index); if (!Number.isInteger(index)) { console.error("[MainSuggestion] Invalid candidate index."); return; } applyMainSuggestion(index, "click"); }); }
if (searchButton) searchButton.addEventListener("click", () => { const val = searchBox.value.trim(); if (!val) { console.log("[Search] Button ignored: empty query."); return; } if (val.startsWith("@")) performAppSearch(); else { const top = mainSuggestionItems[0]; if (top?.action === "open" && top.url) applyMainSuggestion(0, "enter"); else performSearch(val); } });
if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", showHistoryDialog);
if (appSearchBtn) appSearchBtn.addEventListener("click", () => { hideMainSuggestions("manual app-search activation"); handleAppSearchClick(); console.log("[AppSearch] App-search button clicked."); });
document.addEventListener("click", (e) => { const dropdown = getEl("#appSearchDropdown"); const appBtn = getEl("#appSearchBtn"); const mainDropdown = getEl(`#${MAIN_SUGGESTION_ID}`); if (dropdown && !dropdown.contains(e.target) && appBtn && !appBtn.contains(e.target) && e.target !== searchBox && !e.target.closest(".app-search-item")) console.log("[AppSearch] Outside click ignored; suggestions remain visible."); if (mainDropdown && !mainDropdown.contains(e.target) && e.target !== searchBox) console.log("[MainSuggestion] Outside click ignored; suggestions remain visible."); });
console.log("[Search] Search handlers initialized.");
};
const init = async () => {
console.log("[Wallpaper] Initializing...");
const wallpaperTask = Promise.resolve().then(initWallpaper);
const iconTask = loadIconsFromZip();
try { const iconMap = await iconTask; window._iconMap = iconMap; } catch (error) { console.error("[Shortcut] Icon init failed.", error); window._iconMap = new Map(); }
await wallpaperTask;
try { await loadCustomShortcutData(); } catch (error) { customShortcutsCache = []; console.error("[Settings] Custom shortcut init failed:", error); }
applyUILanguage();
applyAppearanceSettings();
if (window.renderShortcuts && window._iconMap) { try { window.renderShortcuts(window._iconMap); } catch (e) { console.error("[v7] renderShortcuts failed:", e); if (window.renderShortcuts) window.renderShortcuts(new Map()); } }
if (window.setupSearchAndHistory) window.setupSearchAndHistory();
setupSettingsControls();
console.log("[Wallpaper] Initialization completed.");
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
window.renderShortcuts = renderShortcuts;
window.setupSearchAndHistory = setupSearchAndHistory;
})();
