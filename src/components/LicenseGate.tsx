/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { KeyRound, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { activateLicense, getStoredLicense, ActivationResult } from '../lib/license';

interface LicenseGateProps {
  children: React.ReactNode;
}

export default function LicenseGate({ children }: LicenseGateProps) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStoredLicense();
    setUnlocked(!!existing);
    setChecking(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result: ActivationResult = await activateLicense(code);
    setSubmitting(false);
    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setUnlocked(true);
  }

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-lg font-bold text-white">تقویم شیشه‌ای بهارنارنج</h1>
          <p className="text-sm text-white/60 mt-1">
            برای استفاده از این نرم‌افزار، کد لایسنس خود را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: XXXX-XXXX-XXXX"
              dir="ltr"
              className="w-full text-center tracking-widest bg-white/5 border border-white/15 rounded-xl py-3 pr-10 pl-3 text-white placeholder-white/30 outline-none focus:border-emerald-400/50 focus:bg-white/10 transition"
              autoFocus
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال بررسی...
              </>
            ) : (
              'فعال‌سازی'
            )}
          </button>
        </form>

        <p className="text-[11px] text-white/30 text-center mt-5">
          هر کد لایسنس فقط روی یک دستگاه قابل استفاده است.
        </p>
      </div>
    </div>
  );
}
