require('dotenv').config();
const fetch = require('node-fetch');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL      = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * يرسل وصف العطل إلى Ollama (Llama) محلياً ويعيد اقتراحات التشخيص
 */
async function diagnose(description, deviceType = '', issueHistory = '') {
  const prompt = `أنت مساعد ذكي متخصص في صيانة أجهزة الكمبيوتر في مختبرات الحاسوب.
أجب باللغة العربية فقط بصيغة نقاط مختصرة وعملية.
قدم: 1) الأسباب المحتملة 2) خطوات الفحص 3) الحل المقترح.

نوع الجهاز: ${deviceType || 'غير محدد'}
سجل الأعطال السابقة: ${issueHistory || 'لا يوجد'}
وصف العطل الحالي: ${description}`;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.3, num_predict: 600 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama Error: ${res.status} — ${body}`);
  }

  const data = await res.json();
  return data.response?.trim() || 'لم يتمكن النظام من توليد اقتراحات';
}

module.exports = { diagnose };
