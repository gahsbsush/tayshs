/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Hourglass, ArrowLeftRight } from 'lucide-react';
import { CustomTheme } from '../types';
import { calculatePrayerTimes, IRAN_CITIES } from '../utils/prayerTimes';
import { toPersianDigits } from '../utils/dateConverter';

interface DayProgressProps {
  currentTheme: CustomTheme;
  gy: number;
  gm: number;
  gd: number;
}

export default function DayProgress({ currentTheme, gy, gm, gd }: DayProgressProps) {
  const [now, setNow] = useState(new Date());

  const isDarkSeason = currentTheme.season === 'autumn';

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Compute 24-hr elapsed ratio
  const progressPercent = useMemo(() => {
    const elapsedSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const totalSeconds = 24 * 3600;
    return Math.min(Math.round((elapsedSeconds / totalSeconds) * 100), 100);
  }, [now]);

  // Read saved city to coordinate countdown with selected افق
  const activeCityName = useMemo(() => {
    return localStorage.getItem('sharia_selected_city') || 'تهران';
  }, [now.getMinutes()]); // refresh periodically

  const activeCityCoords = useMemo(() => {
    return IRAN_CITIES.find(c => c.name === activeCityName) || IRAN_CITIES[0];
  }, [activeCityName]);

  const prayerTimesToday = useMemo(() => {
    return calculatePrayerTimes(gy, gm, gd, activeCityCoords.lat, activeCityCoords.lng);
  }, [gy, gm, gd, activeCityCoords]);

  // Find the next closest prayer event and compute countdown
  const nextPrayerTimer = useMemo(() => {
    const curHrs = now.getHours();
    const curMins = now.getMinutes();
    const currentAbsoluteMinutes = curHrs * 60 + curMins;

    const parseTimeToMin = (tStr: string): number => {
      if (!tStr || tStr.includes('--')) return -1;
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + m;
    };

    const events = [
      { name: 'اذان صبح', timeVal: parseTimeToMin(prayerTimesToday.fajr) },
      { name: 'طلوع آفتاب', timeVal: parseTimeToMin(prayerTimesToday.sunrise) },
      { name: 'اذان ظهر', timeVal: parseTimeToMin(prayerTimesToday.dhuhr) },
      { name: 'غروب آفتاب', timeVal: parseTimeToMin(prayerTimesToday.sunset) },
      { name: 'اذان مغرب', timeVal: parseTimeToMin(prayerTimesToday.maghrib) },
      { name: 'نیمه‌شب شرعی', timeVal: parseTimeToMin(prayerTimesToday.midnight) },
    ];

    // Find the next event today
    let nextEv = events.find(ev => ev.timeVal > currentAbsoluteMinutes);
    let isNextDay = false;

    // If none found, the next is Fajr of tomorrow
    if (!nextEv) {
      nextEv = events[0]; // Fajr of next day
      isNextDay = true;
    }

    if (nextEv.timeVal === -1) return null;

    let diffMinutes = 0;
    if (isNextDay) {
      diffMinutes = (24 * 60 - currentAbsoluteMinutes) + nextEv.timeVal;
    } else {
      diffMinutes = nextEv.timeVal - currentAbsoluteMinutes;
    }

    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;

    let countdownStr = '';
    if (h > 0) {
      countdownStr += `${toPersianDigits(h)} ساعت و `;
    }
    countdownStr += `${toPersianDigits(m)} دقیقه`;

    return {
      eventName: nextEv.name,
      countdown: countdownStr
    };
  }, [now, prayerTimesToday]);

  return (
    <div className={`p-4 rounded-3xl border shadow-sm space-y-3.5 select-none text-right transition-all ${
      isDarkSeason 
        ? 'bg-[#1e1325]/75 border-purple-500/10 text-stone-100' 
        : 'bg-white/85 border-slate-200/50 text-slate-800'
    }`} style={{ direction: 'rtl' }}>
      
      {/* Header info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black">
          <Hourglass className="w-4 h-4 text-amber-500 animate-spin duration-[3000ms]" />
          <span>میزان پیشرفت روز ({toPersianDigits(progressPercent)}٪ سپری شده)</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 dark:text-purple-300">
          افق {activeCityName} 📍
        </span>
      </div>

      {/* Progress linear bar */}
      <div className="relative w-full h-3 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-red-500 via-orange-500 to-indigo-600 dark:from-purple-600 dark:via-fuchsia-500 dark:to-orange-400"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Subtle separator markings for 6:00, 12:00, 18:00 */}
        <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-white/20" title="06:00" />
        <div className="absolute top-0 bottom-0 left-2/4 w-[1px] bg-white/20" title="12:00" />
        <div className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-white/20" title="18:00" />
      </div>

      {/* Prayer countdown notification banner */}
      {nextPrayerTimer && (
        <div className={`p-2.5 rounded-xl text-[10px] font-sans flex items-center justify-between ${
          isDarkSeason ? 'bg-[#2b1834] text-purple-200' : 'bg-slate-50 text-slate-650'
        }`}>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>مانده تا <strong className="text-purple-600 dark:text-[#fc2c54]">{nextPrayerTimer.eventName}</strong>:</span>
          </div>
          <span className="font-bold">{nextPrayerTimer.countdown}</span>
        </div>
      )}
    </div>
  );
}
