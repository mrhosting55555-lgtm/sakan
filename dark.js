const themeToggleBtn = document.querySelector(".theme-toggle");
const body = document.body;
themeToggleBtn.addEventListener("click", () => {
  if (body.classList.contains("light")) {
    body.classList.remove("light");
    themeToggleBtn.textContent = "☀️ ";
  } else {
    body.classList.add("light");
    themeToggleBtn.textContent = "🌙 ";
  }
});

window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.classList.add("fade-out"); // إخفاء الشاشة بسلاسة
  }
});

// كود فتح وإغلاق القائمة للموبايل وتأثير الأنيميشن للزر
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active"); // فتح/إغلاق القائمة
  mobileMenu.classList.toggle("open"); // تحويل الثلاث شرط إلى X وعكسها
});

// إغلاق القائمة تلقائياً إذا قام المستخدم بالضغط على أي رابط بداخلها
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    mobileMenu.classList.remove("open");
  });
});
