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
            googleForm.submit();
        }
    });
});
