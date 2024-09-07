document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.container');

    containers.forEach(container => {
        const box = container.querySelector('.box');
        
        container.addEventListener('mousemove', (e) => {
            const rect = box.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = -y / 6;
            const rotateY = x / 6;

            box.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        container.addEventListener('mouseleave', () => {
            box.style.transform = 'rotateX(0) rotateY(0)';
        });
    });
});



function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}:${seconds}`;
            document.getElementById('clock').textContent = currentTime;
        }

        setInterval(updateClock, 100);
        updateClock(); // 初回実行してすぐに時刻を表示
    
    
    
    
        // Function to lighten color for light mode
        function lightenColor(color, amount) {
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);

            r = Math.min(255, Math.floor(r + (255 - r) * amount));
            g = Math.min(255, Math.floor(g + (255 - g) * amount));
            b = Math.min(255, Math.floor(b + (255 - b) * amount));


            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        }

        // Function to lighten color for light mode

@@ -64,6 +134,7 @@ function updateClock() {
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }


        // Function to darken color for dark mode
        function darkenColor(color, amount) {
            let r = parseInt(color.slice(1, 3), 16);


@@ -170,45 +241,47 @@

        // Load colors and theme state on page load
        loadColors();


      
 // スイッチの状態を保存する関数
        function saveSwitchState(isChecked) {
            localStorage.setItem('switchState', isChecked ? 'on' : 'off');
        }

        // スイッチの状態に応じて画像のスタイルを変更する関数
        function toggleImages() {
            const switchControl = document.getElementById('switch');
            const images = document.querySelectorAll('img');

            images.forEach(img => {
                const src = img.src;
                if (switchControl.checked) {
                    img.src = src.replace('.png', '.svg'); // pngからsvgに切り替え
                    img.classList.add('background-on'); // 背景色を変更
                } else {
                    img.src = src.replace('.svg', '.png'); // svgからpngに戻す
                    img.classList.remove('background-on'); // 背景色を元に戻す
                }
            });

            saveSwitchState(switchControl.checked); // 状態を保存
        }

        // ページ読み込み時にスイッチの状態を復元する
        function restoreSwitchState() {
            const savedState = localStorage.getItem('switchState');
            const switchControl = document.getElementById('switch');
            if (savedState === 'on') {
                switchControl.checked = true;
            } else {
                switchControl.checked = false;
            }
            toggleImages(); // 保存された状態に応じて画像を切り替える
        }

        document.getElementById('switch').addEventListener('change', toggleImages);

        // ページが読み込まれたときに状態を復元
        window.addEventListener('load', restoreSwitchState);
