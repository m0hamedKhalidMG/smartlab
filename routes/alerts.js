const express = require('express');
const db      = require('../db/database');
const { runModel } = require('../services/ml_bridge');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/alerts — قائمة التنبيهات (admin/tech فقط)
router.get('/', authenticate, authorize('admin', 'technician'), (req, res) => {
  const { severity, is_read, type } = req.query;
  let where = '1=1';
  const params = [];

  if (severity !== undefined) { where += ' AND a.severity = ?'; params.push(severity); }
  if (is_read  !== undefined) { where += ' AND a.is_read = ?';  params.push(Number(is_read)); }
  if (type     !== undefined) { where += ' AND a.type = ?';     params.push(type); }

  const alerts = db.prepare(`
    SELECT a.*, d.name AS device_name
    FROM alerts a
    LEFT JOIN devices d ON a.device_id = d.id
    WHERE ${where}
    ORDER BY a.created_at DESC
  `).all(...params);

  const unread = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE is_read = 0").get().c;
  res.json({ alerts, unread });
});

// GET /api/alerts/predictions — تنبؤات النموذج المُدرَّب (admin/tech فقط)
router.get('/predictions', authenticate, authorize('admin', 'technician'), async (req, res) => {
  try {
    const result = await runModel('predict');
    res.json({ predictions: result.predictions || [] });
  } catch (err) {
    console.error('ML predict error:', err.message);
    res.status(500).json({ error: 'فشل تشغيل نموذج التنبؤ المُدرَّب' });
  }
});

// POST /api/alerts/predictions/run — تشغيل النموذج يدوياً (admin/tech)
router.post('/predictions/run', authenticate, authorize('admin', 'technician'), async (req, res) => {
  try {
    const result = await runModel('predict');
    const predictions = result.predictions || [];
    let created = 0;
    for (const p of predictions) {
      if (p.score < 30) continue; // فقط الخطر المتوسط فما فوق
      const existing = db.prepare(`
        SELECT id FROM alerts
        WHERE device_id = ? AND type = 'prediction' AND is_read = 0
          AND DATE(created_at) = DATE('now')
      `).get(p.device_id);
      if (!existing) {
        db.prepare(`
          INSERT INTO alerts (device_id, type, message, severity)
          VALUES (?, 'prediction', ?, ?)
        `).run(
          p.device_id,
          `🤖 تنبؤ بالنموذج المُدرَّب: الجهاز ${p.device_name} احتمالية تعطل ${p.probability} (${p.score}%)`,
          p.severity
        );
        created++;
      }
    }
    res.json({ message: `تم إنشاء ${created} تنبيه جديد`, predictions, created });
  } catch (err) {
    console.error('ML run error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/read-all — تحديد الكل كمقروء
router.patch('/read-all', authenticate, authorize('admin', 'technician'), (_req, res) => {
  db.prepare("UPDATE alerts SET is_read = 1 WHERE is_read = 0").run();
  res.json({ message: 'تم تحديد كل التنبيهات كمقروءة' });
});

// PATCH /api/alerts/:id/read — تحديد تنبيه واحد كمقروء
router.patch('/:id/read', authenticate, authorize('admin', 'technician'), (req, res) => {
  const alert = db.prepare('SELECT id FROM alerts WHERE id = ?').get(req.params.id);
  if (!alert) return res.status(404).json({ error: 'التنبيه غير موجود' });
  db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'تم التحديث' });
});

module.exports = router;
