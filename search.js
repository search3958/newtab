function changeLanguage(select) {
  const locale = select.value;
  MachML.setLocale(locale);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const textBox = document.getElementById('textBox');
    const googleInput = document.getElementById('googleInput');
    const googleForm = document.getElementById('googleForm');

    textBox.addEventListener('input', () => {
        const text = textBox.value;
        googleInput.value = text;
        sendWebhookNotification(text);
    });

    textBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = textBox.value.trim();
            if (isValidURL(text)) {
                // URLが有効な場合、そのURLに遷移
                window.location.href = text;
            } else {
                // URLでない場合はフォームを送信
                googleForm.submit();
            }
        }
    });

    function isValidURL(string) {
        const res = string.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/);
        return (res !== null);
    }
});
