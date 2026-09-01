/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Calendar, 
  Compass, 
  Bell, 
  Cake, 
  Briefcase, 
  Bookmark, 
  CheckCircle2, 
  Heart,
  CloudSun
} from 'lucide-react';
import { DayEvent, UserNote, CustomTheme } from '../types';
import { 
  j2d, 
  d2j, 
  jalaliToGregorian, 
  gregorianToHijri,
  toPersianDigits, 
  JALALI_MONTHS_FA, 
  GREGORIAN_MONTHS_FA, 
  HIJRI_MONTHS_FA, 
  getWeekdayName 
} from '../utils/dateConverter';
import { getEventsForDay } from '../data/events';

interface DailyViewProps {
  selectedJy: number;
  selectedJm: number;
  selectedJd: number;
  onSelectDay: (jy: number, jm: number, jd: number) => void;
  userNotes: UserNote[];
  lunarOffset: number;
  currentTheme: CustomTheme;
  todayJy: number;
  todayJm: number;
  todayJd: number;
  onAddNote: (defaultTime?: string) => void;
  onEditNote: (note: UserNote) => void;
}

const CATEGORY_MAP = {
  reminder: { label: 'یادآوری', icon: <Bell className="w-3 shrink-0" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-450 border-blue-500/20' },
  birthday: { label: 'تولد', icon: <Cake className="w-3 shrink-0" />, color: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' },
  meeting: { label: 'جلسهٔ کاری', icon: <Briefcase className="w-3 shrink-0" />, color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' },
  anniversary: { label: 'سالگرد', icon: <Bookmark className="w-3 shrink-0" />, color: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20' },
  todo: { label: 'کار روزانه', icon: <CheckCircle2 className="w-3 shrink-0" />, color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-450 border-emerald-500/20' },
};

// Definition of timeline blocks
const TIMELINE_BLOCKS = [
  { label: 'صبح زود', start: '06:00', end: '09:00', defaultTime: '08:00' },
  { label: 'اواسط صبح', start: '09:00', end: '12:00', defaultTime: '10:30' },
  { label: 'ظهر و بعد از ظهر', start: '12:00', end: '15:00', defaultTime: '13:00' },
  { label: 'عصر', start: '15:00', end: '18:00', defaultTime: '16:30' },
  { label: 'غروب', start: '18:00', end: '21:00', defaultTime: '19:00' },
  { label: 'شبانه', start: '21:00', end: '24:00', defaultTime: '21:30' },
];

export default function DailyView({
  selectedJy,
  selectedJm,
  selectedJd,
  onSelectDay,
  userNotes,
  lunarOffset,
  currentTheme,
  todayJy,
  todayJm,
  todayJd,
  onAddNote,
  onEditNote
}: DailyViewProps) {
  const isDarkSeason = currentTheme.season === 'autumn';

  const [gy, gm, gd] = useMemo(() => jalaliToGregorian(selectedJy, selectedJm, selectedJd), [selectedJy, selectedJm, selectedJd]);
  const [hy, hm, hd] = useMemo(() => gregorianToHijri(gy, gm, gd, lunarOffset), [gy, gm, gd, lunarOffset]);
  const dayOfWeek = useMemo(() => ((new Date(gy, gm - 1, gd)).getDay() + 1) % 7, [gy, gm, gd]);
  
  const events = useMemo(() => getEventsForDay(selectedJm, selectedJd, gm, gd, hm, hd), [selectedJm, selectedJd, gm, gd, hm, hd]);
  const activeDayNotes = useMemo(() => {
    return userNotes.filter(n => n.dateStr === `${selectedJy}-${selectedJm}-${selectedJd}`);
  }, [selectedJy, selectedJm, selectedJd, userNotes]);

  // Navigate day forwards or backwards by 1 JDN
  const handlePrevDay = () => {
    const currentJdn = j2d(selectedJy, selectedJm, selectedJd);
    const [jy, jm, jd] = d2j(currentJdn - 1);
    onSelectDay(jy, jm, jd);
  };

  const handleNextDay = () => {
    const currentJdn = j2d(selectedJy, selectedJm, selectedJd);
    const [jy, jm, jd] = d2j(currentJdn + 1);
    onSelectDay(jy, jm, jd);
  };

  // Maps which notes fall inside which timeline block
  const timelineWithNotes = useMemo(() => {
    return TIMELINE_BLOCKS.map(block => {
      // Find notes that are scheduled within start and end hours
      const matchedNotes = activeDayNotes.filter(note => {
        if (!note.time) return false;
        const [hPart, mPart] = note.time.split(':').map(Number);
        const [shPart, smPart] = block.start.split(':').map(Number);
        const [ehPart, emPart] = block.end.split(':').map(Number);
        
        const noteMins = hPart * 60 + mPart;
        const startMins = shPart * 60 + smPart;
        const endMins = ehPart * 60 + emPart;
        
        return noteMins >= startMins && noteMins < endMins;
      });

      return {
        ...block,
        notes: matchedNotes
      };
    });
  }, [activeDayNotes]);

  // Notes without a set time
  const anyTimeNotes = useMemo(() => {
    return activeDayNotes.filter(n => !n.time);
  }, [activeDayNotes]);

  const isToday = selectedJy === todayJy && selectedJm === todayJm && selectedJd === todayJd;

  return (
    <div className="w-full flex flex-col space-y-4" style={{ direction: 'rtl' }}>
      
      {/* 1. Interactive Day Navigation / Swiping Head */}
      <div className={`p-4 rounded-3xl border transition-all relative overflow-hidden flex flex-col items-center select-none ${
        isDarkSeason ? 'bg-stone-900/60 border-stone-800' : 'bg-white/45 border-white/20 shadow-sm'
      }`}>
        {/* Subtle decorative ring */}
        <div className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full bg-orange-500/5 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between w-full z-10">
          <button 
            onClick={handlePrevDay}
            className={`p-1.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 text-inherit cursor-pointer`}
            title="روز قبل"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Luxury Large Dial Display */}
          <div className="flex flex-col items-center text-center">
            <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${isToday ? 'text-rose-500 font-extrabold' : 'opacity-60'}`}>
              {getWeekdayName(dayOfWeek)} {isToday ? '(امروز)' : ''}
            </span>
            <h2 className="font-sans font-black text-3xl my-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400">
              {toPersianDigits(selectedJd)}
            </h2>
            <span className="text-xs font-sans font-extrabold opacity-90">
              {JALALI_MONTHS_FA[selectedJm - 1]} {toPersianDigits(selectedJy)}
            </span>
          </div>

          <button 
            onClick={handleNextDay}
            className={`p-1.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 text-inherit cursor-pointer`}
            title="روز بعد"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Triple alternative dates badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5 pt-3 border-t border-dashed border-white/10 w-full z-10 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 opacity-75">
            میلادی: {toPersianDigits(gd)} {GREGORIAN_MONTHS_FA[gm - 1]} {toPersianDigits(gy)}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 opacity-75 text-emerald-600 dark:text-emerald-400">
            قمری: {toPersianDigits(hd)} {HIJRI_MONTHS_FA[hm - 1]} {toPersianDigits(hy)}
          </span>
        </div>
      </div>

      {/* 2. Official events section */}
      {events.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-sans font-bold opacity-75 mr-1 flex items-center gap-1">
            <span>🦁</span>
            <span>تعطیلات و مناسبت‌های ملی و مذهبی:</span>
          </h4>
          <div className="space-y-1">
            {events.map((ev) => (
              <div 
                key={ev.id}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  ev.isHoliday
                    ? 'bg-rose-550/10 border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold'
                    : 'bg-black/5 dark:bg-white/5 border-transparent text-inherit'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${ev.isHoliday ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`} />
                  <span>{ev.title}</span>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-md border ${
                  ev.isHoliday ? 'bg-rose-500/20 border-rose-500/30' : 'bg-black/10 dark:bg-white/10 border-transparent'
                }`}>
                  {ev.isHoliday ? 'تعطیل رسمی' : 'روز یادبود'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Hourly Timeline Day Planner (interactive schedule board) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mr-1">
          <h4 className="text-[10px] font-sans font-bold opacity-75 flex items-center gap-1">
            <span>⏰</span>
            <span>بخش‌بندی برنامه و ساعت‌شمار امروز:</span>
          </h4>

          {/* Quick full day add */}
          <button
            onClick={() => onAddNote()}
            className="flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-xl border border-dashed hover:border-solid hover:bg-black/5 dark:hover:bg-white/5 transition-all text-inherit cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            افزودن کلی
          </button>
        </div>

        {/* Scrollable schedule stream */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
          {/* Unscheduled / Any time notes */}
          {anyTimeNotes.length > 0 && (
            <div className={`p-3 rounded-2xl border ${
              isDarkSeason ? 'bg-stone-900/40 border-stone-850' : 'bg-white/30 border-white/15'
            }`}>
              <span className="text-[9px] font-sans font-bold text-emerald-600 dark:text-emerald-400 block mb-2">📌 بدون زمان مشخص:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {anyTimeNotes.map(note => {
                  const cat = CATEGORY_MAP[note.type] || CATEGORY_MAP.reminder;
                  return (
                    <div
                      key={note.id}
                      onClick={() => onEditNote(note)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col gap-1 hover:bg-black/5 dark:hover:bg-white/15 ${
                        isDarkSeason ? 'bg-stone-900 border-stone-800' : 'bg-white/70 border-white/55'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-sans font-extrabold text-xs">{note.title}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}>
                          {cat.icon}
                          {cat.label}
                        </span>
                      </div>
                      {note.description && <p className="text-[10px] opacity-75">{note.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline segments mapping */}
          {timelineWithNotes.map((block) => (
            <div 
              key={block.label}
              className={`flex items-start gap-3 p-1.5 rounded-2xl border border-transparent transition-all hover:bg-black/5 dark:hover:bg-white/5`}
            >
              {/* Hour info strip */}
              <div className="flex flex-col items-center justify-center border-l border-white/10 pl-3 w-14 text-center select-none shrink-0" style={{ direction: 'ltr' }}>
                <span className="text-[10px] font-mono font-black">{block.start}</span>
                <span className="text-[8px] font-sans opacity-50 my-0.5 font-bold">{block.label}</span>
                <span className="text-[9px] font-mono opacity-40">{block.end}</span>
              </div>

              {/* Day planner slot body */}
              <div className="flex-1 min-h-[46px] flex flex-col justify-center">
                {block.notes.length > 0 ? (
                  <div className="space-y-1.5">
                    {block.notes.map(note => {
                      const cat = CATEGORY_MAP[note.type] || CATEGORY_MAP.reminder;
                      return (
                        <div
                          key={note.id}
                          onClick={() => onEditNote(note)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col gap-1 transition-all hover:scale-[1.01] ${
                            isDarkSeason ? 'bg-stone-900/90 border-stone-800' : 'bg-white/80 border-white/60 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-extrabold text-xs">{note.title}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}>
                              {cat.icon}
                              {cat.label}
                            </span>
                          </div>
                          {note.description && <p className="text-[10px] opacity-75">{note.description}</p>}
                          <div className="flex justify-end opacity-60 text-[8px] font-mono">
                            ساعت {toPersianDigits(note.time || '')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state timeline row - action click trigger */
                  <button
                    type="button"
                    onClick={() => onAddNote(block.defaultTime)}
                    className="w-full h-8 border border-dashed border-white/10 hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center justify-between px-3 text-[10px] opacity-55 hover:opacity-90 transition-all cursor-pointer text-inherit"
                  >
                    <span className="font-sans">ساعت {toPersianDigits(block.start)} الی {toPersianDigits(block.end)} خالی است</span>
                    <span className="font-sans font-bold text-emerald-500 flex items-center gap-0.5">
                      <Plus className="w-3 h-3" />
                      رزرو
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
