// المتغيرات الأساسية
let currentFilter = "all";
let priceFilter = "all";

// دالة الفلترة بالنوع (شباب/بنات)
function filterApartments(type) {
  currentFilter = type;
  render();
}

// دالة الرندر الأساسية
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";

  const searchInput = document.getElementById("searchInput");
  const search = searchInput ? searchInput.value.toLowerCase() : "";

  apartments
    .filter((apt) => {
      const price = parseInt(apt.price);
      let priceMatch = true;
      switch (priceFilter) {
        case "900":
          priceMatch = price <= 900;
          break;
        case "1000":
          priceMatch = price <= 1000;
          break;
        case "1200":
          priceMatch = price <= 1200;
          break;
        case "1500":
          priceMatch = price <= 1500;
          break;
        default:
          priceMatch = true;
      }
      return (
        (currentFilter === "all" || apt.type === currentFilter) &&
        (apt.name.toLowerCase().includes(search) ||
          apt.location.toLowerCase().includes(search)) &&
        (priceFilter === "all" ? true : !isNaN(price) && priceMatch)
      );
    })
    .forEach((apt) => {
      const card = document.createElement("div");
      card.className = "card";

      let ribbonHTML = "";
      if (apt.name.includes("corner-ribbon")) {
        if (apt.name.includes("reserved"))
          ribbonHTML = `<span class="corner-ribbon reserved">محجوزة</span>`;
        else ribbonHTML = `<span class="corner-ribbon available">متاحة</span>`;
      }

      card.innerHTML = `
      ${ribbonHTML}
      <div class="slider">
        ${apt.images
          .map((file, i) => {
            const isActive = i === 0 ? "active" : "";

            if (file.includes("drive.google.com/file/d/")) {
              const embedUrl = file.replace("/view?usp=drive_link", "/preview");
              return `<iframe class="slider-item ${isActive}" src="${embedUrl}" loading="lazy" allow="autoplay" allowfullscreen></iframe>`;
            }

            if (file.endsWith(".mp4")) {
              // خدعة Cloudinary: تحويل رابط الفيديو لصورة عشان نستخدمها كغلاف
              let posterUrl = file.replace(".mp4", ".jpg");

              // ضغط صورة الغلاف عشان نحافظ على سرعة الموقع
              if (posterUrl.includes("res.cloudinary.com/")) {
                posterUrl = posterUrl.replace(
                  "/video/upload/",
                  "/video/upload/f_auto,q_auto,w_800/",
                );
              }

              return `
                <video class="slider-item ${isActive}" controls preload="none" poster="${posterUrl}">
                  <source src="${file}" type="video/mp4">
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              `;
            }

            let optimizedImage = file;
            if (file.includes("res.cloudinary.com/")) {
              optimizedImage = file.replace(
                "/image/upload/",
                "/image/upload/f_auto,q_auto,w_800/",
              );
            }
            return `<img src="${optimizedImage}" loading="lazy" class="slider-item ${isActive}">`;
          })
          .join("")}

        <div class="nav">
          <button onclick="prev(this)">❮</button>
          <button onclick="next(this)">❯</button>
        </div>
      </div>

      <div class="card-content">
        <div class="title">${apt.name.replace(/<span[^>]*>([^<]*)<\/span>/g, "")}</div>
        <div class="action-btn">
          <div class="price-btn">${apt.price || "اتصل لمعرفة السعر"}</div>
          <div class="book-btn" onclick="bookNow('${apt.name.replace(/'/g, "\\'")}', '${apt.location}', '${apt.price}')">احجز</div>
        </div>
      </div>
    `;

      app.appendChild(card);
    });
}

// دوال التقليب
function next(btn) {
  let slider = btn.closest(".slider");
  let items = slider.querySelectorAll(".slider-item");
  if (items.length <= 1) return;

  let index = [...items].findIndex((el) => el.classList.contains("active"));
  items[index].classList.remove("active");
  items[(index + 1) % items.length].classList.add("active");
}

function prev(btn) {
  let slider = btn.closest(".slider");
  let items = slider.querySelectorAll(".slider-item");
  if (items.length <= 1) return;

  let index = [...items].findIndex((el) => el.classList.contains("active"));
  items[index].classList.remove("active");
  items[(index - 1 + items.length) % items.length].classList.add("active");
}

// دالة الحجز
function bookNow(name, location, price) {
  let phone = "201152638852";
  let cleanName = name.replace(/<span[^>]*>([^<]*)<\/span>/g, "").trim();
  let message = `عايز احجز:\n\n${cleanName}\n\nالموقع: ${location}\nالسعر: ${price || "اتصل لمعرفة السعر"}`;
  let url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// دوال الصورة المكبرة
function openFullImg(element) {
  const fullImgBox = document.getElementById("fullImgBox");
  const fullImg = document.getElementById("fullImg");
  if (fullImgBox && fullImg) {
    fullImg.src = element.src;
    fullImgBox.style.display = "flex";
  }
}

function closeFullImg() {
  const fullImgBox = document.getElementById("fullImgBox");
  if (fullImgBox) fullImgBox.style.display = "none";
}

// دوال السعر
function setPriceFilter(value) {
  priceFilter = value;
  render();
}

function togglePriceFilter() {
  const options = document.getElementById("priceOptions");
  const arrow = document.getElementById("arrow");
  if (options && arrow) {
    options.classList.toggle("hide");
    arrow.textContent = options.classList.contains("hide") ? "▼" : "▲";
  }
}

// تشغيل الموقع بعد التحميل
document.addEventListener("DOMContentLoaded", () => {
  render();
});
