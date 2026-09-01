/**
 * Cloudflare Worker — سیستم لایسنس تقویم شیشه‌ای بهارنارنج
 *
 * Endpoints:
 *   POST /activate            { code, deviceId }               -> فعال‌سازی/تایید کد روی یک دستگاه
 *   POST /admin/generate      { count }  header: X-Admin-Secret -> ساخت کدهای جدید
 *   GET  /admin/list          header: X-Admin-Secret            -> لیست همه‌ی کدها و وضعیتشان
 *   POST /admin/revoke        { code }   header: X-Admin-Secret -> ابطال یک کد (آزادسازی از دستگاه)
 *
 * نیازمند یک KV Namespace با نام binding = LICENSES (در wrangler.toml تنظیم شده)
 * و یک متغیر محرمانه ADMIN_SECRET (با دستور: wrangler secret put ADMIN_SECRET)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function randomCode() {
  // فرمت: XXXX-XXXX-XXXX (بدون حروف/اعداد شبیه‌به‌هم مثل O,0,I,1)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const group = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${group()}-${group()}-${group()}`;
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function checkAdmin(request, env) {
  const secret = request.headers.get('X-Admin-Secret');
  return secret && env.ADMIN_SECRET && secret === env.ADMIN_SECRET;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // ---------- فعال‌سازی برای کاربر نهایی ----------
    if (url.pathname === '/activate' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, message: 'بدنه‌ی درخواست نامعتبر است.' }, 400);
      }

      const code = String(body.code || '').trim().toUpperCase();
      const deviceId = String(body.deviceId || '').trim();

      if (!code || !deviceId) {
        return json({ ok: false, message: 'کد یا شناسه‌ی دستگاه ارسال نشده.' }, 400);
      }

      const key = `license:${code}`;
      const raw = await env.LICENSES.get(key);

      if (!raw) {
        return json({ ok: false, message: 'کد لایسنس یافت نشد.' }, 404);
      }

      const record = JSON.parse(raw);

      if (record.status === 'revoked') {
        return json({ ok: false, message: 'این کد ابطال شده است.' }, 403);
      }

      if (record.status === 'used') {
        if (record.deviceId === deviceId) {
          // همون دستگاهه (مثلا نصب مجدد اپ) - اجازه بده
          const token = await sha256Hex(`${code}:${deviceId}:${env.ADMIN_SECRET || 'salt'}`);
          return json({ ok: true, token });
        }
        return json({ ok: false, message: 'این کد قبلاً روی دستگاه دیگری فعال شده است.' }, 409);
      }

      // status === 'unused' -> فعال‌سازی برای این دستگاه
      record.status = 'used';
      record.deviceId = deviceId;
      record.activatedAt = Date.now();
      await env.LICENSES.put(key, JSON.stringify(record));

      const token = await sha256Hex(`${code}:${deviceId}:${env.ADMIN_SECRET || 'salt'}`);
      return json({ ok: true, token });
    }

    // ---------- ساخت کدهای جدید (فقط ادمین) ----------
    if (url.pathname === '/admin/generate' && request.method === 'POST') {
      if (!checkAdmin(request, env)) return json({ ok: false, message: 'دسترسی غیرمجاز.' }, 401);

      let body = {};
      try {
        body = await request.json();
      } catch {}
      const count = Math.min(Math.max(parseInt(body.count) || 1, 1), 500);

      const codes = [];
      for (let i = 0; i < count; i++) {
        let code;
        // جلوگیری از برخورد تصادفی با کد قبلی
        do {
          code = randomCode();
        } while (await env.LICENSES.get(`license:${code}`));

        const record = { status: 'unused', deviceId: null, createdAt: Date.now(), activatedAt: null };
        await env.LICENSES.put(`license:${code}`, JSON.stringify(record));
        codes.push(code);
      }

      return json({ ok: true, codes });
    }

    // ---------- لیست کدها (فقط ادمین) ----------
    if (url.pathname === '/admin/list' && request.method === 'GET') {
      if (!checkAdmin(request, env)) return json({ ok: false, message: 'دسترسی غیرمجاز.' }, 401);

      const list = await env.LICENSES.list({ prefix: 'license:' });
      const items = [];
      for (const k of list.keys) {
        const raw = await env.LICENSES.get(k.name);
        items.push({ code: k.name.replace('license:', ''), ...JSON.parse(raw) });
      }
      return json({ ok: true, items });
    }

    // ---------- ابطال یک کد (فقط ادمین) ----------
    if (url.pathname === '/admin/revoke' && request.method === 'POST') {
      if (!checkAdmin(request, env)) return json({ ok: false, message: 'دسترسی غیرمجاز.' }, 401);

      let body = {};
      try {
        body = await request.json();
      } catch {}
      const code = String(body.code || '').trim().toUpperCase();
      const key = `license:${code}`;
      const raw = await env.LICENSES.get(key);
      if (!raw) return json({ ok: false, message: 'کد یافت نشد.' }, 404);

      const record = JSON.parse(raw);
      record.status = 'revoked';
      await env.LICENSES.put(key, JSON.stringify(record));
      return json({ ok: true });
    }

    return json({ ok: false, message: 'مسیر یافت نشد.' }, 404);
  },
};
