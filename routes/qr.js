const express = require('express');
const db      = require('../db/database');

const router = express.Router();

// GET /qr/:token — فتح صفحة الجهاز عبر رمز QR (بدون تسجيل دخول)
router.get('/:token', (req, res) => {
  const device = db.prepare('SELECT id FROM devices WHERE qr_token = ?').get(req.params.token);
  if (!device) return res.status(404).send('الرمز غير صالح أو منتهي الصلاحية');
  res.redirect(`/device.html?token=${req.params.token}`);
});

// GET /api/qr/:token/data — بيانات الجهاز عبر token (للاستخدام في device.html)
router.get('/:token/data', (req, res) => {
  const device = db.prepare('SELECT * FROM devices WHERE qr_token = ?').get(req.params.token);
  if (!device) return res.status(404).json({ error: 'الجهاز غير موجود' });

  const issues = db.prepare(`
    SELECT i.id, i.issue_type, i.description, i.status, i.priority, i.created_at
    FROM issues i
    WHERE i.device_id = ?
    ORDER BY i.created_at DESC
    LIMIT 10
  `).all(device.id);

  res.json({ device, issues });
});

module.exports = router;
