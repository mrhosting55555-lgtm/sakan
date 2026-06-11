
const themeToggleBtn = document.querySelector('.theme-toggle'); 
const body = document.body;
themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('light')) {
        body.classList.remove('light');
        themeToggleBtn.textContent = '☀️ '; 
    } else {
        body.classList.add('light');
        themeToggleBtn.textContent = '🌙 '; 
    }
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out'); // إخفاء الشاشة بسلاسة
    }
});