// 1. كود تشغيل وإخفاء شاشة التحميل (Preloader) بسرعة
window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.classList.add("fade-out");
  }
});

// 2. كود فحص وتطبيق الثيم المحفوظ فوراً عند فتح الصفحة (يمنع العودة للدارك مود عند الريفريش)
(function () {
  const savedTheme = localStorage.getItem("theme");
  const body = document.body;
  const themeBtn = document.getElementById("theme-btn");

  if (savedTheme === "light") {
    body.classList.add("light");
    if (themeBtn) themeBtn.textContent = "☀️";
  } else {
    body.classList.remove("light");
    if (themeBtn) themeBtn.textContent = "🌙";
  }
})();

// 3. دالة تبديل الثيم عند الضغط على الزرار
function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById("theme-btn");

  body.classList.toggle("light");

  if (body.classList.contains("light")) {
    if (themeBtn) themeBtn.textContent = "☀️";
    localStorage.setItem("theme", "light"); // حفظ اختيار الفاتح في المتصفح
  } else {
    if (themeBtn) themeBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark"); // حفظ اختيار الداكن في المتصفح
  }
}

// 4. كود تشغيل الـ 3 شرط (يدعم الموبايل في جميع الصفحات navbar أو header)
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener("click", function (e) {
      e.stopPropagation();
      navLinks.classList.toggle("active");
      mobileMenu.classList.toggle("open");
    });

    // إغلاق القائمة تلقائياً عند الضغط على أي رابط بداخلها
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        mobileMenu.classList.remove("open");
      });
    });
  }
});
