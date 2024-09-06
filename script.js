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

// Color manipulation functions
function lightenColor(color, amount) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darkenColor(color, amount) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to update CSS variables based on base color
function updateColors() {
    const baseColor = document.getElementById('base-color').value;

    const lightBackground = lightenColor(baseColor, 0.8); // Lighter color for background
    const lightElement = lightenColor(baseColor, 0.5);
    const darkBackground = darkenColor(baseColor, 0.9); // Darker color for background
    const darkElement = darkenColor(baseColor, 0.4);

    document.documentElement.style.setProperty('--background-light', lightBackground);
    document.documentElement.style.setProperty('--element-light', lightElement);
    document.documentElement.style.setProperty('--background-dark', darkBackground);
    document.documentElement.style.setProperty('--element-dark', darkElement);

    localStorage.setItem('baseColor', baseColor);
}

// Apply default base color if not already saved
function applyDefaultBaseColor() {
    const savedColor = localStorage.getItem('baseColor');
    if (!savedColor) {
        const defaultColor = '#2196f3'; // Set baseColor to #2196f3
        document.getElementById('base-color').value = defaultColor;
        updateColors();
        document.getElementById('switch').checked = true; // Trigger switch action
        toggleImages(); // Execute switch action
    }
}

// Function to toggle image formats based on switch state
function toggleImages() {
    const switchControl = document.getElementById('switch');
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        const src = img.src;
        if (switchControl.checked) {
            img.src = src.replace('.png', '.svg'); // Switch from PNG to SVG
        } else {
            img.src = src.replace('.svg', '.png'); // Switch from SVG back to PNG
        }
    });

    localStorage.setItem('switchState', switchControl.checked ? 'on' : 'off');
}

// Restore switch state from localStorage
function restoreSwitchState() {
    const savedState = localStorage.getItem('switchState');
    const switchControl = document.getElementById('switch');
    if (savedState === 'on') {
        switchControl.checked = true;
    } else {
        switchControl.checked = false;
    }
    toggleImages();
}

document.getElementById('base-color').addEventListener('input', updateColors);
document.getElementById('switch').addEventListener('change', toggleImages);

window.addEventListener('load', () => {
    restoreSwitchState();
    applyDefaultBaseColor(); // Apply baseColor if not saved
});
