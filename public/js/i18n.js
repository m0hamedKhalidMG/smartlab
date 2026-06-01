/**
 * i18n.js — نظام الترجمة (عربي / English)
 */

const translations = {
  ar: {
    // index.html
    loginTitle: 'تسجيل الدخول — Smart Lab',
    sysName: 'Smart Lab',
    sysDesc: 'نظام إدارة وصيانة مختبرات الحاسب',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'admin@lab.com',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    loginBtn: 'دخول',
    loggingIn: 'جاري الدخول...',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    langBtn: 'English',

    // dashboard.html
    dashboard: 'لوحة التحكم',
    devices: 'الأجهزة',
    issues: 'الأعطال',
    maintenance: 'الصيانة',
    map: 'الخريطة',
    alerts: 'التنبيهات',
    aiAssistant: 'مساعد AI',
    reports: 'التقارير',
    users: 'المستخدمون',
    logout: 'خروج',
    totalDevices: 'إجمالي الأجهزة',
    workingDevices: 'أجهزة تعمل',
    brokenDevices: 'أجهزة متوقفة',
    underMaintenance: 'قيد الصيانة',
    deviceStatusDistribution: 'توزيع حالات الأجهزة',
    latestIssues: 'آخر الأعطال',
    showAll: 'عرض الكل',
    device: 'الجهاز',
    problem: 'المشكلة',
    priority: 'الأولوية',
    status: 'الحالة',
    date: 'التاريخ',
    noIssues: 'لا توجد أعطال',
    unreadAlerts: 'التنبيهات غير المقروءة',
    noUnreadAlerts: 'لا توجد تنبيهات غير مقروءة',
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    open: 'مفتوح',
    in_progress: 'قيد العمل',
    resolved: 'محلول',
    works: 'يعمل',
    stopped: 'متوقف',
    maintenance_short: 'صيانة',
    loading: 'جاري التحميل...',
  },
  en: {
    // index.html
    loginTitle: 'Login — Smart Lab',
    sysName: 'Smart Lab',
    sysDesc: 'Computer Lab Management & Maintenance System',
    emailLabel: 'Email',
    emailPlaceholder: 'admin@lab.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    loginBtn: 'Login',
    loggingIn: 'Logging in...',
    forgotPassword: 'Forgot password?',
    langBtn: 'العربية',

    // dashboard.html
    dashboard: 'Dashboard',
    devices: 'Devices',
    issues: 'Issues',
    maintenance: 'Maintenance',
    map: 'Map',
    alerts: 'Alerts',
    aiAssistant: 'AI Assistant',
    reports: 'Reports',
    users: 'Users',
    logout: 'Logout',
    totalDevices: 'Total Devices',
    workingDevices: 'Working',
    brokenDevices: 'Broken',
    underMaintenance: 'Under Maintenance',
    deviceStatusDistribution: 'Device Status Distribution',
    latestIssues: 'Latest Issues',
    showAll: 'Show All',
    device: 'Device',
    problem: 'Problem',
    priority: 'Priority',
    status: 'Status',
    date: 'Date',
    noIssues: 'No issues found',
    unreadAlerts: 'Unread Alerts',
    noUnreadAlerts: 'No unread alerts',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    works: 'Working',
    stopped: 'Stopped',
    maintenance_short: 'Maintenance',
    loading: 'Loading...',
  }
};

function getLang() {
  return localStorage.getItem('lang') || 'ar';
}

function setLanguage(lang) {
  if (!translations[lang]) lang = 'ar';
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
  // Dispatch event so pages can re-render dynamic content
  window.dispatchEvent(new Event('languagechange'));
}

function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] ?? translations['ar']?.[key] ?? key;
}

function applyTranslations() {
  // text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[getLang()]?.[key]) {
      el.textContent = translations[getLang()][key];
    }
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[getLang()]?.[key]) {
      el.placeholder = translations[getLang()][key];
    }
  });
  // title attribute
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (translations[getLang()]?.[key]) {
      el.title = translations[getLang()][key];
    }
  });
  // document title
  const titleEl = document.querySelector('title[data-i18n]');
  if (titleEl) {
    const key = titleEl.dataset.i18n;
    if (translations[getLang()]?.[key]) {
      document.title = translations[getLang()][key];
    }
  }
  // update lang switcher button text if it exists
  const switcher = document.getElementById('lang-switcher');
  if (switcher) {
    switcher.textContent = t('langBtn');
  }
}

// Init on load
(function init() {
  const saved = getLang();
  document.documentElement.lang = saved;
  document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();

export { getLang, setLanguage, t, applyTranslations };
