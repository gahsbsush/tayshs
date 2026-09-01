/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Device } from '@capacitor/device';

// آدرس Cloudflare Worker خودتان را اینجا قرار دهید (بعد از دیپلوی با wrangler)
// مثال: https://baharnaranj-license.your-subdomain.workers.dev
export const LICENSE_API_BASE_URL = 'https://REPLACE-WITH-YOUR-WORKER-URL.workers.dev';

const STORAGE_KEY = 'bnc_license_state_v1';

export interface LicenseState {
  activated: boolean;
  code: string;
  deviceId: string;
  token: string;
  activatedAt: number;
}

/**
 * شناسه یکتای دستگاه را برمی‌گرداند.
 * در اندروید Capacitor یک UUID پایدار (وابسته به نصب اپ) تولید می‌کند که
 * تا زمانی که اپ حذف نشود ثابت می‌ماند.
 */
export async function getDeviceId(): Promise<string> {
  try {
    const info = await Device.getId();
    if (info?.identifier) return info.identifier;
  } catch (e) {
    // در محیط وب (مرورگر) پلاگین Device ممکن است شناسه محدودی بدهد
  }
  // fallback: یک شناسه محلی بساز و در localStorage ذخیره کن
  let fallback = localStorage.getItem('bnc_fallback_device_id');
  if (!fallback) {
    fallback = 'web-' + crypto.randomUUID();
    localStorage.setItem('bnc_fallback_device_id', fallback);
  }
  return fallback;
}

export function getStoredLicense(): LicenseState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.activated) return parsed as LicenseState;
    return null;
  } catch {
    return null;
  }
}

function storeLicense(state: LicenseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearLicense() {
  localStorage.removeItem(STORAGE_KEY);
}

export type ActivationResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'used-elsewhere' | 'network' | 'server'; message: string };

/**
 * کد لایسنس را با سرور Cloudflare Worker چک و به این دستگاه متصل می‌کند.
 */
export async function activateLicense(code: string): Promise<ActivationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: false, reason: 'invalid', message: 'کد لایسنس را وارد کنید.' };
  }

  const deviceId = await getDeviceId();

  try {
    const res = await fetch(`${LICENSE_API_BASE_URL}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalized, deviceId }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.ok) {
      storeLicense({
        activated: true,
        code: normalized,
        deviceId,
        token: data.token || '',
        activatedAt: Date.now(),
      });
      return { ok: true };
    }

    if (res.status === 409) {
      return {
        ok: false,
        reason: 'used-elsewhere',
        message: 'این کد لایسنس قبلاً روی یک دستگاه دیگر فعال شده است.',
      };
    }

    if (res.status === 404) {
      return { ok: false, reason: 'invalid', message: 'کد لایسنس نامعتبر است.' };
    }

    return {
      ok: false,
      reason: 'server',
      message: data?.message || 'خطایی در سرور رخ داد. دوباره تلاش کنید.',
    };
  } catch (e) {
    return {
      ok: false,
      reason: 'network',
      message: 'اتصال به اینترنت برقرار نیست. لطفاً اتصال خود را بررسی کنید.',
    };
  }
}
