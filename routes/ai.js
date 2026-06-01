const express   = require('express');
const db        = require('../db/database');
const { diagnose } = require('../services/deepseek');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/ai/diagnose — تشخيص العطل بالذكاء الاصطناعي (جميع الأدوار)
router.post('/diagnose', authenticate, async (req, res) => {
  const { description, device_id } = req.body;
  if (!description || description.trim().length < 5) {
    return res.status(400).json({ error: 'يرجى إدخال وصف أوضح للعطل (5 أحرف على الأقل)' });
  }

  let deviceType    = '';
  let issueHistory  = '';

  if (device_id) {
    const device = db.prepare('SELECT name, type FROM devices WHERE id = ?').get(device_id);
    if (device) deviceType = `${device.name} (${device.type})`;

    const history = db.prepare(`
      SELECT issue_type, description FROM issues
      WHERE device_id = ? AND status = 'resolved'
      ORDER BY created_at DESC LIMIT 3
    `).all(device_id);

    if (history.length) {
      issueHistory = history.map(h => `• ${h.issue_type}: ${h.description}`).join('\n');
    }
  }

  try {
    const suggestion = await diagnose(description.trim(), deviceType, issueHistory);
    res.json({ suggestion });
  } catch (err) {
    console.error('Gemini Error:', err.message);
    res.status(502).json({ error: 'فشل الاتصال بخدمة الذكاء الاصطناعي، يرجى المحاولة مرة أخرى' });
  }
});

module.exports = router;
