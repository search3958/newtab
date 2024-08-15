
<script>
class CustomBox extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const container = document.createElement('div');
        container.classList.add('container');

        const box = document.createElement('div');
        box.classList.add('box');

        const link = document.createElement('a');
        link.href = this.getAttribute('href');

        const img = document.createElement('img');
        img.src = this.getAttribute('src');

        link.appendChild(img);
        box.appendChild(link);
        container.appendChild(box);

        // コンテンツの挿入
        const content = document.createElement('div');
        content.classList.add('content');
        content.innerHTML = this.getAttribute('content');

        container.appendChild(content);

        // サイトのDOMに直接追加
        this.appendChild(container);
    }
}

// カスタム要素を定義
customElements.define('custom-box', CustomBox);

</script>
