require('dotenv').config();
const jwt = require('jsonwebtoken');
const db  = require('../db/database');

/**
 * التحقق من JWT وإرفاق بيانات المستخدم بالطلب
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح — يلزم تسجيل الدخول' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ error: 'المستخدم غير موجود' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'الجلسة منتهية، يرجى تسجيل الدخول مجدداً' });
  }
}

/**
 * مصنع guards للأدوار — مثال: authorize('admin') أو authorize('admin','technician')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'غير مصرح' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لهذه العملية' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
