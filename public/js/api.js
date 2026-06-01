/**
 * api.js — fetch wrapper مشترك
 * يضيف JWT header تلقائياً لكل طلب
 */

const BASE = '';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

/** طلب API عام */
export async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) { logout(); return; }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/** GET */
export const apiGet  = (path)        => api(path, { method: 'GET' });

/** POST */
export const apiPost = (path, body)  => api(path, { method: 'POST',  body: JSON.stringify(body) });

/** PUT */
export const apiPut  = (path, body)  => api(path, { method: 'PUT',   body: JSON.stringify(body) });

/** PATCH */
export const apiPatch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });

/** DELETE */
export const apiDel  = (path)        => api(path, { method: 'DELETE' });

/** POST FormData (لرفع صور) */
export async function apiForm(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method: 'POST', headers, body: formData });
  if (res.status === 401) { logout(); return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/** إظهار Toast إشعار */
export function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/** تحويل التاريخ لعربي مقروء */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** حماية الصفحة — إذا لم يكن مسجلاً يحوّله للدخول */
export function requireAuth() {
  if (!getToken()) { window.location.href = '/index.html'; return null; }
  return getUser();
}

/** حماية بالدور */
export function requireRole(...roles) {
  const user = requireAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) { window.location.href = '/dashboard.html'; return null; }
  return user;
}

/** ملء اسم المستخدم في الـ topbar */
export function fillTopbar() {
  const user = getUser();
  if (!user) return;
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = user.name;

  const avatarEl = document.getElementById('user-avatar');
  if (avatarEl) avatarEl.textContent = user.name?.[0] || 'م';
}

/** تفعيل nav-item النشط حسب الصفحة الحالية */
export function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.dataset.page === page) el.classList.add('active');
  });
}

/** Debounce */
export function debounce(fn, delay = 500) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

/** حماية الصفحة حسب الدور — إذا لم يكن مسموحاً يُحوّل للوحة التحكم */
export function guardPage(...roles) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

/** إخفاء روابط الشريط الجانبي غير المسموح بها */
export function filterSidebar() {
  const user = getUser();
  if (!user) return;
  document.querySelectorAll('.sidebar-nav a[data-roles]').forEach(el => {
    const allowed = el.dataset.roles.split(',').map(r => r.trim());
    if (!allowed.includes(user.role)) el.style.display = 'none';
  });
}
