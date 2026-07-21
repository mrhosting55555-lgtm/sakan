// المتغيرات الأساسية
let currentFilter = "all";
let priceFilter = "all";

// دالة جلب الشقق من السيرفر ودمجها مع القديم
async function fetchApartments() {
  try {
    // تم تعديل الرابط هنا
    const response = await fetch(
      "https://sakan-sigma.vercel.app/api/apartments",
    );
    const data = await response.json();

    // تجهيز الداتا اللي جاية من السيرفر عشان تطابق الشكل القديم
    const newApartments = data.map((apt) => ({
      name: apt.description,
      location: apt.location,
      price: apt.price,
      type: apt.type,
      images: apt.images,
      status: apt.status,
    }));

    // تحديد المنطقة الحالية من الشقق القديمة (عشان منلخبطش مناطق ببعضها)
    let currentPageLocation = null;
    if (typeof apartments !== "undefined" && apartments.length > 0) {
      currentPageLocation = apartments[0].location;
    }

    // فلترة الشقق الجديدة عشان نعرض بس اللي تبع الصفحة دي
    const filteredNewApartments = currentPageLocation
      ? newApartments.filter((apt) => apt.location === currentPageLocation)
      : newApartments;

    // دمج الشقق (الجديد من السيرفر في الأول، وبعدين القديم)
    if (typeof apartments !== "undefined") {
      apartments = [...filteredNewApartments, ...apartments];
    } else {
      window.apartments = filteredNewApartments;
    }

    render();
  } catch (error) {
    console.error("خطأ في جلب بيانات الشقق من السيرفر:", error);
    // لو حصل خطأ في السيرفر، اعرض الشقق القديمة زي ما هي
    if (typeof apartments !== "undefined") {
      render();
    }
  }
}

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

      // تحديد حالة الحجز (للشقق القديمة والجديدة)
      let ribbonHTML = "";
      if (
        apt.status === "محجوزة" ||
        apt.name.includes("محجوزة") ||
        apt.name.includes("reserved")
      ) {
        ribbonHTML = `<span class="corner-ribbon reserved">محجوزة</span>`;
      } else if (apt.status === "متاحة") {
        ribbonHTML = `<span class="corner-ribbon available">متاحة</span>`;
      } else if (apt.name.includes("corner-ribbon")) {
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

            if (file.endsWith(".mp4") || file.includes("video/upload")) {
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

// ==========================================
// نظام الحجز الجديد
// ==========================================
let selectedAptForBooking = ""; // متغير عشان نحفظ فيه بيانات الشقة اللي الطالب اختارها

// 1. دالة الحجز (بتفتح الشباك وتسجل بيانات الشقة)
function bookNow(name, location, price) {
  let cleanName = name.replace(/<span[^>]*>([^<]*)<\/span>/g, "").trim();
  selectedAptForBooking = `المنطقة: ${location} | ${cleanName} | السعر: ${price || "غير محدد"}`;

  // عرض تفاصيل الشقة جوه الشباك
  document.getElementById("apt-details-text").innerText = selectedAptForBooking;

  // إظهار الشباك
  document.getElementById("bookingModal").style.display = "flex";
}

// 2. دالة قفل الشباك
function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
}

// 3. دالة إرسال الطلب للسيرفر وفتح الواتساب معاً
async function submitBooking(event) {
  event.preventDefault(); // منع الصفحة من التحميل

  const nameInput = document.getElementById("studentName").value;
  const phoneInput = document.getElementById("studentPhone").value;
  const btn = document.querySelector(".confirm-btn");

  try {
    btn.textContent = "جاري الإرسال... ⏳";
    btn.disabled = true;

    // 1. إرسال الطلب للسيرفر عشان يظهر في لوحة التحكم
    const response = await fetch(
      "https://sakan-sigma.vercel.app/api/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: nameInput,
          phone: phoneInput,
          apartmentDetails: selectedAptForBooking,
        }),
      },
    );

    if (response.ok) {
      console.log("تم تسجيل الحجز في قاعدة البيانات بنجاح.");
    } else {
      console.log("فشل تسجيل الحجز في القاعدة، لكن سيتم فتح الواتساب.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    btn.textContent = "تأكيد وإرسال الطلب";
    btn.disabled = false;
    closeModal(); // قفل الشباك
    document.getElementById("bookingForm").reset(); // تفريغ الخانات
  }

  // 2. تجهيز رسالة الواتساب وفتحها فوراً للمستخدم
  let adminPhone = "201152638852"; // حط رقم واتساب بتاعك هنا (متبوع بكود مصر 20)

  let whatsappMessage =
    `السلام عليكم، عايز احجز:\n` +
    `👤 الاسم: ${nameInput}\n` +
    `📞 التليفون: ${phoneInput}\n` +
    `🏠 ${selectedAptForBooking}`;

  let encodedMessage = encodeURIComponent(whatsappMessage);

  // فتح الواتساب في تبويب جديد
  window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, "_blank");
}

// قفل الشباك لو المستخدم داس في أي مكان بره الشباك
window.onclick = function (event) {
  const modal = document.getElementById("bookingModal");
  if (event.target == modal) {
    closeModal();
  }
};

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

// تشغيل الموقع بمجرد فتحه
// 1. عرض الشقق القديمة فوراً عشان الصفحة متبقاش فاضية
if (typeof apartments !== "undefined") {
  render();
}

// 2. جلب الشقق الجديدة من السيرفر في الخلفية ودمجها
fetchApartments();
