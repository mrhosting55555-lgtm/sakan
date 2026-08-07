const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const os = require("os");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ التصحيح الأول: استخدام مجلد المؤقتات /tmp المتوافق مع Vercel بدلاً من uploads/
const upload = multer({ dest: os.tmpdir() });

// دالة اتصال آمنة ومستقرة لبيئة السيرفرليس
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("تم الاتصال بقاعدة البيانات بنجاح 🚀");
  } catch (err) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", err);
  }
}

// تصميم الجداول (Schemas)
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

// مسارات الـ API (Routes) مع ضمان الاتصال بقاعدة البيانات لكل طلب

app.post("/api/apartments", upload.array("media", 15), async (req, res) => {
  try {
    await connectDB();
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

app.get("/api/apartments", async (req, res) => {
  try {
    await connectDB();
    const apartments = await Apartment.find().sort({ createdAt: -1 });
    res.json(apartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حصل خطأ أثناء جلب الشقق" });
  }
});

app.delete("/api/apartments/:id", async (req, res) => {
  try {
    await connectDB();
    await Apartment.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الشقة بنجاح" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطأ في حذف الشقة" });
  }
});

app.patch("/api/apartments/:id", async (req, res) => {
  try {
    await connectDB();
    const updatedApt = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json({ message: "تم التعديل بنجاح", apartment: updatedApt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطأ في تعديل الشقة" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    await connectDB();
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "تم حفظ الحجز بنجاح", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ أثناء حفظ الحجز" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حصل خطأ أثناء جلب الطلبات" });
  }
});

module.exports = app;
