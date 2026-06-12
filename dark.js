
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

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open'); // يضيف أو يحذف كلاس open لتظهر القائمة
});