// ===== إعدادات تشغيل أداة الحجوزات =====

// 1) الصق هنا إعدادات تطبيق الويب من:
//    Firebase Console ← ⚙ Project settings ← General ← Your apps ← SDK setup and configuration ← Config
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBz9d5Gvrnok-nzwaq6xHZfvM5lm-s6EfI",
  authDomain: "makeover-booking-eg.firebaseapp.com",
  projectId: "makeover-booking-eg",
  storageBucket: "makeover-booking-eg.firebasestorage.app",
  messagingSenderId: "958902262472",
  appId: "1:958902262472:web:174983988309e9c08263fd"
};

// 2) إيميل المالك (حساب Google بتاعك في الشركة). نفس الإيميل لازم يتكتب في firestore.rules و storage.rules.
//    ممكن تكتب أكتر من إيميل: ["a@company.com", "b@company.com"]
window.OWNER_EMAILS = ["a.hussein.makeover@gmail.com"];

// 3) رفع المرفقات (محضر الاستلام). خليها true بعد تفعيل Storage في Firebase (محتاج خطة Blaze).
window.ENABLE_UPLOADS = false;
