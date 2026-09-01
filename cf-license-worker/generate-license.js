/**
 * ساخت کد لایسنس جدید — به روش ساده
 *
 * استفاده:
 *   1. مقدار WORKER_URL و ADMIN_SECRET رو پایین‌تر جایگزین کن.
 *   2. توی CMD/ترمینال بنویس:   node generate-license.js
 *   3. کد لایسنس روی صفحه نشون داده می‌شه.
 *
 * برای ساخت چند کد با هم، عدد COUNT رو تغییر بده.
 */

const WORKER_URL = 'https://curly-term-7ae2.pes12c3.workers.dev'; // آدرس Workerت
const ADMIN_SECRET = 'ssuwujwsbsbshshsh@ywhwhaushsy@#$';                  // رمزی که توی Cloudflare گذاشتی
const COUNT = 1; // چند تا کد می‌خوای بسازی

fetch(`${WORKER_URL}/admin/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Secret': ADMIN_SECRET,
  },
  body: JSON.stringify({ count: COUNT }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.ok) {
      console.log('✅ کد(های) لایسنس ساخته شد:');
      data.codes.forEach((c) => console.log('   ' + c));
    } else {
      console.log('❌ خطا:', data.message);
    }
  })
  .catch((err) => {
    console.log('❌ اتصال برقرار نشد. آدرس Worker یا اینترنت رو چک کن.');
    console.log(err.message);
  });
