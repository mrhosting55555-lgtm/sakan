const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

// إعدادات أساسية مع زيادة الحد الأقصى للبيانات (لضمان الاستقرار)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2. الاتصال بقاعدة بيانات MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("تم الاتصال بقاعدة البيانات بنجاح 🚀"))
  .catch((err) => console.log("خطأ في الاتصال بقاعدة البيانات:", err));

// 3. تصميم الجداول (Schemas) - أضفنا حقل videoUrl
const apartmentSchema = new mongoose.Schema({
  description: String,
  location: String,
  type: String,
  price: String,
  images: [String],
  videoUrl: String, // حقل خاص بلينك الفيديو الخارجي
  status: { type: String, default: "متاحة" },
  createdAt: { type: Date, default: Date.now },
});
const Apartment = mongoose.model("Apartment", apartmentSchema);

const bookingSchema = new mongoose.Schema({
  userName: String,
  phone: String,
  apartmentDetails: String,
  date: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", bookingSchema);

// ==========================================
// 4. مسارات الـ API (Routes)
// ==========================================

// مسار: إضافة شقة جديدة (يدعم الصور وملف الفيديو الخارجي)
app.post("/api/apartments", upload.array("media", 15), async (req, res) => {
  try {
    const mediaUrls = req.files ? req.files.map((file) => file.path) : [];

    const newApartment = new Apartment({
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      price: req.body.price,
      images: mediaUrls,
      videoUrl: req.body.videoUrl || "", // استقبال حفظ لينك الفيديو
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

// مسار: إضافة طلب حجز جديد
app.post("/api/apartments", async (req, res) => {
  try {
    const newApartment = new Apartment({
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      price: req.body.price,
      images: req.body.images || [],
      videoUrl: req.body.videoUrl || "",
      status: "متاحة",
    });

    await newApartment.save();

    res.status(201).json({
      message: "تم إضافة الشقة بنجاح",
      apartment: newApartment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حصل خطأ أثناء إضافة الشقة" });
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

// 5. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`السيرفر شغال زي الفل على بورت ${PORT} 🌐`);
});

module.exports = app;
