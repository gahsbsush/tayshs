/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Bell, Calendar, HelpCircle, Check, Briefcase, Cake, Bookmark, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { DayEvent, UserNote, CustomTheme } from '../types';
import { 
  toPersianDigits, 
  JALALI_MONTHS_FA, 
  GREGORIAN_MONTHS_FA, 
  HIJRI_MONTHS_FA, 
  getWeekdayName 
} from '../utils/dateConverter';
import { calculatePrayerTimes, IRAN_CITIES } from '../utils/prayerTimes';

interface DailyDetailsProps {
  jy: number;
  jm: number;
  jd: number;
  gy: number;
  gm: number;
  gd: number;
  hy: number;
  hm: number;
  hd: number;
  dayOfWeek: number;
  events: DayEvent[];
  notes: UserNote[];
  onAddNote: () => void;
  onEditNote: (note: UserNote) => void;
  currentTheme: CustomTheme;
}

const CATEGORY_MAP = {
  reminder: { label: 'یادآوری', icon: <Bell className="w-3.5 h-3.5" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  birthday: { label: 'تولد', icon: <Cake className="w-3.5 h-3.5" />, color: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' },
  meeting: { label: 'جلسهٔ کاری', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' },
  anniversary: { label: 'سالگرد', icon: <Bookmark className="w-3.5 h-3.5" />, color: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20' },
  todo: { label: 'کار روزانه', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' },
};

export default function DailyDetails({
  jy, jm, jd,
  gy, gm, gd,
  hy, hm, hd,
  dayOfWeek,
  events,
  notes,
  onAddNote,
  onEditNote,
  currentTheme
}: DailyDetailsProps) {

  const [selectedCityName, setSelectedCityName] = useState<string>(() => {
    return localStorage.getItem('sharia_selected_city') || 'تهران';
  });

  const activeCity = useMemo(() => {
    return IRAN_CITIES.find(c => c.name === selectedCityName) || IRAN_CITIES[0];
  }, [selectedCityName]);

  const pTimes = useMemo(() => {
    return calculatePrayerTimes(gy, gm, gd, activeCity.lat, activeCity.lng);
  }, [gy, gm, gd, activeCity]);

  useEffect(() => {
    localStorage.setItem('sharia_selected_city', selectedCityName);
  }, [selectedCityName]);

  const isDarkSeason = currentTheme.season === 'autumn';

  const getThemeTextClass = () => {
    if (isDarkSeason) return 'text-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'text-emerald-600';
      case 'summer': return 'text-cyan-600';
      case 'winter': return 'text-sky-600';
    }
  };

  const getThemeDotColorClass = () => {
    if (isDarkSeason) return 'bg-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-600';
      case 'summer': return 'bg-cyan-600';
      case 'winter': return 'bg-sky-600';
    }
  };

  const getAddNoteBtnClass = () => {
    if (isDarkSeason) {
      return 'border-[#fc2c54]/30 bg-[#fc2c54]/10 text-rose-450 hover:bg-[#fc2c54]/20';
    }
    switch (currentTheme.season) {
      case 'spring':
        return 'border-emerald-600/30 bg-emerald-600/5 text-emerald-800 hover:bg-emerald-600/10';
      case 'summer':
        return 'border-cyan-600/30 bg-cyan-600/5 text-cyan-800 hover:bg-cyan-600/10';
      case 'winter':
        return 'border-sky-600/30 bg-sky-600/5 text-sky-850 hover:bg-sky-600/10';
    }
  };

  const getTimeBadgeClass = () => {
    if (isDarkSeason) return 'bg-stone-900 border-stone-800 text-rose-450';
    switch (currentTheme.season) {
      case 'spring': return 'bg-slate-50 border-slate-100 text-emerald-750';
      case 'summer': return 'bg-slate-50 border-slate-100 text-cyan-750';
      case 'winter': return 'bg-slate-50 border-slate-100 text-sky-750';
    }
  };

  // Format full names
  const jalaliText = `${getWeekdayName(dayOfWeek)} - ${toPersianDigits(jd)} ${JALALI_MONTHS_FA[jm - 1]} ${toPersianDigits(jy)}`;
  const gregorianText = `${toPersianDigits(gd)} ${GREGORIAN_MONTHS_FA[gm - 1]} ${toPersianDigits(gy)} (میلادی)`;
  const hijriText = `${toPersianDigits(hd)} ${HIJRI_MONTHS_FA[hm - 1]} ${toPersianDigits(hy)} (قمری)`;

  return (
    <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
      
      {/* 1. Date Header Info Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-900/60 border-stone-800' : 'bg-white/40 border-white/20 shadow-sm'
      }`}>
        <h4 className="font-sans font-extrabold text-base leading-snug">
          {jalaliText}
        </h4>
        
        {/* Double Alternative Calendar outputs */}
        <div className={`flex flex-col gap-1 mt-2.5 pt-2 border-t border-dashed ${
          isDarkSeason ? 'border-stone-800 animate-pulse' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${getThemeDotColorClass()}`} />
            <span className={isDarkSeason ? 'text-stone-300' : 'text-slate-700'}>{gregorianText}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className={isDarkSeason ? 'text-stone-300' : 'text-slate-700'}>{hijriText}</span>
          </div>
        </div>

        {/* Sharia Prayer Times Section */}
        <div className={`mt-3 pt-3 border-t border-dashed flex flex-col gap-2 ${
          isDarkSeason ? 'border-stone-800' : 'border-slate-100'
        }`}>
          {/* Header & City Dropdown */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 text-[10px] font-bold ${
              isDarkSeason ? 'text-purple-300' : 'text-slate-500'
            }`}>
              <Clock className="w-3 h-3 text-amber-500" />
              <span>اوقات شرعی امروز</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 opacity-50" />
              <select
                value={selectedCityName}
                onChange={(e) => setSelectedCityName(e.target.value)}
                className="bg-transparent text-[10px] font-sans font-bold outline-none cursor-pointer border-none py-0.5"
              >
                {IRAN_CITIES.map(c => (
                  <option key={c.name} value={c.name} className="text-black">
                    افق {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
            <div className={`p-1.5 rounded-xl border text-center space-y-0.5 ${
              isDarkSeason ? 'bg-stone-950/40 border-stone-800/60' : 'bg-slate-50/70 border-slate-100/50'
            }`}>
              <div className="text-[8px] opacity-60">اذان صبح</div>
              <div className="text-[10px] font-mono font-bold">{toPersianDigits(pTimes.fajr)}</div>
            </div>
            <div className={`p-1.5 rounded-xl border text-center space-y-0.5 ${
              isDarkSeason ? 'bg-stone-950/40 border-stone-800/60' : 'bg-slate-50/70 border-slate-100/50'
            }`}>
              <div className="text-[8px] opacity-60">طلوع آفتاب</div>
              <div className="text-[10px] font-mono font-bold">{toPersianDigits(pTimes.sunrise)}</div>
            </div>
            <div className={`p-1.5 rounded-xl border text-center space-y-0.5 ${
              isDarkSeason ? 'bg-stone-950/40 border-stone-800/60' : 'bg-slate-50/70 border-slate-100/50'
            }`}>
              <div className="text-[8px] opacity-60">اذان ظهر</div>
              <div className="text-[10px] font-mono font-bold">{toPersianDigits(pTimes.dhuhr)}</div>
            </div>
            <div className={`p-1.5 rounded-xl border text-center space-y-0.5 ${
              isDarkSeason ? 'bg-stone-950/40 border-stone-800/60' : 'bg-slate-50/70 border-slate-100/50'
            }`}>
              <div className="text-[8px] opacity-60">غروب آفتاب</div>
              <div className="text-[10px] font-mono font-bold">{toPersianDigits(pTimes.sunset)}</div>
            </div>
            <div className={`p-1.5 rounded-xl border text-center space-y-0.5 ${
              isDarkSeason ? 'bg-stone-950/40 border-stone-800/60 text-[#fc2c54]' : 'bg-rose-500/5 border-rose-100/50 text-rose-700 font-bold'
            }`}>
              <div className="text-[8px] opacity-60">اذان مغرب</div>
              <div className="text-[10px] font-mono font-bold">{toPersianDigits(pTimes.maghrib)}</div>
            </div>
            <div className={`p-1.5 rounded-xl border text-center space-y-0.5 ${
              isDarkSeason ? 'bg-stone-950/40 border-stone-800/60' : 'bg-slate-50/70 border-slate-100/50'
            }`}>
              <div className="text-[8px] opacity-60">نیمه شب</div>
              <div className="text-[10px] font-mono font-bold">{toPersianDigits(pTimes.midnight)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Holiday/Event database match */}
      {events.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 opacity-80">
            <span className="w-1 h-2 rounded bg-amber-500" />
            <span className={`text-[10px] font-bold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
              مناسبت‌ها و تعطیلات این روز:
            </span>
          </div>
          
          <div className="space-y-1.5">
            {events.map((ev) => (
              <div 
                key={ev.id} 
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  ev.isHoliday
                    ? isDarkSeason
                      ? 'bg-rose-950/15 border-rose-900/40 text-rose-300'
                      : 'bg-rose-50/50 border-rose-100 text-rose-700 font-bold'
                    : isDarkSeason
                      ? 'bg-stone-850 border-stone-800 text-stone-200'
                      : 'bg-white/50 border-white/45 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${ev.isHoliday ? 'bg-red-500' : 'bg-blue-400'}`} />
                  <span>{ev.title}</span>
                </div>
                
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border ${
                  ev.isHoliday
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    : 'bg-slate-100 text-slate-500 border-slate-200/50'
                }`}>
                  {ev.isHoliday ? 'تعطیل رسمی' : 'مناسبت تقویمی'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Personal Notes Board */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 opacity-80">
            <span className="w-1 h-2 rounded bg-emerald-500" />
            <span className={`text-[10px] font-bold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
              یادداشت‌ها و برنامه‌های شخصی شما:
            </span>
          </div>
          
          <button
            onClick={onAddNote}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg border font-bold transition-all active:scale-95 cursor-pointer ${getAddNoteBtnClass()}`}
          >
            <Plus className="w-3 h-3" />
            جدید
          </button>
        </div>

        {notes.length === 0 ? (
          <div className={`p-4 rounded-xl border border-dashed text-center ${
            isDarkSeason ? 'border-stone-800 text-stone-400' : 'border-slate-200 text-slate-500'
          }`}>
            <p className="text-xs">هیچ رویداد شخصی برای این تاریخ ثبت نکرده‌اید.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {notes.map((note) => {
              const cat = CATEGORY_MAP[note.type] || CATEGORY_MAP.reminder;
              return (
                <button
                  key={note.id}
                  onClick={() => onEditNote(note)}
                  className={`w-full text-right p-3 rounded-xl border flex flex-col gap-1 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                    isDarkSeason
                      ? 'bg-stone-850 border-stone-800 hover:bg-stone-800'
                      : 'bg-white/50 border-white/45 hover:bg-white/75 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-sans font-bold">{note.title}</span>
                    
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}>
                      {cat.icon}
                      {cat.label}
                    </span>
                  </div>
                  
                  {note.description && (
                    <p className={`text-xs mt-1 leading-relaxed ${isDarkSeason ? 'text-stone-400' : 'text-slate-600'}`}>
                      {note.description}
                    </p>
                  )}

                  {note.time && (
                    <div className="flex justify-end w-full mt-1">
                      <span className={`text-[10px] font-mono px-1 border rounded ${getTimeBadgeClass()}`}>
                        ساعت {toPersianDigits(note.time)}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
