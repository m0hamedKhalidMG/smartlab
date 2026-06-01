require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db     = require('./database');

function seed() {
  // ── 1. مسح البيانات القديمة ─────────────────────────────
  db.exec(`
    DELETE FROM maintenance_logs;
    DELETE FROM alerts;
    DELETE FROM issues;
    DELETE FROM devices;
    DELETE FROM users;
  `);

  // ── 2. المستخدمون ───────────────────────────────────────
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (@name, @email, @password_hash, @role)
  `);

  const users = [
    { name: 'مدير النظام',   email: 'admin@lab.com', password: 'Admin@123',  role: 'admin' },
    { name: 'فني الصيانة',   email: 'tech@lab.com',  password: 'Tech@123',   role: 'technician' },
    { name: 'مستخدم عادي',   email: 'user@lab.com',  password: 'User@123',   role: 'user' },
  ];

  const userIds = {};
  for (const u of users) {
    const info = insertUser.run({
      name: u.name,
      email: u.email,
      password_hash: bcrypt.hashSync(u.password, 10),
      role: u.role,
    });
    userIds[u.role] = info.lastInsertRowid;
  }

  // ── 3. الأجهزة (20 جهاز) ────────────────────────────────
  const insertDevice = db.prepare(`
    INSERT INTO devices
      (name, type, processor, ram, os, location_x, location_y, age_years, status, purchase_date, last_maintenance, qr_token, notes)
    VALUES
      (@name, @type, @processor, @ram, @os, @location_x, @location_y, @age_years, @status, @purchase_date, @last_maintenance, @qr_token, @notes)
  `);

  const statuses = ['working','working','working','working','working','working',
                    'broken','broken','broken','maintenance'];

  const devices = Array.from({ length: 20 }, (_, i) => {
    const num     = String(i + 1).padStart(2, '0');
    const row     = Math.floor(i / 4);
    const col     = i % 4;
    const age     = parseFloat((Math.random() * 7 + 1).toFixed(1));
    const status  = i < 12 ? 'working' : i < 17 ? 'broken' : 'maintenance';
    return {
      name:             `PC-${num}`,
      type:             i % 3 === 0 ? 'Dell OptiPlex' : i % 3 === 1 ? 'HP ProDesk' : 'Lenovo ThinkCentre',
      processor:        i % 2 === 0 ? 'Intel Core i5-10400' : 'Intel Core i7-8700',
      ram:              i % 2 === 0 ? '8 GB DDR4' : '16 GB DDR4',
      os:               'Windows 11 Pro',
      location_x:       col,
      location_y:       row,
      age_years:        age,
      status,
      purchase_date:    `202${Math.floor(Math.random() * 4)}-01-15`,
      last_maintenance: status === 'working' ? '2025-10-01' : null,
      qr_token:         crypto.randomUUID(),
      notes:            status === 'broken' ? 'يحتاج فحص' : null,
    };
  });

  const deviceIds = devices.map(d => insertDevice.run(d).lastInsertRowid);

  // ── 4. البلاغات (10 بلاغات) ─────────────────────────────
  const insertIssue = db.prepare(`
    INSERT INTO issues
      (device_id, reported_by_id, issue_type, description, status, priority, created_at, resolved_at, resolved_by_id, resolution_notes)
    VALUES
      (@device_id, @reported_by_id, @issue_type, @description, @status, @priority, @created_at, @resolved_at, @resolved_by_id, @resolution_notes)
  `);

  const issueTypes = ['عطل في الشاشة', 'مشكلة في الكيبورد', 'الجهاز لا يعمل', 'بطء شديد', 'مشكلة في الشبكة'];
  const issueDescs = [
    'الشاشة تعرض خطوط رأسية وألوان غير طبيعية',
    'بعض أزرار الكيبورد لا تستجيب عند الضغط',
    'الجهاز لا يستجيب عند تشغيله، يعطي صوت بيب متكرر',
    'الجهاز يستغرق أكثر من 10 دقائق للإقلاع وتشغيل البرامج',
    'الجهاز لا يتصل بالشبكة المحلية رغم توصيل الكابل',
  ];

  const issueIds = [];
  for (let i = 0; i < 10; i++) {
    const isResolved = i < 4;
    const info = insertIssue.run({
      device_id:        deviceIds[i % deviceIds.length],
      reported_by_id:   i % 2 === 0 ? userIds['user'] : userIds['admin'],
      issue_type:       issueTypes[i % 5],
      description:      issueDescs[i % 5],
      status:           isResolved ? 'resolved' : i < 7 ? 'in_progress' : 'open',
      priority:         i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      created_at:       `2026-0${Math.min(i + 1, 9)}-${String(Math.min(i * 3 + 1, 28)).padStart(2,'0')}`,
      resolved_at:      isResolved ? `2026-0${Math.min(i + 1, 9)}-${String(Math.min(i * 3 + 3, 28)).padStart(2,'0')}` : null,
      resolved_by_id:   isResolved ? userIds['technician'] : null,
      resolution_notes: isResolved ? 'تم الإصلاح باستبدال القطعة التالفة' : null,
    });
    issueIds.push(info.lastInsertRowid);
  }

  // ── 5. سجل الصيانة ──────────────────────────────────────
  const insertLog = db.prepare(`
    INSERT INTO maintenance_logs (device_id, issue_id, technician_id, action, duration_hours, cost, created_at)
    VALUES (@device_id, @issue_id, @technician_id, @action, @duration_hours, @cost, @created_at)
  `);

  for (let i = 0; i < 4; i++) {
    insertLog.run({
      device_id:      deviceIds[12 + i],
      issue_id:       issueIds[i],
      technician_id:  userIds['technician'],
      action:         'استبدال قطعة + اختبار الجهاز',
      duration_hours: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
      cost:           Math.floor(Math.random() * 200 + 50),
      created_at:     `2026-0${Math.min(i + 1, 9)}-${String(Math.min(i * 3 + 3, 28)).padStart(2,'0')}`,
    });
  }

  // ── 6. التنبيهات الذكية ──────────────────────────────────
  const insertAlert = db.prepare(`
    INSERT INTO alerts (device_id, type, message, severity, is_read)
    VALUES (@device_id, @type, @message, @severity, @is_read)
  `);

  const alertsData = [
    { device_id: deviceIds[0], type: 'age',             message: 'الجهاز PC-01 عمره أكثر من 5 سنوات، يُنصح بالمراجعة الدورية',          severity: 'medium', is_read: 0 },
    { device_id: deviceIds[1], type: 'age',             message: 'الجهاز PC-02 تجاوز العمر الافتراضي، يُنصح بالاستبدال',                 severity: 'high',   is_read: 0 },
    { device_id: deviceIds[4], type: 'maintenance_gap', message: 'مضى أكثر من 6 أشهر على آخر صيانة للجهاز PC-05',                        severity: 'low',    is_read: 0 },
    { device_id: deviceIds[6], type: 'frequency',       message: 'الجهاز PC-07 تعطل أكثر من 3 مرات هذا الشهر، يحتاج فحصاً شاملاً',      severity: 'high',   is_read: 1 },
    { device_id: deviceIds[9], type: 'maintenance_gap', message: 'الجهاز PC-10 لم يخضع لأي صيانة منذ أكثر من 8 أشهر',                   severity: 'medium', is_read: 1 },
  ];

  for (const a of alertsData) insertAlert.run(a);

  console.log('✅ تم إدراج البيانات التجريبية بنجاح');
  console.log('─────────────────────────────────────');
  console.log('📧 admin@lab.com    / Admin@123  (مدير)');
  console.log('📧 tech@lab.com     / Tech@123   (فني)');
  console.log('📧 user@lab.com     / User@123   (مستخدم)');
  console.log('─────────────────────────────────────');
}

seed();
