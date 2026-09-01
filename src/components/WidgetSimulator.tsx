/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Settings, 
  Layers, 
  Check, 
  Palette, 
  Type, 
  Eye, 
  Sparkles,
  Clock,
  Calendar,
  BookOpen
} from 'lucide-react';
import { CustomTheme } from '../types';
import { toPersianDigits, JALALI_MONTHS_FA, HIJRI_MONTHS_FA, getWeekdayName } from '../utils/dateConverter';
import { calculatePrayerTimes, IRAN_CITIES } from '../utils/prayerTimes';

interface WidgetSimulatorProps {
  currentTheme: CustomTheme;
  jy: number;
  jm: number;
  jd: number;
  gy: number;
  gm: number;
  gd: number;
  dayOfWeek: number;
  hijriText: string;
}

type WidgetType = 'minimal_date' | 'sharia_times' | 'compact_clock' | 'wisdom';

export default function WidgetSimulator({ 
  currentTheme, 
  jy, 
  jm, 
  jd, 
  gy, 
  gm, 
  gd,
  dayOfWeek,
  hijriText 
}: WidgetSimulatorProps) {
  const [selectedWidget, setSelectedWidget] = useState<WidgetType>('minimal_date');
  
  // Custom Widget Styling Controls
  const [widgetBg, setWidgetBg] = useState<'solid' | 'transparent' | 'gradient' | 'glass'>('glass');
  const [widgetTextColor, setWidgetTextColor] = useState<'dark' | 'light' | 'accent'>('light');
  const [showAlternativeCalendar, setShowAlternativeCalendar] = useState(true);
  const [selectedCity, setSelectedCity] = useState('تهران');

  const isDarkSeason = currentTheme.season === 'autumn';

  // Compute daily parameters
  const dayName = useMemo(() => {
    return getWeekdayName(dayOfWeek);
  }, [dayOfWeek]);

  const activeCityCoords = useMemo(() => {
    return IRAN_CITIES.find(c => c.name === selectedCity) || IRAN_CITIES[0];
  }, [selectedCity]);

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(gy, gm, gd, activeCityCoords.lat, activeCityCoords.lng);
  }, [gy, gm, gd, activeCityCoords]);

  // Generate Current Time string
  const timeString = useMemo(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, []);

  // Widget background style calculations
  const widgetBoxStyle = useMemo(() => {
    switch (widgetBg) {
      case 'solid':
        return isDarkSeason ? 'bg-stone-900 border-stone-800' : 'bg-white border-slate-200';
      case 'transparent':
        return 'bg-transparent border-dashed border-2 border-slate-300 dark:border-white/20';
      case 'gradient':
        return isDarkSeason 
          ? 'bg-gradient-to-tr from-purple-950 via-[#1b1022] to-amber-950/40 border-purple-550/20 shadow-lg'
          : 'bg-gradient-to-br from-indigo-50 via-white to-amber-50/50 border-indigo-100 shadow-sm';
      case 'glass':
      default:
        return isDarkSeason
          ? 'bg-stone-950/70 backdrop-blur-xl border-white/10 shadow-xl'
          : 'bg-white/80 backdrop-blur-md border-white/40 shadow-md';
    }
  }, [widgetBg, isDarkSeason]);

  // Widget Text color styles
  const textStyle = useMemo(() => {
    if (widgetTextColor === 'accent') {
      return {
        primary: 'text-purple-650 dark:text-purple-300',
        secondary: 'text-amber-550 dark:text-amber-400',
        muted: 'opacity-70 text-slate-700 dark:text-stone-300'
      };
    }
    if (widgetTextColor === 'dark') {
      return {
        primary: 'text-slate-900',
        secondary: 'text-slate-700',
        muted: 'text-slate-500'
      };
    }
    // Default light/auto text
    return {
      primary: isDarkSeason ? 'text-stone-100' : 'text-slate-800',
      secondary: isDarkSeason ? 'text-purple-300' : 'text-amber-600',
      muted: isDarkSeason ? 'text-slate-400' : 'text-slate-500'
    };
  }, [widgetTextColor, isDarkSeason]);

  return (
    <div className={`p-4 rounded-3xl border shadow-sm space-y-4 select-none text-right transition-all ${
      isDarkSeason 
        ? 'bg-[#1a0f21]/75 border-purple-500/10 text-stone-105' 
        : 'bg-white/95 border-slate-250/35 text-slate-800'
    }`} style={{ direction: 'rtl' }}>

      {/* Widget Header Title */}
      <div className="flex items-center justify-between border-b pb-3 border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
            <Smartphone className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="font-sans font-black text-xs sm:text-sm">📱 شبیه‌ساز و مرکز ویجت‌های بهارنارنج</h4>
            <p className="text-[9px] opacity-65 font-sans mt-0.5">سفارشی‌سازی و نمایش ویجت‌های سبک اندروید روی صفحه خانگی شما</p>
          </div>
        </div>
      </div>

      {/* Grid selector of widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setSelectedWidget('minimal_date')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedWidget === 'minimal_date'
              ? 'border-purple-500/60 bg-purple-550/10 text-purple-600 dark:text-purple-300 font-bold'
              : 'border-slate-100/60 dark:border-stone-800 bg-black/5 dark:bg-white/5 text-xs opacity-75'
          }`}
        >
          <Calendar className="w-4 h-4 mx-auto mb-1 opacity-70" />
          <span className="text-[10px] block font-sans">ویجت مینیمال تاریخ</span>
        </button>

        <button
          onClick={() => setSelectedWidget('sharia_times')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedWidget === 'sharia_times'
              ? 'border-purple-500/60 bg-purple-550/10 text-purple-600 dark:text-purple-300 font-bold'
              : 'border-slate-100/60 dark:border-stone-800 bg-black/5 dark:bg-white/5 text-xs opacity-75'
          }`}
        >
          <Clock className="w-4 h-4 mx-auto mb-1 opacity-70" />
          <span className="text-[10px] block font-sans">ویجت اوقات شرعی</span>
        </button>

        <button
          onClick={() => setSelectedWidget('compact_clock')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedWidget === 'compact_clock'
              ? 'border-purple-500/60 bg-purple-550/10 text-purple-600 dark:text-purple-300 font-bold'
              : 'border-slate-100/60 dark:border-stone-800 bg-black/5 dark:bg-white/5 text-xs opacity-75'
          }`}
        >
          <Smartphone className="w-4 h-4 mx-auto mb-1 opacity-70" />
          <span className="text-[10px] block font-sans">ویجت تلفیقی ساعت</span>
        </button>

        <button
          onClick={() => setSelectedWidget('wisdom')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            selectedWidget === 'wisdom'
              ? 'border-purple-500/60 bg-purple-550/10 text-purple-600 dark:text-purple-300 font-bold'
              : 'border-slate-100/60 dark:border-stone-800 bg-black/5 dark:bg-white/5 text-xs opacity-75'
          }`}
        >
          <BookOpen className="w-4 h-4 mx-auto mb-1 opacity-70" />
          <span className="text-[10px] block font-sans">ویجت سخن و طالع</span>
        </button>
      </div>

      {/* Phone Screen Mockup Simulator Canvas */}
      <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border ${
        isDarkSeason
          ? 'bg-stone-950/80 border-stone-800'
          : 'bg-indigo-900/10 border-slate-200'
      }`} style={{ 
        backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        
        {/* Subtle Android Status bar simulation */}
        <div className="absolute top-1 right-4 left-4 flex items-center justify-between text-[8px] opacity-40 font-mono tracking-wider">
          <span>{timeString}</span>
          <span>📶 🔋 ۹۸٪</span>
        </div>

        {/* Selected style rendering box */}
        <div className={`w-full max-w-xs p-4 rounded-2xl border transition-all duration-300 ${widgetBoxStyle}`}>
          
          {selectedWidget === 'minimal_date' && (
            <div className="space-y-2 text-center">
              <span className={`text-[10px] font-sans font-black ${textStyle.secondary} block`}>
                {dayName}
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-2xl font-black font-sans ${textStyle.primary}`}>
                  {toPersianDigits(jd)}
                </span>
                <span className={`text-base font-medium font-sans ${textStyle.primary}`}>
                  {JALALI_MONTHS_FA[jm - 1]}
                </span>
                <span className={`text-xs opacity-70 font-mono ${textStyle.muted}`}>
                  {toPersianDigits(jy)}
                </span>
              </div>
              
              {showAlternativeCalendar && (
                <div className={`text-[9px] pt-1.5 border-t border-dashed border-black/5 dark:border-white/5 font-mono ${textStyle.muted} space-y-0.5`}>
                  <p>میلادی: {toPersianDigits(gy)}/{toPersianDigits(gm)}/{toPersianDigits(gd)}</p>
                  <p className="font-sans">قمری: {hijriText}</p>
                </div>
              )}
            </div>
          )}

          {selectedWidget === 'sharia_times' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b pb-1.5 border-black/5 dark:border-white/5">
                <span className={`text-[9px] font-bold ${textStyle.secondary}`}>اوقات شرعی افق {selectedCity}</span>
                <span className={`text-[8px] opacity-60 font-mono ${textStyle.muted}`}>{timeString}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-1 rounded-lg bg-black/5 dark:bg-white/5 space-y-0.5">
                  <span className={`text-[8px] opacity-70 block ${textStyle.muted}`}>اذان صبح</span>
                  <span className={`text-[10px] font-mono font-bold ${textStyle.primary}`}>{toPersianDigits(prayerTimes.fajr)}</span>
                </div>
                <div className="p-1 rounded-lg bg-black/5 dark:bg-white/5 space-y-0.5">
                  <span className={`text-[8px] opacity-70 block ${textStyle.muted}`}>طلوع افتاب</span>
                  <span className={`text-[10px] font-mono font-bold ${textStyle.primary}`}>{toPersianDigits(prayerTimes.sunrise)}</span>
                </div>
                <div className="p-1 rounded-lg bg-black/5 dark:bg-white/5 space-y-0.5">
                  <span className={`text-[8px] opacity-70 block ${textStyle.muted}`}>اذان ظهر</span>
                  <span className={`text-[10px] font-mono font-bold ${textStyle.primary}`}>{toPersianDigits(prayerTimes.dhuhr)}</span>
                </div>
                <div className="p-1 rounded-lg bg-black/5 dark:bg-white/5 space-y-0.5">
                  <span className={`text-[8px] opacity-70 block ${textStyle.muted}`}>غروب آفتاب</span>
                  <span className={`text-[10px] font-mono font-bold ${textStyle.primary}`}>{toPersianDigits(prayerTimes.sunset)}</span>
                </div>
                <div className="p-1 rounded-lg bg-black/5 dark:bg-white/8 space-y-0.5">
                  <span className={`text-[8px] font-bold block text-rose-500`}>اذان مغرب</span>
                  <span className={`text-[10px] font-mono font-black text-rose-500`}>{toPersianDigits(prayerTimes.maghrib)}</span>
                </div>
                <div className="p-1 rounded-lg bg-black/5 dark:bg-white/5 space-y-0.5">
                  <span className={`text-[8px] opacity-70 block ${textStyle.muted}`}>نیمه شب</span>
                  <span className={`text-[10px] font-mono font-bold ${textStyle.primary}`}>{toPersianDigits(prayerTimes.midnight)}</span>
                </div>
              </div>
            </div>
          )}

          {selectedWidget === 'compact_clock' && (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className={`text-[9px] font-bold ${textStyle.secondary}`}>{dayName}</span>
                <span className={`text-base font-black tracking-tight block ${textStyle.primary}`}>
                  {toPersianDigits(jd)} {JALALI_MONTHS_FA[jm - 1]}
                </span>
                <span className={`text-[9px] block font-mono ${textStyle.muted}`}>
                  {hijriText}
                </span>
              </div>

              <div className="text-right pl-2 border-l border-black/10 dark:border-white/10 shrink-0">
                <span className={`text-2xl font-black font-sans tracking-tight block ${textStyle.secondary}`}>
                  {toPersianDigits(timeString)}
                </span>
                <span className={`text-[8px] font-mono opacity-60 block ${textStyle.muted}`}>
                  ایران (تهران)
                </span>
              </div>
            </div>
          )}

          {selectedWidget === 'wisdom' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[8px] font-bold tracking-wider text-amber-500">
                <Sparkles className="w-2.5 h-2.5" />
                <span>سخن پندآموز امروز بهارنارنج</span>
              </div>
              <p className={`text-xs font-serif leading-relaxed italic ${textStyle.primary}`}>
                « مژده دادند که ایام غم نخواهد ماند، چنان نماند و چنین نیز هم نخواهد ماند. »
              </p>
              <span className={`text-[8px] font-mono block text-left ${textStyle.muted}`}>
                ~ برگرفته از تفأل حافظ شیرازی
              </span>
            </div>
          )}

        </div>

        {/* Android App shortcuts mock */}
        <div className="mt-4 flex gap-4 text-[9px] opacity-35 select-none font-sans justify-center">
          <div className="flex flex-col items-center">
            <span className="text-lg">📞</span>
            <span>تلفن</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg">💬</span>
            <span>پیام‌ها</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg">🍊</span>
            <span>بخوان‌مهر</span>
          </div>
        </div>
      </div>

      {/* Widget Control Box Panel */}
      <div className={`p-3.5 rounded-2xl border space-y-3.5 ${
        isDarkSeason ? 'bg-stone-900/35 border-stone-850/60' : 'bg-slate-50 border-slate-100'
      }`}>
        <span className="text-[10px] font-bold opacity-70 block flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-purple-500" />
          تنظیمات سفارشی‌سازی ویجت گوشی
        </span>

        <div className="grid grid-cols-2 gap-3 text-xs">
          
          {/* Background controller */}
          <div className="space-y-1">
            <label className="text-[9px] opacity-60 block">قالب پس‌زمینه ویجت:</label>
            <select
              value={widgetBg}
              onChange={(e: any) => setWidgetBg(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2 py-1.5 text-[10px] font-sans font-bold outline-none"
            >
              <option value="glass" className="text-black">شیشه‌ای (مدرن Glassmorphic)</option>
              <option value="solid" className="text-black">تک‌رنگ سالید (تیره/روشن)</option>
              <option value="gradient" className="text-black">رنگین‌کمانی فصلی</option>
              <option value="transparent" className="text-black">کاملاً شفاف (No Background)</option>
            </select>
          </div>

          {/* Text color controller */}
          <div className="space-y-1">
            <label className="text-[9px] opacity-60 block">رنگ‌بندی متن و المان‌ها:</label>
            <select
              value={widgetTextColor}
              onChange={(e: any) => setWidgetTextColor(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2 py-1.5 text-[10px] font-sans font-bold outline-none"
            >
              <option value="light" className="text-black">پیش‌فرض داینامیک</option>
              <option value="accent" className="text-black">ارغوانی رویایی</option>
              <option value="dark" className="text-black">دودی تیره (High Contrast)</option>
            </select>
          </div>

          {/* Alternative calendar toggle */}
          {selectedWidget === 'minimal_date' && (
            <div className="col-span-2 flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
              <span className="text-[9px] opacity-75">نمایش تاریخ‌های جانبی (میلادی و قمری) در ویجت:</span>
              <input
                type="checkbox"
                checked={showAlternativeCalendar}
                onChange={(e) => setShowAlternativeCalendar(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          )}

          {/* City selector for prayer times */}
          {selectedWidget === 'sharia_times' && (
            <div className="col-span-2 space-y-1 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
              <label className="text-[9px] opacity-65 block">موقعیت و افق انتخابی ویجت:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent outline-none cursor-pointer text-xs font-sans font-bold"
              >
                {IRAN_CITIES.map(c => (
                  <option key={c.name} value={c.name} className="text-black">افق {c.name}</option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Guide Instruction Card */}
      <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-[10px] leading-relaxed text-purple-600 dark:text-purple-300">
        📌 <strong>راهنمای فعال‌سازی ویجت در اندروید و آیفون:</strong>
        <ol className="list-decimal list-inside space-y-1 mt-1 font-sans">
          <li>این وب‌اپلیکیشن مجهز به استاندارد <strong>PWA و بدون مصرف دیتا</strong> است.</li>
          <li>در مرورگر گوشی خود دکمه سه‌نقطه یا Share را زده و گزینه <strong>Add to Home Screen (افزودن به صفحه اصلی)</strong> را لمس کنید.</li>
          <li>جهت سفارشی‌سازی ویجت فوق، طرح خود را در کادر بالا تزیین کرده و با نگه‌داشتن آیکون برنامه در صفحه خانگی، آن را شخصی‌سازی فرمایید.</li>
        </ol>
      </div>

    </div>
  );
}
