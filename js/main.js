// المتغيرات الأساسية
let currentFilter = "all";
let priceFilter = "all";

// دالة جلب الشقق من السيرفر ودمجها مع القديم
async function fetchApartments() {
  try {
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
      images: apt.images, // تتضمن الصور المرفوعة واللينكات الخارجية المدمجة معاً
      videoUrl: apt.videoUrl, // تدعم الحقل القديم لو موجود
      status: apt.status,
    }));

    // تحديد المنطقة الحالية من الشقق القديمة (عشان منلخبطش مناطق ببعضها)
    let currentPageLocation = null;
    if (typeof apartments !== "undefined" && apartments.length > 0) {
      currentPageLocation = apartments[0].location;
    }

    // فلترة الشقق الجديدة بدقة تامة لمنع ظهور الشقة في غير منطقتها
    const filteredNewApartments = currentPageLocation
      ? newApartments.filter((apt) => {
          if (!apt.location || !currentPageLocation) return false;
          return apt.location.trim().toLowerCase() === currentPageLocation.trim().toLowerCase();
        })
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

      // تجهيز كل الوسائط (صور + فيديوهات + لينكات متعددة) لعرضها في السلايدر
      let allMedia = [...(apt.images || [])];
      if (apt.videoUrl && !allMedia.includes(apt.videoUrl)) {
        allMedia.push(apt.videoUrl);
      }

      card.innerHTML = `
      ${ribbonHTML}
      <div class="slider">
        ${allMedia
          .map((file, i) => {
            const isActive = i === 0 ? "active" : "";

            if (file.includes("drive.google.com/file/d/")) {
              const embedUrl = file.replace("/view?usp=drive_link", "/preview");
              return `<iframe class="slider-item ${isActive}" src="${embedUrl}" loading="lazy" allow="autoplay" allowfullscreen></iframe>`;
            }

            // فحص الفيديو (سواء مرفوع مباشر أو لينك خارجي من Cloudinary أو امتداد فيديو)
            if (
              file.endsWith(".mp4") ||
              file.includes("video/upload") ||
              file.includes(".mov") ||
              file.includes(".webm")
            ) {
              let posterUrl = file
                .replace(".mp4", ".jpg")
                .replace(".mov", ".jpg")
                .replace(".webm", ".jpg");

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
        <div class="title"></div>
        <div class="action-btn">
          <div class="price-btn">${apt.price || "اتصل لمعرفة السعر"}</div>
          <div class="book-btn">احجز</div>
        </div>
      </div>
    `;

      // إدراج اسم الشقة وعنوانها بأمان تام
      const rawName = apt.name || "";
      const cleanTitle = rawName.replace(/<span[^>]*>([^<]*)<\/span>/g, "").trim();
      card.querySelector(".title").textContent = cleanTitle;

      // ربط زر الحجز بالكلاس القديم book-btn مع الحفاظ على الأمان التام
      const bookBtn = card.querySelector(".book-btn");
      bookBtn.addEventListener("click", () => {
        bookNow(cleanTitle, apt.location, apt.price);
      });

      app.appendChild(card);
    }); // <-- تم إضافة القوس الناقص هنا لإنهاء الـ forEach بشكل صحيح
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
// نظام الحجز
// ==========================================
let selectedAptForBooking = "";

function bookNow(name, location, price) {
  try {
    let cleanName = "";
    if (name) {
      cleanName = name.replace(/<span[^>]*>([^<]*)<\/span>/g, "").replace(/['"]/g, "").trim();
    }
    
    selectedAptForBooking = `المنطقة: ${location || "غير محددة"} | ${cleanName || "شقة"} | السعر: ${price || "غير محدد"}`;

    const detailsEl = document.getElementById("apt-details-text");
    if (detailsEl) {
      detailsEl.innerText = selectedAptForBooking;
    }

    const modalEl = document.getElementById("bookingModal");
    if (modalEl) {
      modalEl.style.display = "flex";
    } else {
      let adminPhone = "201152638852";
      let whatsappMessage = `السلام عليكم، عايز احجز:\n🏠 ${selectedAptForBooking}`;
      window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
    }
  } catch (err) {
    console.error("خطأ أثناء محاولة الحجز:", err);
    alert("حدث خطأ بسيط، حاول مرة أخرى.");
  }
}

function closeModal() {
  const modalEl = document.getElementById("bookingModal");
  if (modalEl) modalEl.style.display = "none";
}

// دالة إرسال الطلب للسيرفر وفتح الواتساب معاً
async function submitBooking(event) {
  event.preventDefault();

  const nameInput = document.getElementById("studentName").value;
  const phoneInput = document.getElementById("studentPhone").value;
  const btn = document.querySelector(".confirm-btn");

  try {
    if (btn) {
      btn.textContent = "جاري الإرسال... ⏳";
      btn.disabled = true;
    }

    // 1. تسجيل الحجز في قاعدة البيانات
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
      console.log("فشل تسجيل الحجز في القاعدة، سيتم فتح الواتساب.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (btn) {
      btn.textContent = "تأكيد وإرسال الطلب";
      btn.disabled = false;
    }
    closeModal();
    const formEl = document.getElementById("bookingForm");
    if (formEl) formEl.reset();
  }

  // 2. فتح الواتساب أوتوماتيكياً برقمك وتفاصيل الحجز
  let adminPhone = "201152638852"; // رقم الواتساب الخاص بك

  let whatsappMessage =
    `السلام عليكم، عايز احجز:\n` +
    `👤 الاسم: ${nameInput}\n` +
    `📞 التليفون: ${phoneInput}\n` +
    `🏠 ${selectedAptForBooking}`;

  let encodedMessage = encodeURIComponent(whatsappMessage);
  window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, "_blank");
}

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
if (typeof apartments !== "undefined") {
  render();
}

fetchApartments();