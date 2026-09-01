/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, CalendarRange, Sparkles } from 'lucide-react';
import { CustomTheme } from '../types';
import { gregorianToJalali, jalaliToGregorian, toPersianDigits, JALALI_MONTHS_FA } from '../utils/dateConverter';

interface DateConverterWidgetProps {
  currentTheme: CustomTheme;
  onNavigateToDate: (jm: number, jd: number) => void;
}

export default function DateConverterWidget({ currentTheme, onNavigateToDate }: DateConverterWidgetProps) {
  const [mode, setMode] = useState<'j2g' | 'g2j'>('j2g');

  const isDarkSeason = currentTheme.season === 'autumn';

  // --- Jalali relative states ---
  const [jy, setJy] = useState(1405);
  const [jm, setJm] = useState(1);
  const [jd, setJd] = useState(1);

  // --- Gregorian relative states ---
  const [gy, setGy] = useState(2026);
  const [gm, setGm] = useState(5);
  const [gd, setGd] = useState(31);

  // Auto trigger calculation when input changes for Jalali -> Gregorian
  const j2gResult = useMemo(() => {
    try {
      const [gYear, gMonth, gDay] = jalaliToGregorian(jy, jm, jd);
      return { gy: gYear, gm: gMonth, gd: gDay };
    } catch {
      return { gy: 0, gm: 0, gd: 0 };
    }
  }, [jy, jm, jd]);

  // Auto trigger calculation when input changes for Gregorian -> Jalali
  const g2jResult = useMemo(() => {
    try {
      const [jYear, jMonth, jDay] = gregorianToJalali(gy, gm, gd);
      return { jy: jYear, jm: jMonth, jd: jDay };
    } catch {
      return { jy: 0, jm: 0, jd: 0 };
    }
  }, [gy, gm, gd]);

  return (
    <div className={`p-4 rounded-3xl border shadow-sm space-y-3.5 select-none text-right transition-all duration-300 ${
      isDarkSeason 
        ? 'bg-[#180e1c]/75 border-purple-500/10 text-stone-105' 
        : 'bg-gradient-to-br from-white to-slate-50/80 border-slate-250/35 text-slate-800 shadow-slate-900/5'
    }`} style={{ direction: 'rtl' }}>
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b pb-2.5 border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-black">
          <CalendarRange className="w-4 h-4 text-purple-500" />
          <span>مبدل تاریخ فوق پیشرفته شمسی و میلادی</span>
        </div>
        
        {/* Toggle Mode */}
        <button
          onClick={() => setMode(prev => prev === 'j2g' ? 'g2j' : 'j2g')}
          className="text-[10px] font-sans font-bold flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{mode === 'j2g' ? 'تبدیل شمسی 👈 میلادی' : 'تبدیل میلادی 👈 شمسی'}</span>
        </button>
      </div>

      {mode === 'j2g' ? (
        <div className="space-y-3">
          {/* Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] opacity-60 block">سال شمسی</label>
              <input
                type="number"
                value={jy}
                onChange={e => setJy(Math.max(1200, Math.min(1500, Number(e.target.value))))}
                className="w-full text-center px-1.5 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 border-slate-200/55 dark:border-white/10 outline-none text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] opacity-60 block">ماه شمسی</label>
              <select
                value={jm}
                onChange={e => setJm(Number(e.target.value))}
                className="w-full text-center px-1 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 border-slate-200/55 dark:border-white/10 outline-none text-xs font-sans font-bold"
              >
                {JALALI_MONTHS_FA.map((m, idx) => (
                  <option key={m} value={idx + 1} className="text-black">{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] opacity-60 block">روز شمسی</label>
              <input
                type="number"
                value={jd}
                onChange={e => setJd(Math.max(1, Math.min(31, Number(e.target.value))))}
                className="w-full text-center px-1.5 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 border-slate-200/55 dark:border-white/10 outline-none text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Output banner */}
          <div className={`p-3 rounded-2xl text-center border space-y-1 bg-purple-500/5 border-purple-500/10`}>
            <span className="text-[9px] opacity-60 block">نتیجه تبدیل به تاریخ میلادی</span>
            <p className="text-sm font-sans font-black text-purple-600 dark:text-purple-300">
              {toPersianDigits(j2gResult.gy)} / {toPersianDigits(j2gResult.gm)} / {toPersianDigits(j2gResult.gd)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] opacity-60 block">سال میلادی</label>
              <input
                type="number"
                value={gy}
                onChange={e => setGy(Math.max(1800, Math.min(2100, Number(e.target.value))))}
                className="w-full text-center px-1.5 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 border-slate-200/55 dark:border-white/10 outline-none text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] opacity-60 block">ماه میلادی</label>
              <input
                type="number"
                value={gm}
                onChange={e => setGm(Math.max(1, Math.min(12, Number(e.target.value))))}
                className="w-full text-center px-1.5 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 border-slate-200/55 dark:border-white/10 outline-none text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] opacity-60 block">روز میلادی</label>
              <input
                type="number"
                value={gd}
                onChange={e => setGd(Math.max(1, Math.min(31, Number(e.target.value))))}
                className="w-full text-center px-1.5 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 border-slate-200/55 dark:border-white/10 outline-none text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Output banner */}
          <div className={`p-3 rounded-2xl text-center border space-y-1.5 bg-indigo-500/5 border-indigo-500/10`}>
            <span className="text-[9px] opacity-60 block">نتیجه تبدیل به تاریخ هجری شمسی</span>
            <p className="text-sm font-sans font-black text-indigo-600 dark:text-indigo-300">
              {toPersianDigits(g2jResult.jy)} / {toPersianDigits(g2jResult.jm)} / {toPersianDigits(g2jResult.jd)}
            </p>
            
            {/* Live navigation to view converter in calendar directly */}
            <button
              onClick={() => {
                if (g2jResult.jy > 0) {
                  onNavigateToDate(g2jResult.jm, g2jResult.jd);
                }
              }}
              className="text-[9px] font-sans font-bold text-center underline opacity-75 hover:opacity-100 transition-all cursor-pointer block mx-auto text-indigo-500 dark:text-indigo-350"
            >
              نمایش این روز در شبکه‌های تقویم بهارنارنج 📅
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
