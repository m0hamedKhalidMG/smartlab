# 📋 خطة مشروع Smart Lab System
## نظام إدارة وصيانة مختبرات الحاسب الذكي

---

## 🎯 الهدف

تحويل إدارة مختبر الحاسب إلى نظام ذكي واستباقي يقلل وقت تعطل الأجهزة ويسرع عملية الصيانة باستخدام تحليل البيانات والتنبيهات الذكية.

---

## 🛠 التقنيات المستخدمة (Tech Stack)

| الطبقة | التقنية |
|---|---|
| Backend | Node.js + Express |
| Frontend | HTML + CSS + JavaScript (Vanilla) |
| قاعدة البيانات | SQLite (better-sqlite3) |
| الذكاء الاصطناعي | DeepSeek API |
| QR Code | qrcode (npm) |
| الرسوم البيانية | Chart.js |
| المصادقة | JWT (jsonwebtoken + bcryptjs) |
| رفع الملفات | Multer |
| الإشعارات | داخل النظام (In-app) فقط |

---

## 🎨 دليل التصميم (UI Style Guide)

### الألوان
| الاسم | الكود | الاستخدام |
|---|---|---|
| Primary | `#3B82F6` | الأزرار الرئيسية، Sidebar |
| Success | `#22C55E` | حالة "يعمل" |
| Danger | `#EF4444` | حالة "متوقف" |
| Warning | `#F97316` | حالة "صيانة" |
| Background | `#F1F5F9` | خلفية الصفحات |
| Sidebar | `#1E293B` | خلفية القائمة الجانبية |
| Card | `#FFFFFF` | خلفية البطاقات |

### العناصر البصرية
- **الخط:** Cairo (Google Fonts) — واضح وعربي حديث
- **الاتجاه:** RTL (من اليمين لليسار)
- **Cards:** border-radius: 12px + box-shadow خفيف
- **Buttons:** rounded-pill، لون أزرق رئيسي
- **Badges الحالة:**
  - 🟢 أخضر = يعمل
  - 🔴 أحمر = متوقف
  - 🟠 برتقالي = صيانة

### Layout الأساسي
- **Sidebar:** يمين الشاشة (260px) — لأن اللغة عربية RTL
- **Top Bar:** أعلى الصفحة (60px) — اسم المستخدم + أيقونة الحساب
- **المحتوى الرئيسي:** يسار الشاشة (margin-right: 260px)

---

## 👥 أدوار المستخدمين (Roles)

| الميزة | مدير (Admin) | فني (Technician) | مستخدم (User) |
|---|---|---|---|
| إدارة الأجهزة | ✅ | ❌ | ❌ |
| إدارة المستخدمين | ✅ | ❌ | ❌ |
| تقديم بلاغ | ✅ | ✅ | ✅ |
| تحديث حالة البلاغ | ✅ | ✅ | ❌ |
| مساعد AI للتشخيص | ✅ | ✅ | ❌ |
| الخريطة التفاعلية | ✅ | ✅ | ✅ |
| التقارير | ✅ | ✅ | ❌ |
| التنبيهات الاستباقية | ✅ | ✅ | ❌ |
| QR Code | ✅ | ✅ | قراءة فقط |

---

## 🗄 قاعدة البيانات (Database Schema)

### جدول `users`
| الحقل | النوع | الوصف |
|---|---|---|
| id | INTEGER PK | المعرف |
| name | TEXT | الاسم |
| email | TEXT UNIQUE | البريد الإلكتروني |
| password_hash | TEXT | كلمة المرور مشفرة |
| role | TEXT | admin / technician / user |
| created_at | DATETIME | تاريخ الإنشاء |

### جدول `devices`
| الحقل | النوع | الوصف |
|---|---|---|
| id | INTEGER PK | المعرف |
| name | TEXT | اسم الجهاز (PC-01) |
| type | TEXT | نوع الجهاز |
| processor | TEXT | المعالج |
| ram | TEXT | الذاكرة العشوائية |
| os | TEXT | نظام التشغيل |
| location_x | INTEGER | موقع X على الخريطة |
| location_y | INTEGER | موقع Y على الخريطة |
| age_years | REAL | عمر الجهاز بالسنوات |
| status | TEXT | working / broken / maintenance |
| purchase_date | DATE | تاريخ الشراء |
| last_maintenance | DATE | آخر صيانة |
| qr_token | TEXT UNIQUE | رمز QR |
| notes | TEXT | ملاحظات |
| created_at | DATETIME | تاريخ الإضافة |

### جدول `issues`
| الحقل | النوع | الوصف |
|---|---|---|
| id | INTEGER PK | المعرف |
| device_id | INTEGER FK | الجهاز المتعطل |
| reported_by_id | INTEGER FK | من أبلغ |
| issue_type | TEXT | نوع المشكلة |
| description | TEXT | وصف العطل |
| image_path | TEXT | صورة العطل (اختياري) |
| status | TEXT | open / in_progress / resolved |
| ai_suggestions | TEXT | اقتراحات الذكاء الاصطناعي |
| priority | TEXT | low / medium / high |
| created_at | DATETIME | تاريخ الإبلاغ |
| resolved_at | DATETIME | تاريخ الإصلاح |
| resolved_by_id | INTEGER FK | الفني المسؤول |
| resolution_notes | TEXT | ملاحظات الإصلاح |

### جدول `alerts`
| الحقل | النوع | الوصف |
|---|---|---|
| id | INTEGER PK | المعرف |
| device_id | INTEGER FK | الجهاز المعني |
| type | TEXT | age / frequency / maintenance_gap |
| message | TEXT | نص التنبيه |
| severity | TEXT | low / medium / high |
| is_read | INTEGER | 0 = غير مقروء، 1 = مقروء |
| created_at | DATETIME | تاريخ التنبيه |

### جدول `maintenance_logs`
| الحقل | النوع | الوصف |
|---|---|---|
| id | INTEGER PK | المعرف |
| device_id | INTEGER FK | الجهاز |
| issue_id | INTEGER FK | البلاغ المرتبط |
| technician_id | INTEGER FK | الفني |
| action | TEXT | الإجراء المتخذ |
| duration_hours | REAL | مدة الإصلاح |
| cost | REAL | التكلفة |
| created_at | DATETIME | تاريخ الصيانة |

---

## 📄 صفحات النظام

### 1. 🔐 شاشة الدخول (`index.html`)
- خلفية: صورة معمل كمبيوتر + overlay أزرق شفاف `rgba(30,58,138,0.7)`
- Card مركزية (380px):
  - شعار النظام + عنوان "Smart Lab"
  - input: البريد الإلكتروني
  - input: كلمة المرور (مع زر إظهار/إخفاء)
  - زر أزرق: "دخول"
  - رابط: "هل نسيت كلمة المرور؟"

### 2. 📊 لوحة التحكم (`dashboard.html`)
- **4 بطاقات إحصائية:**
  - إجمالي الأجهزة (أيقونة حاسوب)
  - أجهزة تعمل ✅ (أيقونة أخضر)
  - أجهزة متوقفة ❌ (أيقونة أحمر)
  - قيد الصيانة 🛠 (أيقونة برتقالي)
- **Pie Chart (دائري):** نسب حالات الأجهزة
- **جدول "آخر الأعطال":** رقم الجهاز، المشكلة، Badge الحالة، التاريخ
- **بطاقة التنبيهات:** عدد التنبيهات غير المقروءة

### 3. 💻 صفحة الأجهزة (`devices.html`)
- **جدول الأجهزة:**
  - رقم الجهاز | النوع | الموقع | الحالة (Badge) | آخر تحديث | إجراءات
- **زر "إضافة جهاز جديد"** → Modal:
  - اسم الجهاز، النوع، المعالج، الرام، نظام التشغيل
  - الموقع (X, Y)، عمر الجهاز، آخر صيانة
- **Pagination:** 10 عناصر/صفحة

### 4. 🔍 تفاصيل الجهاز (`device.html`)
- Card كبيرة:
  - أيقونة جهاز + رقم الجهاز + Badge الحالة
  - المواصفات: المعالج، الرام، نظام التشغيل، تاريخ الشراء، آخر صيانة
- **أزرار:** تعديل ✏️ / إبلاغ عن عطل 🚨 / إرسال للصيانة 🛠
- **سجل أعطال الجهاز:** جدول بآخر الأعطال
- **QR Code:** عرض + تنزيل
- ⚠️ يمكن الوصول إليها عبر رابط QR بدون تسجيل دخول كامل

### 5. 🚨 الأعطال والبلاغات (`issues.html`)
- **Form تقديم بلاغ:**
  - اختيار الجهاز (select)
  - نوع المشكلة (select)
  - وصف المشكلة (textarea)
  - رفع صورة (اختياري)
- **AI Suggestion:** تظهر تلقائياً بعد 1 ثانية من توقف الكتابة (debounce)
- **جدول البلاغات:** مع فلتر الحالة (الكل / مفتوح / قيد العمل / محلول)

### 6. 🛠 سجل الصيانة (`maintenance.html`)
- **جدول:**
  - رقم الجهاز | المشكلة | تاريخ الإبلاغ | تاريخ الإصلاح | الفني المسؤول | الحالة
- فلتر بالحالة وبالتاريخ

### 7. 🗺 الخريطة التفاعلية (`map.html`)
- SVG layout يمثل المعمل (5 صفوف × 4 أجهزة = 20 جهاز)
- كل جهاز: مستطيل SVG يتلون حسب الحالة
- تحديث الألوان عبر زر "تحديث الخريطة" أو عند فتح الصفحة (fetch عادي)
- Tooltip عند hover: اسم الجهاز + الحالة + آخر تحديث
- ضغط على جهاز → ينتقل لصفحة تفاصيله

### 8. 🔔 التنبيهات الذكية (`alerts.html`)
- قائمة تنبيهات مع:
  - border-right ملون حسب الخطورة (أخضر/برتقالي/أحمر)
  - أيقونة الجهاز + نص التنبيه + التاريخ
- زر "تحديد الكل كمقروء"
- فلتر بالخطورة

### 9. 📈 التقارير (`reports.html`)
- Date range picker (من / إلى)
- **Bar Chart:** عدد الأعطال حسب الشهر
- **بطاقات إحصاء:**
  - متوسط زمن الإصلاح
  - أكثر الأجهزة أعطالاً
  - إجمالي الصيانات
- زر طباعة / تصدير (window.print)

### 10. ⚙️ لوحة المدير (`admin.html`)
- جدول المستخدمين: الاسم، البريد، الدور (Badge)، تاريخ الإنشاء، إجراءات
- Modal إضافة/تعديل مستخدم
- متاح للـ Admin فقط

---

## 🏗 هيكل الملفات (Project Structure)

```
smartlab/
├── PLAN.md                    ← هذا الملف
├── package.json
├── server.js                  ← Express + Routes
├── .env.example               ← نموذج متغيرات البيئة
├── db/
│   ├── database.js            ← تهيئة SQLite وإنشاء الجداول
│   └── seed.js                ← بيانات تجريبية
├── middleware/
│   └── auth.js                ← JWT verify + role guard
├── routes/
│   ├── auth.js                ← POST /api/auth/login, GET /api/auth/me
│   ├── devices.js             ← GET/POST/PUT/DELETE + GET /:id/qr
│   ├── issues.js              ← CRUD + تحديث الحالة
│   ├── alerts.js              ← GET + PATCH /:id/read + PATCH /read-all
│   ├── reports.js             ← GET /summary?from=&to=
│   ├── ai.js                  ← POST /api/ai/diagnose (DeepSeek)
│   └── qr.js                  ← GET /qr/:token → redirect لصفحة الجهاز
├── services/
│   ├── deepseek.js            ← DeepSeek API wrapper
│   └── predictive.js          ← Cron Job يومي للتنبيهات
├── uploads/                   ← صور البلاغات (Multer)
└── public/
    ├── css/
    │   └── style.css          ← RTL + Cairo + CSS Variables + كل العناصر
    ├── js/
    │   ├── api.js             ← fetch wrapper يضيف JWT تلقائياً
    │   ├── auth.js            ← تسجيل الدخول والخروج
    │   ├── dashboard.js       ← Stats + Chart.js
    │   ├── devices.js         ← جدول + Modal + QR download
    │   ├── device.js          ← تفاصيل الجهاز + QR
    │   ├── issues.js          ← Form + AI debounce + جدول
    │   ├── maintenance.js     ← سجل الصيانة
    │   ├── map.js             ← SVG + fetch عادي لتحديث الألوان
    │   ├── alerts.js          ← قائمة التنبيهات
    │   ├── reports.js         ← Charts + فلتر تاريخ
    │   └── admin.js           ← إدارة المستخدمين
    ├── index.html             ← شاشة الدخول
    ├── dashboard.html         ← لوحة التحكم
    ├── devices.html           ← الأجهزة
    ├── device.html            ← تفاصيل الجهاز (+ QR access)
    ├── issues.html            ← الأعطال والبلاغات
    ├── maintenance.html       ← سجل الصيانة
    ├── map.html               ← الخريطة التفاعلية
    ├── alerts.html            ← التنبيهات الذكية
    ├── reports.html           ← التقارير
    └── admin.html             ← لوحة المدير
```

---

## 🚀 مراحل التنفيذ

### المرحلة 0 — التوثيق ✅
- [x] إنشاء `PLAN.md`

### المرحلة 1 — الخلفية الأساسية
- [ ] `package.json` + تثبيت المكتبات
- [ ] `db/database.js` — إنشاء الجداول الـ5
- [ ] `middleware/auth.js` — JWT + role guard
- [ ] `routes/auth.js` — login + me
- [ ] `server.js` — ربط كل شيء
- [ ] `db/seed.js` — بيانات تجريبية
- [ ] `.env.example`

### المرحلة 2 — API الأساسية
- [ ] `routes/devices.js` — CRUD + توليد QR PNG
- [ ] `routes/issues.js` — CRUD + تحديث الحالة
- [ ] `routes/alerts.js` — قراءة وتحديث التنبيهات
- [ ] `routes/reports.js` — إحصائيات مع فلتر تاريخ

### المرحلة 3 — الذكاء الاصطناعي والتنبؤ
- [ ] `services/deepseek.js` — DeepSeek API wrapper
- [ ] `routes/ai.js` — endpoint التشخيص
- [ ] `services/predictive.js` — Cron Job يومي:
  - عمر الجهاز > 5 سنوات → تنبيه medium
  - أعطال > 3 في الشهر → تنبيه high
  - فجوة صيانة > 6 أشهر → تنبيه low
- [ ] `routes/qr.js` — redirect بـ token

### المرحلة 4 — الواجهة الأمامية
- [ ] `css/style.css` — RTL + Cairo + CSS Variables + كل الأنماط
- [ ] `js/api.js` — fetch wrapper مشترك
- [ ] `index.html` + `js/auth.js`
- [ ] `dashboard.html` + `js/dashboard.js`
- [ ] `devices.html` + `js/devices.js`
- [ ] `device.html` + `js/device.js`
- [ ] `issues.html` + `js/issues.js`
- [ ] `maintenance.html` + `js/maintenance.js`
- [ ] `map.html` + `js/map.js`
- [ ] `alerts.html` + `js/alerts.js`
- [ ] `reports.html` + `js/reports.js`
- [ ] `admin.html` + `js/admin.js`

---

## 🔑 بيانات الدخول التجريبية

| المستخدم | البريد | كلمة المرور | الدور |
|---|---|---|---|
| مدير النظام | admin@lab.com | Admin@123 | admin |
| فني الصيانة | tech@lab.com | Tech@123 | technician |
| مستخدم عادي | user@lab.com | User@123 | user |

**بيانات تجريبية:**
- 20 جهاز: PC-01 → PC-20
  - 12 يعمل ✅
  - 5 متوقفة ❌
  - 3 تحت الصيانة 🛠
- 10 بلاغات بحالات مختلفة
- 5 تنبيهات بخطورات مختلفة

---

## 🌐 API Endpoints

### المصادقة
| Method | Endpoint | الوصف | الصلاحية |
|---|---|---|---|
| POST | `/api/auth/login` | تسجيل الدخول | عام |
| GET | `/api/auth/me` | بيانات المستخدم الحالي | مسجل |

### الأجهزة
| Method | Endpoint | الوصف | الصلاحية |
|---|---|---|---|
| GET | `/api/devices` | قائمة الأجهزة | مسجل |
| GET | `/api/devices/:id` | تفاصيل جهاز | مسجل |
| POST | `/api/devices` | إضافة جهاز | admin |
| PUT | `/api/devices/:id` | تعديل جهاز | admin |
| DELETE | `/api/devices/:id` | حذف جهاز | admin |
| GET | `/api/devices/:id/qr` | تنزيل QR PNG | مسجل |
| GET | `/qr/:token` | وصول عبر QR | عام |

### الأعطال
| Method | Endpoint | الوصف | الصلاحية |
|---|---|---|---|
| GET | `/api/issues` | قائمة البلاغات | مسجل |
| POST | `/api/issues` | تقديم بلاغ | مسجل |
| PUT | `/api/issues/:id` | تعديل بلاغ | admin/tech |
| PATCH | `/api/issues/:id/status` | تحديث الحالة | admin/tech |

### التنبيهات
| Method | Endpoint | الوصف | الصلاحية |
|---|---|---|---|
| GET | `/api/alerts` | قائمة التنبيهات | admin/tech |
| PATCH | `/api/alerts/:id/read` | تحديد كمقروء | admin/tech |
| PATCH | `/api/alerts/read-all` | تحديد الكل كمقروء | admin/tech |

### التقارير
| Method | Endpoint | الوصف | الصلاحية |
|---|---|---|---|
| GET | `/api/reports/summary` | إحصائيات عامة | admin/tech |
| GET | `/api/reports/maintenance` | سجل الصيانة | admin/tech |

### الذكاء الاصطناعي
| Method | Endpoint | الوصف | الصلاحية |
|---|---|---|---|
| POST | `/api/ai/diagnose` | تشخيص العطل بـ DeepSeek | admin/tech |

---

## ✅ التحقق من التنفيذ (Verification Checklist)

1. `npm install` ثم `npm start` → السيرفر يعمل على `http://localhost:3000`
2. فتح المتصفح → شاشة دخول بتصميم معمل + overlay أزرق
3. دخول `admin@lab.com / Admin@123` → لوحة تحكم مع 4 بطاقات + Pie Chart
4. إضافة جهاز جديد → يظهر في الجدول، الخريطة تتحدث عند الضغط على زر التحديث
5. تقديم بلاغ + كتابة وصف العطل → AI Suggestion يظهر من DeepSeek
6. `GET /api/devices/1/qr` → تنزيل QR + مسح الكود يفتح `device.html`
7. تغيير حالة جهاز → الخريطة تتحدث عند الضغط على زر "تحديث" أو إعادة تحميل الصفحة
8. التقارير: فلتر بتاريخ → Bar Chart يتحدث بالبيانات الصحيحة
9. Cron Job التنبؤ: جهاز عمره > 5 سنوات في البيانات التجريبية → تنبيه يظهر في `alerts.html`
10. دخول `user@lab.com / User@123` → لا يرى صفحة admin, التقارير, أو التنبيهات

---

## 📦 المكتبات المطلوبة (Dependencies)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "better-sqlite3": "^9.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "node-cron": "^3.0.0",
    "qrcode": "^1.5.0",
    "node-fetch": "^3.3.0",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

## 🔐 متغيرات البيئة (.env)

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
DEEPSEEK_API_KEY=sk-c16a3ddcda8f440e8a1bc714d357460c
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
```

> ⚠️ **تنبيه أمني:** لا تشارك ملف `.env` ولا تضعه على GitHub. أضفه لـ `.gitignore`.
