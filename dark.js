window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.classList.add("fade-out");
  }
});

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
function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById("theme-btn");

  body.classList.toggle("light");

  if (body.classList.contains("light")) {
    if (themeBtn) themeBtn.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    if (themeBtn) themeBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
}

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
function openFullImg(imgElement) {
  const box = document.getElementById("fullImgBox");
  const fullImg = document.getElementById("fullImg");

  fullImg.src = imgElement.src; // بياخد مسار الصورة اللي اتداس عليها
  box.style.display = "flex"; // بيظهر الصندوق
  document.body.style.overflow = "hidden"; // بيمنع السكرول في الخلفية أثناء الفتح
}

function closeFullImg() {
  const box = document.getElementById("fullImgBox");
  box.style.display = "none"; // بيخفي الصندوق
  document.body.style.overflow = "auto"; // بيرجع السكرول الطبيعي
}
