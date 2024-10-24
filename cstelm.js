class CustomBox extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // コンテナ作成
        const container = document.createElement('div');
        container.classList.add('container');

        // ボックス作成
        const box = document.createElement('div');
        box.classList.add('box');
        box.style.transform = 'rotateX(0deg) rotateY(0deg)'; // スタイルの追加

        // リンク作成
        const link = document.createElement('a');
        link.id = 'ripple-control';  // ID追加
        link.href = this.getAttribute('href') || '#'; // href属性取得、デフォルトは '#'

        // 画像作成
        const img = document.createElement('img');
        img.src = this.getAttribute('src') || ''; // src属性取得
        img.classList.add('background-on'); // クラス追加

        // imgをリンクに追加
        link.appendChild(img);

        // ripple要素の追加(beta)
        const ripple = document.createElement('md-ripple');
        ripple.id = 'ripple';

        // ボックスにリンクとrippleを追加
        box.appendChild(link);
        box.appendChild(ripple);

        // コンテンツ作成
        const content = document.createElement('div');
        content.classList.add('content');
        content.innerHTML = this.getAttribute('content') || ''; // content属性取得

        // コンテナにボックスとコンテンツを追加
        container.appendChild(box);
        container.appendChild(content);

        // DOMに追加
        this.appendChild(container);
    }
}

// カスタム要素を定義
customElements.define('custom-box', CustomBox);



//ダイアログ(beta)

  const dialog = document.querySelector('#customize-dialog');
  const button = document.querySelector('#customize-button');

  button.addEventListener('click', () => {
    dialog.show();
  });
