/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useMemo } from 'react';
import { Sparkles, Calendar, Heart, ShieldAlert } from 'lucide-react';
import { CustomTheme } from '../types';
import { JALALI_EVENTS, StaticEvent } from '../data/events';
import { toPersianDigits } from '../utils/dateConverter';

interface EventCountdownProps {
  currentTheme: CustomTheme;
  jy: number;
  jm: number;
  jd: number;
}

export default function EventCountdown({ currentTheme, jy, jm, jd }: EventCountdownProps) {
  const isDarkSeason = currentTheme.season === 'autumn';

  // Compute upcoming major holiday or landmark event
  const comingHoliday = useMemo(() => {
    const holidays = JALALI_EVENTS.filter(e => e.isHoliday || e.title.includes('یلدا') || e.title.includes('نوروز'));
    
    // Find absolute day ranking in a year (max 366)
    const getDayRank = (month: number, day: number): number => {
      let r = 0;
      for (let m = 1; m < month; m++) {
        r += (m <= 6) ? 31 : 30;
      }
      return r + day;
    };

    const currentRank = getDayRank(jm, jd);
    let nextHoliday: StaticEvent | null = null;
    let daysRemaining = 999;

    // Search holidays
    holidays.forEach(h => {
      const hRank = getDayRank(h.month, h.day);
      let diff = hRank - currentRank;
      
      if (diff < 0) {
        // next year cycle
        diff += 365; // approximation is plenty fine for countdown visualization
      }

      if (diff > 0 && diff < daysRemaining) {
        daysRemaining = diff;
        nextHoliday = h;
      }
    });

    if (!nextHoliday) return null;

    return {
      title: nextHoliday.title,
      days: daysRemaining,
      month: nextHoliday.month,
      day: nextHoliday.day
    };
  }, [jm, jd]);

  if (!comingHoliday) return null;

  return (
    <div className={`p-4 rounded-3xl border shadow-sm select-none text-right transition-all duration-300 flex items-center justify-between ${
      isDarkSeason 
        ? 'bg-[#1b1021]/75 border-purple-500/10 text-stone-105' 
        : 'bg-white/80 border-slate-200/55 text-slate-800'
    }`} style={{ direction: 'rtl' }}>
      
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 animate-pulse">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-sans font-black text-xs">
            شمارش معکوس تا مناسبت ویژه بعدی
          </h4>
          <p className="text-[10px] opacity-60 font-mono mt-0.5">
            مناسبت: {comingHoliday.title} ({toPersianDigits(comingHoliday.day)} {
              ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][comingHoliday.month - 1]
            })
          </p>
        </div>
      </div>

      <div className="text-left shrink-0">
        <span className="text-xl font-black font-sans text-purple-600 dark:text-[#fc2c54]">
          {toPersianDigits(comingHoliday.days)}
        </span>
        <span className="text-[10px] block opacity-60 font-sans font-bold">روز مانده ⏳</span>
      </div>

    </div>
  );
}
