/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Plus, Bell, HelpCircle, Check, Briefcase, Cake, Bookmark, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay, CustomTheme, UserNote } from '../types';
import { 
  j2d, 
  d2j, 
  d2g,
  jalaliToGregorian, 
  gregorianToHijri,
  toPersianDigits,
  WEEKDAYS_FA,
  JALALI_MONTHS_FA,
  GREGORIAN_MONTHS_FA,
  HIJRI_MONTHS_FA,
  getWeekdayName
} from '../utils/dateConverter';
import { getEventsForDay } from '../data/events';

interface WeeklyViewProps {
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
  onAddNote: () => void;
  onEditNote: (note: UserNote) => void;
}

const CATEGORY_MAP = {
  reminder: { label: 'یادآوری', icon: <Bell className="w-3.5 h-3.5" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-450 border-blue-500/20' },
  birthday: { label: 'تولد', icon: <Cake className="w-3.5 h-3.5" />, color: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' },
  meeting: { label: 'جلسهٔ کاری', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' },
  anniversary: { label: 'سالگرد', icon: <Bookmark className="w-3.5 h-3.5" />, color: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20' },
  todo: { label: 'کار روزانه', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-450 border-emerald-500/20' },
};

export default function WeeklyView({
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
}: WeeklyViewProps) {
  const isDarkSeason = currentTheme.season === 'autumn';

  // 1. Calculate the week days for the selected date
  const weekDays = useMemo(() => {
    // Convert selected Jalali date to Julian Day Number
    const selectedJdn = j2d(selectedJy, selectedJm, selectedJd);
    
    // Find gregorian equivalent to get the JS day of week (0: Sun to 6: Sat)
    const [gy, gm, gd] = jalaliToGregorian(selectedJy, selectedJm, selectedJd);
    const dateObj = new Date(gy, gm - 1, gd);
    const jsDayOfWeek = dateObj.getDay(); 
    
    // Convert to target weekday (0: Saturday, ..., 6: Friday)
    const dayOfWeek = (jsDayOfWeek + 1) % 7;
    
    // Calculate the JDN of the Saturday of this week
    const saturdayJdn = selectedJdn - dayOfWeek;
    
    const list: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentJdn = saturdayJdn + i;
      const [jy, jm, jd] = d2j(currentJdn);
      const [gYear, gMonth, gDay] = d2g(currentJdn);
      const [hYear, hMonth, hDay] = gregorianToHijri(gYear, gMonth, gDay, lunarOffset);
      
      const events = getEventsForDay(jm, jd, gMonth, gDay, hMonth, hDay);
      const dateStr = `${jy}-${jm}-${jd}`;
      const notesList = userNotes.filter(n => n.dateStr === dateStr);
      const isHoliday = i === 6 || events.some(e => e.isHoliday);
      
      list.push({
        jy,
        jm,
        jd,
        gy: gYear,
        gm: gMonth,
        gd: gDay,
        hy: hYear,
        hm: hMonth,
        hd: hDay,
        dayOfWeek: i,
        isCurrentMonth: jm === selectedJm,
        isToday: jy === todayJy && jm === todayJm && jd === todayJd,
        events,
        hasNotes: notesList.length > 0,
        notesList,
        isHoliday
      });
    }
    
    return list;
  }, [selectedJy, selectedJm, selectedJd, userNotes, lunarOffset, todayJy, todayJm, todayJd]);

  // Navigate week backwards or forwards
  const handlePrevWeek = () => {
    const currentJdn = j2d(selectedJy, selectedJm, selectedJd);
    const prevWeekJdn = currentJdn - 7;
    const [jy, jm, jd] = d2j(prevWeekJdn);
    onSelectDay(jy, jm, jd);
  };

  const handleNextWeek = () => {
    const currentJdn = j2d(selectedJy, selectedJm, selectedJd);
    const nextWeekJdn = currentJdn + 7;
    const [jy, jm, jd] = d2j(nextWeekJdn);
    onSelectDay(jy, jm, jd);
  };

  return (
    <div className="w-full flex flex-col space-y-4" style={{ direction: 'rtl' }}>
      
      {/* 1. Week Navigation Block */}
      <div className={`flex items-center justify-between p-3 rounded-2xl border ${
        isDarkSeason ? 'bg-stone-900/60 border-stone-800' : 'bg-white/40 border-white/20'
      }`}>
        <button 
          onClick={handlePrevWeek}
          className={`p-1.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 text-inherit cursor-pointer`}
          title="هفته قبل"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-xs font-sans font-extrabold opacity-95">
            هفتگی: {toPersianDigits(weekDays[0].jd)} {JALALI_MONTHS_FA[weekDays[0].jm - 1]} الی {toPersianDigits(weekDays[6].jd)} {JALALI_MONTHS_FA[weekDays[6].jm - 1]} {toPersianDigits(weekDays[6].jy)}
          </span>
        </div>

        <button 
          onClick={handleNextWeek}
          className={`p-1.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 text-inherit cursor-pointer`}
          title="هفته بعد"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Horizontal Week Row (Compact display) */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => {
          const isSelected = day.jy === selectedJy && day.jm === selectedJm && day.jd === selectedJd;
          return (
            <button
              key={`${day.jy}-${day.jm}-${day.jd}`}
              onClick={() => onSelectDay(day.jy, day.jm, day.jd)}
              className={`relative h-16 sm:h-18 rounded-2xl flex flex-col items-center justify-between py-2 border transition-all text-center cursor-pointer ${
                isSelected
                  ? isDarkSeason
                    ? 'bg-gradient-to-br from-[#fc2c54] to-[#f0853c] border-[#f0853c] text-white shadow-lg shadow-[#fc2c54]/25 scale-105 z-10 font-bold'
                    : currentTheme.season === 'spring'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-700/25 scale-105 z-10 font-bold'
                      : currentTheme.season === 'summer'
                        ? 'bg-gradient-to-br from-cyan-500 to-teal-600 border-cyan-400 text-white shadow-lg shadow-cyan-700/25 scale-105 z-10 font-bold'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white shadow-lg shadow-blue-700/25 scale-105 z-10 font-bold'
                  : day.isToday
                    ? isDarkSeason
                      ? 'border-[#fc2c54]/90 bg-[#fc2c54]/10 text-stone-100 font-bold'
                      : currentTheme.season === 'spring'
                        ? 'border-emerald-600 bg-emerald-550/15 text-emerald-850 font-bold'
                        : currentTheme.season === 'summer'
                          ? 'border-cyan-600 bg-cyan-550/15 text-cyan-850 font-bold'
                          : 'border-blue-600 bg-blue-550/15 text-blue-850 font-bold'
                    : day.isHoliday
                      ? isDarkSeason
                        ? 'border-rose-950/40 bg-rose-950/15 text-rose-300'
                        : 'border-rose-100 bg-rose-50/40 text-rose-600'
                      : isDarkSeason
                        ? 'border-stone-850 bg-stone-900/20 text-stone-300'
                        : 'border-white/10 bg-white/30 hover:bg-white/45'
              }`}
            >
              <span className="text-[9px] font-sans font-medium opacity-75">{WEEKDAYS_FA[day.dayOfWeek].substring(0, 3)}</span>
              <span className="text-sm font-sans font-extrabold">{toPersianDigits(day.jd)}</span>
              <div className="flex gap-0.5 h-1 items-center justify-center">
                {day.events.length > 0 && <span className={`w-1 h-1 rounded-full ${day.isHoliday ? 'bg-rose-500' : 'bg-blue-400'}`} />}
                {day.hasNotes && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Detail list / Timeline for the whole 7 days of this Week (Planner mode) */}
      <div className="space-y-3">
        <h3 className={`text-[11px] font-sans font-black opacity-80 flex items-center gap-1`}>
          <span>🗓️</span>
          <span>برنامه‌ریزی و تقویم هفتگی:</span>
        </h3>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/20">
          {weekDays.map((day) => {
            const isSelected = day.jy === selectedJy && day.jm === selectedJm && day.jd === selectedJd;
            const jalaliText = `${getWeekdayName(day.dayOfWeek)} ${toPersianDigits(day.jd)} ${JALALI_MONTHS_FA[day.jm - 1]}`;
            const altCalendarText = `${toPersianDigits(day.gd)} ${GREGORIAN_MONTHS_FA[day.gm - 1]} | ${toPersianDigits(day.hd)} ${HIJRI_MONTHS_FA[day.hm - 1]}`;

            return (
              <div 
                key={`row-${day.jy}-${day.jm}-${day.jd}`}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  isSelected
                    ? isDarkSeason
                      ? 'border-[#fc2c54]/45 bg-[#25152a]/95 shadow-md'
                      : currentTheme.season === 'spring'
                        ? 'border-emerald-500/35 bg-white/70 shadow'
                        : currentTheme.season === 'summer'
                          ? 'border-cyan-500/35 bg-white/70 shadow'
                          : 'border-[#1e6091]/35 bg-white/70 shadow'
                    : isDarkSeason
                      ? 'border-stone-800 bg-stone-900/30 text-stone-250 hover:bg-stone-900/40'
                      : 'border-white/15 bg-white/40 hover:bg-white/55'
                }`}
                onClick={() => onSelectDay(day.jy, day.jm, day.jd)}
              >
                {/* Header row of the day */}
                <div className="flex items-center justify-between w-full border-b border-dashed border-white/10 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      day.isToday 
                        ? 'bg-amber-500 animate-ping' 
                        : day.isHoliday 
                          ? 'bg-rose-500' 
                          : 'bg-teal-500'
                    }`} />
                    <span className={`text-xs font-sans font-extrabold ${day.isHoliday ? 'text-rose-500 dark:text-rose-400' : ''}`}>
                      {jalaliText}
                    </span>
                    {day.isToday && (
                      <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">امروز</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono opacity-50">{altCalendarText}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(day.jy, day.jm, day.jd);
                        // Trigger add note
                        setTimeout(onAddNote, 50);
                      }}
                      className={`p-1 rounded-lg border border-transparent hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 text-inherit cursor-pointer`}
                      title="ثبت یادداشت جدید"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day events section */}
                {day.events.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {day.events.map((ev) => (
                      <div 
                        key={ev.id} 
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] border leading-snug flex items-center gap-1.5 ${
                          ev.isHoliday
                            ? 'bg-rose-500/5 border-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-blue-500/5 border-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${ev.isHoliday ? 'bg-rose-500' : 'bg-blue-400'}`} />
                        <span>{ev.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Day notes section */}
                {day.notesList.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {day.notesList.map((note) => {
                      const cat = CATEGORY_MAP[note.type] || CATEGORY_MAP.reminder;
                      return (
                        <div 
                          key={note.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditNote(note);
                          }}
                          className={`p-2.5 rounded-xl border flex flex-col gap-1.5 text-right text-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
                            isDarkSeason ? 'bg-stone-900 border-stone-800' : 'bg-white/60 border-white/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-sans font-bold text-xs">{note.title}</span>
                            <span className={`text-[8px] px-1 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}>
                              {cat.icon}
                              {cat.label}
                            </span>
                          </div>
                          
                          {note.description && (
                            <p className="text-[11px] text-inherit opacity-75 line-clamp-1 leading-snug">{note.description}</p>
                          )}

                          {note.time && (
                            <div className="flex justify-end">
                              <span className="text-[8px] font-mono px-1 border rounded opacity-70">
                                ساعت {toPersianDigits(note.time)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  day.events.length === 0 && (
                    <span className="text-[10px] text-inherit opacity-45 px-1">هیچ رویدادی ثبت نشده است.</span>
                  )
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
