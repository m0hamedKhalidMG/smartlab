const cron = require('node-cron');
const db   = require('../db/database');
const { runModel } = require('./ml_bridge');

/**
 * يُنشئ تنبيهاً فقط إذا لم يكن موجوداً مسبقاً لنفس الجهاز ونفس النوع
 */
function createAlertIfNew(device_id, type, message, severity) {
  const existing = db.prepare(`
    SELECT id FROM alerts
    WHERE device_id = ? AND type = ? AND is_read = 0
      AND DATE(created_at) = DATE('now')
  `).get(device_id, type);

  if (!existing) {
    db.prepare('INSERT INTO alerts (device_id, type, message, severity) VALUES (?, ?, ?, ?)').run(device_id, type, message, severity);
    console.log(`🔔 تنبيه جديد: ${message}`);
  }
}

async function runPredictiveCheck() {
  const devices = db.prepare('SELECT * FROM devices').all();
  const now     = new Date();

  for (const device of devices) {
    // 1. فحص العمر > 5 سنوات
    if (device.age_years > 5) {
      const severity = device.age_years > 7 ? 'high' : 'medium';
      createAlertIfNew(
        device.id, 'age',
        `الجهاز ${device.name} عمره ${device.age_years} سنوات، يُنصح بالمراجعة أو الاستبدال`,
        severity
      );
    }

    // 2. فحص تكرار الأعطال > 3 في الشهر الأخير
    const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);
    const freq = db.prepare(`
      SELECT COUNT(*) as c FROM issues
      WHERE device_id = ? AND created_at >= ?
    `).get(device.id, monthAgo.toISOString().split('T')[0]).c;

    if (freq >= 3) {
      createAlertIfNew(
        device.id, 'frequency',
        `الجهاز ${device.name} تعطل ${freq} مرات خلال الشهر الماضي، يحتاج فحصاً شاملاً`,
        'high'
      );
    }

    // 3. فحص فجوة الصيانة > 6 أشهر
    if (device.last_maintenance) {
      const lastMaint = new Date(device.last_maintenance);
      const monthsDiff = (now - lastMaint) / (1000 * 60 * 60 * 24 * 30);
      if (monthsDiff > 6) {
        createAlertIfNew(
          device.id, 'maintenance_gap',
          `مضى ${Math.floor(monthsDiff)} شهراً على آخر صيانة للجهاز ${device.name}`,
          monthsDiff > 9 ? 'medium' : 'low'
        );
      }
    }
  }

  // 4. نموذج التنبؤ المُدرَّب — Random Forest
  try {
    const result = await runModel('predict');
    if (result.predictions) {
      for (const p of result.predictions) {
        if (p.score >= 30) { // فقط الأجهزة ذات الخطر المتوسط فما فوق
          createAlertIfNew(
            p.device_id,
            'prediction',
            `🤖 تنبؤ بالنموذج المُدرَّب: الجهاز ${p.device_name} احتمالية تعطل ${p.probability} (${p.score}%)`,
            p.severity
          );
        }
      }
    }
  } catch (err) {
    console.error('❌ ML Model error:', err.message);
  }
}

// تشغيل عند بدء السيرفر
runPredictiveCheck().catch(err => console.error('Startup predictive check failed:', err.message));

// جدولة: كل يوم الساعة 8 صباحاً
cron.schedule('0 8 * * *', () => {
  console.log('⏰ تشغيل فحص التنبيهات التنبؤية...');
  runPredictiveCheck().catch(err => console.error('Cron predictive check failed:', err.message));
});

console.log('✅ خدمة التنبيهات التنبؤية تعمل (Random Forest)');
