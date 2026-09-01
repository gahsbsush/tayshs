/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { CalendarDay, CustomTheme, UserNote } from '../types';
import { 
  getJalaliMonthDays, 
  jalaliToGregorian, 
  gregorianToHijri,
  toPersianDigits,
  WEEKDAYS_FA
} from '../utils/dateConverter';
import { getEventsForDay } from '../data/events';

interface CalendarGridProps {
  currentJy: number;
  currentJm: number;
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
}

export default function CalendarGrid({
  currentJy,
  currentJm,
  selectedJy,
  selectedJm,
  selectedJd,
  onSelectDay,
  userNotes,
  lunarOffset,
  currentTheme,
  todayJy,
  todayJm,
  todayJd
}: CalendarGridProps) {

  const isDarkSeason = currentTheme.season === 'autumn';

  // Build the 42 calendar day structures of the grid
  const days: CalendarDay[] = useMemo(() => {
    const grid: CalendarDay[] = [];

    // 1. Convert first day of current Jalali month to Gregorian to find its day of the week
    const [startGy, startGm, startGd] = jalaliToGregorian(currentJy, currentJm, 1);
    const startDate = new Date(startGy, startGm - 1, startGd);
    const startJsDay = startDate.getDay(); // 0: Sunday, 6: Saturday
    const startWeekday = (startJsDay + 1) % 7; // Convert to: 0: Saturday, ..., 6: Friday

    // 2. Count of days in current, previous and next months
    const currentMonthDays = getJalaliMonthDays(currentJy, currentJm);

    let prevJy = currentJy;
    let prevJm = currentJm - 1;
    if (currentJm === 1) {
      prevJm = 12;
      prevJy = currentJy - 1;
    }
    const prevMonthDays = getJalaliMonthDays(prevJy, prevJm);

    let nextJy = currentJy;
    let nextJm = currentJm + 1;
    if (currentJm === 12) {
      nextJm = 1;
      nextJy = currentJy + 1;
    }

    // 3. Fill Previous Month overflow
    for (let i = 0; i < startWeekday; i++) {
      const jd = prevMonthDays - startWeekday + 1 + i;
      const [gy, gm, gd] = jalaliToGregorian(prevJy, prevJm, jd);
      const [hy, hm, hd] = gregorianToHijri(gy, gm, gd, lunarOffset);
      const dayOfWeek = i; // Column index represents day of week directly
      
      const events = getEventsForDay(prevJm, jd, gm, gd, hm, hd);
      const dateStr = `${prevJy}-${prevJm}-${jd}`;
      const notesList = userNotes.filter(n => n.dateStr === dateStr);
      const isHoliday = dayOfWeek === 6 || events.some(e => e.isHoliday);

      grid.push({
        jy: prevJy,
        jm: prevJm,
        jd,
        gy, gm, gd,
        hy, hm, hd,
        dayOfWeek,
        isCurrentMonth: false,
        isToday: prevJy === todayJy && prevJm === todayJm && jd === todayJd,
        events,
        hasNotes: notesList.length > 0,
        notesList,
        isHoliday
      });
    }

    // 4. Fill Current Month days
    for (let jd = 1; jd <= currentMonthDays; jd++) {
      const [gy, gm, gd] = jalaliToGregorian(currentJy, currentJm, jd);
      const [hy, hm, hd] = gregorianToHijri(gy, gm, gd, lunarOffset);
      const dayOfWeek = (startWeekday + jd - 1) % 7;

      const events = getEventsForDay(currentJm, jd, gm, gd, hm, hd);
      const dateStr = `${currentJy}-${currentJm}-${jd}`;
      const notesList = userNotes.filter(n => n.dateStr === dateStr);
      const isHoliday = dayOfWeek === 6 || events.some(e => e.isHoliday);

      grid.push({
        jy: currentJy,
        jm: currentJm,
        jd,
        gy, gm, gd,
        hy, hm, hd,
        dayOfWeek,
        isCurrentMonth: true,
        isToday: currentJy === todayJy && currentJm === todayJm && jd === todayJd,
        events,
        hasNotes: notesList.length > 0,
        notesList,
        isHoliday
      });
    }

    // 5. Fill Next Month overflow to complete 42 elements
    const remaining = 42 - grid.length;
    for (let jd = 1; jd <= remaining; jd++) {
      const [gy, gm, gd] = jalaliToGregorian(nextJy, nextJm, jd);
      const [hy, hm, hd] = gregorianToHijri(gy, gm, gd, lunarOffset);
      const dayOfWeek = (grid.length) % 7;

      const events = getEventsForDay(nextJm, jd, gm, gd, hm, hd);
      const dateStr = `${nextJy}-${nextJm}-${jd}`;
      const notesList = userNotes.filter(n => n.dateStr === dateStr);
      const isHoliday = dayOfWeek === 6 || events.some(e => e.isHoliday);

      grid.push({
        jy: nextJy,
        jm: nextJm,
        jd,
        gy, gm, gd,
        hy, hm, hd,
        dayOfWeek,
        isCurrentMonth: false,
        isToday: nextJy === todayJy && nextJm === todayJm && jd === todayJd,
        events,
        hasNotes: notesList.length > 0,
        notesList,
        isHoliday
      });
    }

    return grid;
  }, [currentJy, currentJm, userNotes, lunarOffset, todayJy, todayJm, todayJd]);

  return (
    <div className="w-full flex flex-col pt-2" style={{ direction: 'rtl' }}>
      {/* Weekday Titles */}
      <div className="grid grid-cols-7 text-center mb-1.5">
        {WEEKDAYS_FA.map((wd, index) => {
          const isFriday = index === 6;
          return (
            <div 
              key={wd} 
              className={`text-[11px] font-sans font-extrabold pb-1 sm:pb-2 tracking-normal ${
                isFriday 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : isDarkSeason ? 'text-stone-300' : 'text-slate-700'
              }`}
            >
              {wd}
            </div>
          );
        })}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5" id="calendar-days-grid">
        {days.map((day, dIdx) => {
          const isSelected = 
            day.jy === selectedJy && 
            day.jm === selectedJm && 
            day.jd === selectedJd;

          const isFriday = day.dayOfWeek === 6;

          return (
            <button
              type="button"
              key={`${day.jy}-${day.jm}-${day.jd}-${dIdx}`}
              onClick={() => onSelectDay(day.jy, day.jm, day.jd)}
              className={`relative h-12 sm:h-14 rounded-xl flex flex-col justify-between p-1 sm:p-1.5 border transition-all text-right select-none active:scale-95 cursor-pointer ${
                isSelected
                  ? isDarkSeason
                    ? 'bg-gradient-to-br from-[#fc2c54] to-[#f0853c] border-[#f0853c] text-white shadow-lg shadow-[#fc2c54]/25 scale-105 z-10 font-bold'
                    : currentTheme.season === 'spring'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-700/25 scale-105 z-10 font-bold'
                      : currentTheme.season === 'summer'
                        ? 'bg-gradient-to-br from-cyan-500 to-teal-600 border-cyan-400 text-white shadow-lg shadow-cyan-700/25 scale-105 z-10 font-bold'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white shadow-lg shadow-blue-700/25 scale-105 z-10 font-bold'
                  : !day.isCurrentMonth
                    ? 'opacity-30 border-transparent bg-transparent'
                    : day.isToday
                      ? isDarkSeason
                        ? 'border-[#fc2c54]/90 bg-[#fc2c54]/10 text-stone-100 font-bold'
                        : currentTheme.season === 'spring'
                          ? 'border-emerald-600 bg-emerald-500/10 text-emerald-850 font-bold'
                          : currentTheme.season === 'summer'
                            ? 'border-cyan-600 bg-cyan-500/10 text-cyan-850 font-bold'
                            : 'border-blue-600 bg-blue-550/15 text-blue-850 font-bold'
                      : day.isHoliday
                        ? isDarkSeason
                          ? 'border-rose-950 bg-rose-950/20 text-rose-300 hover:bg-rose-950/30'
                          : 'border-rose-100 bg-rose-50/45 text-rose-600 hover:bg-rose-50'
                        : isDarkSeason
                          ? 'border-stone-800 bg-stone-900/30 text-stone-200 hover:bg-stone-800/40'
                          : 'border-white/10 bg-white/20 hover:bg-white/40 shadow-sm'
              }`}
            >
              {/* Top Row: alternative calendar numbers */}
              <div className="flex items-center justify-between w-full text-[8px] font-mono opacity-80 select-none">
                {/* Gregorian bottom cell equivalent */}
                <span className={isSelected ? 'text-white' : isDarkSeason ? 'text-stone-400' : 'text-slate-500'}>
                  {day.gd}
                </span>

                {/* Islamic Lunar cell equivalent */}
                <span className={isSelected ? 'text-white' : isDarkSeason ? 'text-amber-500/90' : 'text-teal-700/80'}>
                  {day.hd}
                </span>
              </div>

              {/* Center Jalali Day Number */}
              <div className="flex-1 flex items-center justify-center">
                <span className={`font-sans font-bold text-center translate-y-[-1px] ${
                  isSelected 
                    ? 'text-sm sm:text-base text-white' 
                    : isFriday
                      ? 'text-xs sm:text-sm text-rose-500 dark:text-rose-400 font-extrabold'
                      : 'text-xs sm:text-sm text-inherit'
                }`}>
                  {toPersianDigits(day.jd)}
                </span>
              </div>

              {/* Bottom Row: events indicators (red, green, note dots) */}
              <div className="flex items-center justify-center gap-1 w-full h-[5px] select-none">
                {/* Official Holiday or Event Dot */}
                {day.events.length > 0 && (
                  <span className={`w-1 h-1 rounded-full ${
                    day.isHoliday ? 'bg-rose-500' : 'bg-blue-400'
                  }`} />
                )}

                {/* User Note indicator */}
                {day.hasNotes && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
