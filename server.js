require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files (الواجهة الأمامية) ────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/devices',     require('./routes/devices'));
app.use('/api/issues',      require('./routes/issues'));
app.use('/api/alerts',      require('./routes/alerts'));
app.use('/api/reports',     require('./routes/reports'));
app.use('/api/ai',          require('./routes/ai'));
app.use('/api/users',       require('./routes/users'));
app.use('/qr',              require('./routes/qr'));

// ── Cron Job للتنبيهات التنبؤية ─────────────────────────────
require('./services/predictive');

// ── Catch-all: إعادة توجيه للواجهة (SPA-like) ──────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/qr')) {
    return res.status(404).json({ error: 'المسار غير موجود' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('خطأ في السيرفر:', err.message);
  res.status(500).json({ error: 'خطأ داخلي في الخادم' });
});

app.listen(PORT, () => {
  console.log(`🚀 Smart Lab يعمل على http://localhost:${PORT}`);
});
