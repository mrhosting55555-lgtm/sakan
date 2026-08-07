const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer"); // الغلطة التالثة: استيراد multer

require("dotenv").config();

const app = express();

// إعدادات أساسية مع زيادة الحد الأقصى للبيانات (لضمان الاستقرار)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// إعداد تخزين Multer (يُفضل استخدام memoryStorage أو diskStorage حسب الحاجة، هنا افتراضي مؤقت)
const upload = multer({ dest: "uploads/" }); // الغلطة التالثة: تعريف upload

// 2. الاتصال بقاعدة بيانات MongoDB (تم التأكد من صحة المتغير بدون رموز غريبة)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("تم الاتصال بقاعدة البيانات بنجاح 🚀"))
  .catch((err) => console.log("خطأ في الاتصال بقاعدة البيانات:", err));

// 3. تصميم الجداول (Schemas) مع الحماية من OverwriteModelError
const apartmentSchema = new mongoose.Schema({
  description: String,
  location: String,
  type: String,
  price: String,
  images: [String],
  videoUrl: String,
  status: { type: String, default: "متاحة" },
  createdAt: { type: Date, default: Date.now },
});
const Apartment =
  mongoose.models.Apartment || mongoose.model("Apartment", apartmentSchema);

const bookingSchema = new mongoose.Schema({
  userName: String,
  phone: String,
  apartmentDetails: String,
  date: { type: Date, default: Date.now },
});
const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

// ==========================================
// 4. مسارات الـ API (Routes)
// ==========================================

// مسار: إضافة شقة جديدة (يدعم JSON والـ FormData)
app.post("/api/apartments", upload.array("media", 15), async (req, res) => {
  try {
    const mediaUrls = req.files ? req.files.map((file) => file.path) : [];

    const newApartment = new Apartment({
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      price: req.body.price,
      images:
        mediaUrls.length > 0
          ? mediaUrls
          : (typeof req.body.images === "string"
              ? req.body.images.split("\n")
              : req.body.images) || [],
      videoUrl: req.body.videoUrl || "",
    });

    await newApartment.save();
    res
      .status(201)
      .json({ message: "تم إضافة الشقة بنجاح!", apartment: newApartment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حصل خطأ أثناء إضافة الشقة" });
  }
});

// مسار: جلب كل الشقق
app.get("/api/apartments", async (req, res) => {
  try {
    const apartments = await Apartment.find().sort({ createdAt: -1 });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ error: "حصل خطأ أثناء جلب الشقق" });
  }
});

// مسار: حذف شقة
app.delete("/api/apartments/:id", async (req, res) => {
  try {
    await Apartment.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الشقة بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "خطأ في حذف الشقة" });
  }
});

// مسار: تعديل شقة (لتغيير السعر أو الحالة)
app.patch("/api/apartments/:id", async (req, res) => {
  try {
    const updatedApt = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json({ message: "تم التعديل بنجاح", apartment: updatedApt });
  } catch (error) {
    res.status(500).json({ error: "خطأ في تعديل الشقة" });
  }
});

// مسار: إضافة طلب حجز جديد (تمت إضافته لحل الغلطة السابعة)
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "تم حفظ الحجز بنجاح", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ أثناء حفظ الحجز" });
  }
});

// مسار: جلب طلبات الحجز
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "حصل خطأ أثناء جلب الطلبات" });
  }
});

// 5. تصدير التطبيق فقط ليتوافق مع Vercel (بدون app.listen لحل الغلطة الخامسة)
module.exports = app;
