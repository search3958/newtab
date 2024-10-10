// セクション情報をオブジェクトで管理
const sections = [
  {
    title: {
      en: "Google",
      ja: "グーグル",
      zh: "谷歌"
    },
    links: [
      { href: "https://mail.google.com", src: "https://search3958.github.io/newtab/gmail.png", content: "Gmail" },
      { href: "https://classroom.google.com", src: "https://search3958.github.io/newtab/classroom.png", content: "Classroom" },
      { href: "https://youtube.com", src: "https://search3958.github.io/newtab/youtube.png", content: "Youtube" },
      { href: "https://docs.google.com", src: "https://search3958.github.io/newtab/document.png", content: "Document" },
      { href: "https://docs.google.com/presentation/", src: "https://search3958.github.io/newtab/slide.png", content: "Slide" },
      { href: "https://docs.google.com/spreadsheet/", src: "https://search3958.github.io/newtab/spreadsheet.png", content: "Spreadsheet" },
      { href: "https://translate.google.com", src: "https://search3958.github.io/newtab/translate.png", content: "Translate" },
      { href: "https://gemini.google.com", src: "https://search3958.github.io/newtab/gemini.png", content: "Gemini" },
      { href: "https://about.google/products", src: "https://search3958.github.io/newtab/product.png", content: "Product" }
    ]
  },
  {
    title: {
      en: "Learning and productivity",
      ja: "学習と作業効率化",
      zh: "学习和工作效率"
    },
    links: [
      { href: "https://app.monoxer.com", src: "https://search3958.github.io/newtab/monoxer.png", content: "Monoxer" },
      { href: "https://chatgpt.com", src: "https://search3958.github.io/newtab/chatgpt.png", content: "Chat GPT" },
      { href: "https://copilot.microsoft.com", src: "https://search3958.github.io/newtab/copilot.png", content: "Copilot" },
      { href: "https://codepen.io", src: "https://search3958.github.io/newtab/codepen.png", content: "Codepen" },
      { href: "https://wikipedia.org", src: "https://search3958.github.io/newtab/wikipedia.png", content: "Wikipedia" },
      { href: "https://canva.com", src: "https://search3958.github.io/newtab/canva.png", content: "Canva" },
      { href: "https://turbowarp.ore", src: "https://search3958.github.io/newtab/turbowarp.png", content: "TurboWarp" }
    ]
  },
  {
    title: {
      en: "Shopping",
      ja: "ショッピング",
      zh: "购物"
    },
    links: [
      { href: "https://www.amazon.co.jp/", src: "https://search3958.github.io/newtab/amazon.png", content: "Amazon" },
      { href: "https://ja.aliexpress.com/", src: "https://search3958.github.io/newtab/aliexpress.png", content: "AliExpress" },
      { href: "https://www.wish.com/ja", src: "https://search3958.github.io/newtab/wish.png", content: "Wish" },
      { href: "https://jp.mercari.com/", src: "https://search3958.github.io/newtab/mercali.png", content: "Mercali" },
      { href: "https://www.taobao.com/", src: "https://search3958.github.io/newtab/taobao.png", content: "淘宝" }
    ]
  },
  {
    title: {
      en: "Entertainment",
      ja: "娯楽",
      zh: "娱乐"
    },
    links: [
      { href: "https://scratch.mit.edu", src: "https://search3958.github.io/newtab/scratch.png", content: "Scratch" },
      { href: "https://poki.com", src: "https://search3958.github.io/newtab/poki.png", content: "poki" },
      { href: "https://snake.io", src: "https://search3958.github.io/newtab/snakeio.png", content: "Snake.io" },
      { href: "https://www.google.com/logos/2010/pacman10-i.html", src: "https://search3958.github.io/newtab/pacman.png", content: "PACMAN" },
      { href: "https://www.instagram.com/", src: "https://search3958.github.io/newtab/instagram.png", content: "Instagram" },
      { href: "https://www.netflix.com/jp/", src: "https://search3958.github.io/newtab/netflix.png", content: "Netflix" },
      { href: "https://weverse.io/?hl=ja", src: "https://search3958.github.io/newtab/weverse.png", content: "Weverse" }
    ]
  }
];

// タイトルを動的に生成する関数
function createTitle(titleData) {
  const titleDiv = document.createElement('div');
  titleDiv.className = 'title';
  
  const mlBlock = document.createElement('ml-block');
  
  Object.keys(titleData).forEach(lang => {
    const langDiv = document.createElement('div');
    langDiv.setAttribute('data-lang', lang === 'en' ? 'en' : (lang === 'ja' ? 'ja-jp' : 'zh-cn'));
    langDiv.textContent = titleData[lang];
    mlBlock.appendChild(langDiv);
  });

  titleDiv.appendChild(mlBlock);
  return titleDiv;
}

// リンクを動的に生成する関数
function createCustomBox(linkData) {
  const box = document.createElement('custom-box');
  box.setAttribute('href', linkData.href);
  box.setAttribute('src', linkData.src);
  box.setAttribute('content', linkData.content);
  return box;
}

// 各セクションにタイトルとリンクを追加
function populateSections() {
  const sectionsContainer = document.getElementById('sections');
  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    
    // タイトルを追加
    const title = createTitle(section.title);
    sectionDiv.appendChild(title);

    // リンクを追加
    const linksContainer = document.createElement('div');
    section.links.forEach(linkData => {
      const customBox = createCustomBox(linkData);
      linksContainer.appendChild(customBox);
    });

    sectionDiv.appendChild(linksContainer);
    sectionsContainer.appendChild(sectionDiv);
  });
}

// セクションを生成
populateSections();

