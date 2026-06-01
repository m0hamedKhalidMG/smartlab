/**
 * predictor.js — نموذج تنبؤ بسيط يحسب احتمالية تعطل الجهاز
 * يستخدم "scoring model" مبني على الأنماط التاريخية للبيانات
 */
const db = require('../db/database');

/**
 * يحسب درجة الخطر (0-100) لكل جهاز بناءً على:
 * 1. عمر الجهاز
 * 2. فترة الصيانة
 * 3. تكرار الأعطال
 * 4. متوسط وقت الإصلاح
 * 5. الحالة الحالية
 */
function calculateRiskScore(device) {
  let score = 0;
  const now = new Date();

  // 1. عمر الجهاز (0-25 نقطة) — كل سنة = ~3.5 نقطة
  score += Math.min(device.age_years * 3.5, 25);

  // 2. فجوة الصيانة (0-25 نقطة)
  if (device.last_maintenance) {
    const daysSince = (now - new Date(device.last_maintenance)) / (1000 * 60 * 60 * 24);
    score += Math.min(daysSince / 12, 25); // كل ~12 يوم = نقطة
  } else {
    score += 25; // لم تتم صيانته أبداً
  }

  // 3. تكرار الأعطال في آخر 3 شهور (0-25 نقطة)
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentIssues = db.prepare(`
    SELECT COUNT(*) as c FROM issues
    WHERE device_id = ? AND created_at >= ?
  `).get(device.id, threeMonthsAgo.toISOString().split('T')[0]).c;
  score += Math.min(recentIssues * 8, 25);

  // 4. متوسط وقت الإصلاح للجهاز (0-15 نقطة)
  const avgFix = db.prepare(`
    SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg_hours
    FROM issues WHERE device_id = ? AND status = 'resolved' AND resolved_at IS NOT NULL
  `).get(device.id).avg_hours;
  if (avgFix) {
    score += Math.min(avgFix / 8, 15); // كل 8 ساعات = نقطة
  }

  // 5. الحالة الحالية (0-10 نقاط)
  if (device.status === 'broken') score += 10;
  else if (device.status === 'maintenance') score += 5;

  return Math.min(Math.round(score), 100);
}

/**
 * يحسب احتمالية التعطل (0-100%) ويحدد شدة التنبيه
 */
function predictFailure(device) {
  const score = calculateRiskScore(device);

  let probability;
  if (score >= 80) probability = 'عالي جداً';
  else if (score >= 60) probability = 'عالٍ';
  else if (score >= 40) probability = 'متوسط';
  else if (score >= 20) probability = 'منخفض';
  else probability = 'منخفض جداً';

  let severity;
  if (score >= 75) severity = 'high';
  else if (score >= 45) severity = 'medium';
  else severity = 'low';

  return { score, probability, severity };
}

/**
* يحلل جميع الأجهزة ويُرجع قائمة بالتوقعات
*/
function predictAll() {
  const devices = db.prepare('SELECT * FROM devices').all();
  const predictions = [];

  for (const device of devices) {
    const pred = predictFailure(device);
    if (pred.score >= 30) { // نعرض فقط الأجهزة ذات الخطر المتوسط فما فوق
      predictions.push({
        device_id: device.id,
        device_name: device.name,
        device_type: device.type,
        ...pred
      });
    }
  }

  // ترتيب تنازلي حسب الخطر
  predictions.sort((a, b) => b.score - a.score);
  return predictions;
}

module.exports = { calculateRiskScore, predictFailure, predictAll };
