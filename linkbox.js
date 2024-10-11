document.addEventListener('DOMContentLoaded', function() {
    // ショートカットデータを定義
    const sections = [
        {
            title: '<ml-block><div data-lang="en">Google</div><div data-lang="ja-jp">Google</div><div data-lang="zh-cn">Google</div></ml-block>',
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
            title: '<ml-block><div data-lang="en">Learning and productivity</div><div data-lang="ja-jp">学習と作業効率化</div><div data-lang="zh-cn">學習和工作效率</div></ml-block>',
            links: [
{ href: "https://app.monoxer.com", src: "https://search3958.github.io/newtab/monoxer.png", content: "Monoxer" },
{ href: "https://chatgpt.com", src: "https://search3958.github.io/newtab/chatgpt.png", content: "Chat GPT" },
{ href: "https://copilot.microsoft.com", src: "https://search3958.github.io/newtab/copilot.png", content: "Copilot" },
{ href: "https://codepen.io", src: "https://search3958.github.io/newtab/codepen.png", content: "Codepen" },
{ href: "https://wikipedia.org", src: "https://search3958.github.io/newtab/wikipedia.png", content: "Wikipedia" },
{ href: "https://canva.com", src: "https://search3958.github.io/newtab/canva.png", content: "Canva" },
{ href: "https://www.office.com/?auth=1", src: "https://search3958.github.io/newtab/microsoft365.png", content: "Microsoft 365" },
{ href: "https://turbowarp.ore", src: "https://search3958.github.io/newtab/turbowarp.png", content: "TurboWarp" }
            ]
        },
      
              {
            title: '<ml-block><div data-lang="en">Shipping</div><div data-lang="ja-jp">ショッピング</div><div data-lang="zh-cn">购物</div></ml-block>',
            links: [
{ href: "https://www.amazon.co.jp/", src: "https://search3958.github.io/newtab/amazon.png", content: "Amazon" },
{ href: "https://ja.aliexpress.com/", src: "https://search3958.github.io/newtab/aliexpress.png", content: "AliExpress" },
{ href: "https://www.wish.com/ja", src: "https://search3958.github.io/newtab/wish.png", content: "Wish" },
{ href: "https://jp.mercari.com/", src: "https://search3958.github.io/newtab/mercali.png", content: "Mercali" },
{ href: "https://www.taobao.com/", src: "https://search3958.github.io/newtab/taobao.png", content: "淘宝" }
            ]
        },
      
              {
            title: '<ml-block><div data-lang="en">Entertainment</div><div data-lang="ja-jp">娯楽</div><div data-lang="zh-cn">娛樂</div></ml-block>',
            links: [
{ href: "https://scratch.mit.edu", src: "https://search3958.github.io/newtab/scratch.png", content: "Scratch" },
{ href: "https://poki.com", src: "https://search3958.github.io/newtab/poki.png", content: "poki" },
{ href: "https://snake.io", src: "https://search3958.github.io/newtab/snakeio.png", content: "Snake.io" },
{ href: "https://www.google.com/logos/2010/pacman10-i.html", src: "https://search3958.github.io/newtab/pacman.png", content: "PACMAN" },
{ href: "https://www.instagram.com/", src: "https://search3958.github.io/newtab/instagram.png", content: "Instagram" },
{ href: "https://www.netflix.com/jp/", src: "https://search3958.github.io/newtab/netflix.png", content: "Netflix" },
{ href: "https://weverse.io/?hl=ja", src: "https://search3958.github.io/newtab/weverse.png", content: "Weverse" }
            ]
        },
    ];

    // 言語設定（デフォルトは 'en' とする）
    const userLang = navigator.language || navigator.userLanguage; // ブラウザの言語設定を取得
    const lang = (userLang.includes('ja')) ? 'ja-jp' : (userLang.includes('zh')) ? 'zh-cn' : 'en';

    // 特定のコンテナに要素を追加する
    const container = document.getElementById('shortcut-container');

    sections.forEach(section => {
        // タイトルを追加
        const titleElement = document.createElement('div');
        titleElement.classList.add('title');
        titleElement.innerHTML = section.title;
        container.appendChild(titleElement);

        // リンク部分を追加
        const linkContainer = document.createElement('div');
        linkContainer.classList.add('link');
        
        section.links.forEach(link => {
            const customBox = document.createElement('custom-box');
            customBox.setAttribute('href', link.href);
            customBox.setAttribute('src', link.src);
            customBox.setAttribute('content', link.content);
            linkContainer.appendChild(customBox);
        });

        container.appendChild(linkContainer);
    });

    // 多言語対応のための関数
    function updateLanguage(lang) {
        const mlBlocks = document.querySelectorAll('ml-block');
        mlBlocks.forEach(block => {
            const divs = block.querySelectorAll('div');
            divs.forEach(div => {
                if (div.getAttribute('data-lang') === lang) {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            });
        });
    }

    // 初期言語を設定
    updateLanguage(lang);
});


