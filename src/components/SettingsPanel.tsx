/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { Sliders, Volume2, Palette, Download, Upload, Trash2, CalendarDays, RefreshCw, Type } from 'lucide-react';
import { CustomTheme } from '../types';
import { SEASONAL_THEMES } from '../utils/themes';
import { toPersianDigits } from '../utils/dateConverter';
import BirthdayCalculator from './BirthdayCalculator';

const AdminAdsConsole = lazy(() => import('./AdminAdsConsole'));

interface SettingsPanelProps {
  lunarOffset: number;
  setLunarOffset: (offset: number) => void;
  fontScale: 'sm' | 'md' | 'lg';
  setFontScale: (scale: 'sm' | 'md' | 'lg') => void;
  selectedThemeId: 'auto' | 'spring' | 'summer' | 'autumn' | 'winter';
  setSelectedThemeId: (id: 'auto' | 'spring' | 'summer' | 'autumn' | 'winter') => void;
  voiceAlerts: boolean;
  setVoiceAlerts: (on: boolean) => void;
  onClearNotes: () => void;
  onExportNotes: () => void;
  onImportNotes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTheme: CustomTheme;
}

export default function SettingsPanel({
  lunarOffset,
  setLunarOffset,
  fontScale,
  setFontScale,
  selectedThemeId,
  setSelectedThemeId,
  voiceAlerts,
  setVoiceAlerts,
  onClearNotes,
  onExportNotes,
  onImportNotes,
  currentTheme
}: SettingsPanelProps) {
  
  const isDarkSeason = currentTheme.season === 'autumn';

  const getThemeColorClass = () => {
    if (isDarkSeason) return 'text-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'text-emerald-600';
      case 'summer': return 'text-cyan-600';
      case 'winter': return 'text-sky-600';
    }
  };

  const getSliderAccent = () => {
    if (isDarkSeason) return 'accent-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'accent-emerald-600';
      case 'summer': return 'accent-cyan-600';
      case 'winter': return 'accent-[#1e6091]';
    }
  };

  const getBadgeClass = () => {
    if (isDarkSeason) return 'bg-[#fc2c54]/10 text-rose-400';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-500/10 text-emerald-800';
      case 'summer': return 'bg-cyan-500/10 text-cyan-800';
      case 'winter': return 'bg-sky-500/10 text-sky-800';
    }
  };

  const getSelectedClass = (optId: typeof selectedThemeId) => {
    const isSelected = selectedThemeId === optId;
    if (!isSelected) {
      return isDarkSeason
        ? 'bg-stone-900/30 border-stone-800 hover:bg-stone-800/40 text-stone-300'
        : 'bg-white/20 border-white/30 hover:bg-white/40 text-slate-800';
    }
    
    if (isDarkSeason) {
      return 'bg-[#25152a] border-[#fc2c54]/75 text-white font-bold shadow-md';
    }
    
    switch (currentTheme.season) {
      case 'spring':
        return 'bg-emerald-500/10 border-emerald-500 text-emerald-950 font-bold shadow-sm';
      case 'summer':
        return 'bg-cyan-500/10 border-cyan-500 text-cyan-950 font-bold shadow-sm';
      case 'winter':
        return 'bg-sky-500/10 border-sky-400 text-sky-950 font-bold shadow-sm';
    }
  };

  const getSelectedRadioColor = () => {
    if (isDarkSeason) return 'border-[#fc2c54] bg-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'border-emerald-600 bg-emerald-600';
      case 'summer': return 'border-cyan-600 bg-cyan-600';
      case 'winter': return 'border-sky-600 bg-sky-600';
    }
  };

  const getToggleButtonColor = () => {
    if (voiceAlerts) {
      if (isDarkSeason) return 'bg-[#fc2c54]';
      switch (currentTheme.season) {
        case 'spring': return 'bg-emerald-600';
        case 'summer': return 'bg-cyan-600';
        case 'winter': return 'bg-sky-600';
      }
    }
    return 'bg-slate-300';
  };

  const themeOptions: { id: 'auto' | 'spring' | 'summer' | 'autumn' | 'winter'; label: string; desc: string }[] = [
    { id: 'auto', label: 'هماهنگ با فصل جاری (خودکار)', desc: 'تم رنگی متناسب با دگرگونی ماه و فصل تغییر می‌کند.' },
    { id: 'spring', label: 'تم بهار', desc: 'سبز مخملین شکوفه بهار نارنج شیراز' },
    { id: 'summer', label: 'تم تابستان', desc: 'زرد تابان و شاداب فیروزه‌ای خلیج فارس' },
    { id: 'autumn', label: 'تم پاییز دنج', desc: 'مسین، کهربایی دکور شیشه‌ای گرم پاییزه' },
    { id: 'winter', label: 'تم زمستان برفی', desc: 'بلورین، نئون فیروزه‌ای سرد زمستانه' },
  ];

  return (
    <div className="space-y-6" style={{ direction: 'rtl' }}>
      
      {/* 0. Birthday Calculator and Conversions */}
      <BirthdayCalculator currentTheme={currentTheme} lunarOffset={lunarOffset} />
      
      {/* 1. Lunar Calibration */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Sliders className={`w-5 h-5 ${getThemeColorClass()}`} />
          <h3 className="font-sans font-bold text-sm">کالیبراسیون تقویم قمری</h3>
        </div>
        <p className={`text-xs mb-4 leading-relaxed ${isDarkSeason ? 'text-stone-350' : 'text-slate-600'}`}>
          به علت تفاوت رؤیت هلال ماه در ایران و کشورهای همسایه، تاریخ قمری ممکن است ۱ تا ۲ روز جابجا باشد. با این نوار لغزنده می‌توانید آن را با وضعیت جاری هماهنگ کنید.
        </p>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold">{toPersianDigits('-۲')} روز</span>
          <input
            type="range"
            min="-2"
            max="2"
            step="1"
            value={lunarOffset}
            onChange={(e) => setLunarOffset(Number(e.target.value))}
            className={`flex-1 h-2 bg-slate-200 rounded-lg cursor-pointer ${getSliderAccent()}`}
          />
          <span className="text-xs font-mono font-bold">{toPersianDigits('+۲')} روز</span>
        </div>
        <div className="text-center mt-3">
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${getBadgeClass()}`}>
            انحراف اعمال شده: {lunarOffset === 0 ? 'بدون انحراف' : `${toPersianDigits(Math.abs(lunarOffset))} روز ${lunarOffset > 0 ? 'جلوتر' : 'عقب‌تر'}`}
          </span>
        </div>
      </div>

      {/* 2. Theme selector */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Palette className={`w-5 h-5 ${getThemeColorClass()}`} />
          <h3 className="font-sans font-bold text-sm">پوسته شیشه‌ای اپلیکیشن</h3>
        </div>
        
        <div className="space-y-2.5">
          {themeOptions.map((opt) => {
            const isSelected = selectedThemeId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedThemeId(opt.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${getSelectedClass(opt.id)}`}
              >
                <div>
                  <h4 className="text-sm font-sans">{opt.label}</h4>
                  <p className={`text-xs font-sans mt-0.5 ${isDarkSeason ? 'text-stone-400' : 'text-slate-500'}`}>
                    {opt.desc}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? getSelectedRadioColor() : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.5 Font Scaling and Readability Options */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Type className={`w-5 h-5 ${getThemeColorClass()}`} />
          <h3 className="font-sans font-bold text-sm">ابعاد فونت و بهبود خوانایی متون</h3>
        </div>
        <p className={`text-[10px] sm:text-xs mb-3.5 leading-relaxed ${isDarkSeason ? 'text-stone-350' : 'text-slate-600'}`}>
          اگر خواندن نوشته‌ها برای شما دشوار است یا تمایل به صفحه متراکم‌تری دارید، قلم‌ها را بدون به‌هم ریختن چیدمان دکمه‌ها و کادرهای دکور برنامه بزرگ و کوچک کنید.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {/* Small scale */}
          <button
            onClick={() => setFontScale('sm')}
            className={`py-2 px-3 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
              fontScale === 'sm'
                ? isDarkSeason
                  ? 'bg-[#fc2c54]/10 border-[#fc2c54]/80 text-[#fc2c54]'
                  : 'bg-indigo-500/10 border-indigo-500 text-indigo-950 dark:text-indigo-250 font-black shadow-sm'
                : isDarkSeason
                  ? 'bg-stone-900/40 border-stone-800 text-stone-400 hover:bg-stone-800/40'
                  : 'bg-white/30 border-white/20 text-slate-650 hover:bg-white/55 shadow-sm'
            }`}
          >
            ریزرولی (۹۰٪)
          </button>

          {/* Medium scale */}
          <button
            onClick={() => setFontScale('md')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
              fontScale === 'md'
                ? isDarkSeason
                  ? 'bg-[#fc2c54]/10 border-[#fc2c54]/80 text-[#fc2c54]'
                  : 'bg-indigo-500/10 border-indigo-500 text-indigo-950 dark:text-indigo-250 font-black shadow-sm'
                : isDarkSeason
                  ? 'bg-stone-900/40 border-stone-800 text-stone-400 hover:bg-stone-800/40'
                  : 'bg-white/30 border-white/20 text-slate-650 hover:bg-white/55 shadow-sm'
            }`}
          >
            استاندارد (۱۰۰٪)
          </button>

          {/* Large scale */}
          <button
            onClick={() => setFontScale('lg')}
            className={`py-2 px-3 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer ${
              fontScale === 'lg'
                ? isDarkSeason
                  ? 'bg-[#fc2c54]/10 border-[#fc2c54]/80 text-[#fc2c54]'
                  : 'bg-indigo-500/10 border-indigo-500 text-indigo-950 dark:text-indigo-250 font-black shadow-sm'
                : isDarkSeason
                  ? 'bg-stone-900/40 border-stone-800 text-stone-400 hover:bg-stone-800/40'
                  : 'bg-white/30 border-white/20 text-slate-650 hover:bg-white/55 shadow-sm'
            }`}
          >
            خوانا (۱۱۵٪)
          </button>
        </div>
      </div>

      {/* 3. Audio / Reminders feedback */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Volume2 className={`w-5 h-5 ${getThemeColorClass()}`} />
            <h3 className="font-sans font-bold text-sm">پیام‌های صوتی و صوتیه اوقات</h3>
          </div>
          <button
            onClick={() => setVoiceAlerts(!voiceAlerts)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${getToggleButtonColor()}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${voiceAlerts ? '-translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <p className={`text-xs leading-relaxed ${isDarkSeason ? 'text-stone-400' : 'text-slate-500'}`}>
          با همگام‌سازی یادآوری‌ها، سیستم در ساعت یادداشت با هشدار شبیه‌ساز صوتی به شما اطلاع خواهد داد.
        </p>
      </div>

      {/* 4. Import / Export / Backup */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className={`w-5 h-5 ${getThemeColorClass()}`} />
          <h3 className="font-sans font-bold text-sm">پشتیبان‌گیری و مدیریت داده‌ها</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportNotes}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              isDarkSeason 
                ? 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-750' 
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Download className="w-4 h-4" />
            ذخیره روی موبایل
          </button>
          
          <label className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            isDarkSeason 
              ? 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-750' 
              : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
          }`}>
            <Upload className="w-4 h-4" />
            پوشه پشتیبان
            <input
              type="file"
              accept=".json"
              onChange={onImportNotes}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 pt-3 border-t border-dashed border-slate-200/50">
          <button
            onClick={() => {
              if (confirm('آیا مطمئن هستید که می‌خواهید تمام یادداشت‌ها، تولدها و یادآفرین‌ها را حذف کنید؟ این عمل بازگشت ندارد.')) {
                onClearNotes();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            پاک کردن کامل تمام داده‌ها
          </button>
        </div>
      </div>

      {/* 5. Online Ads and Orders Management Console */}
      <Suspense fallback={<div className="p-4 text-center text-xs opacity-50">در حال بارگذاری پنل مدیریت...</div>}>
        <AdminAdsConsole currentTheme={currentTheme} />
      </Suspense>

    </div>
  );
}
