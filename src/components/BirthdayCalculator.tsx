/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Gift, Calendar, Heart, ArrowRightLeft, Sparkles, Clock, Compass, ShieldAlert } from 'lucide-react';
import { CustomTheme } from '../types';
import { 
  jalaliToGregorian, 
  gregorianToHijri,
  toPersianDigits, 
  JALALI_MONTHS_FA, 
  GREGORIAN_MONTHS_FA, 
  HIJRI_MONTHS_FA,
  WEEKDAYS_FA
} from '../utils/dateConverter';
import jalaali from 'jalaali-js';

interface BirthdayCalculatorProps {
  currentTheme: CustomTheme;
  lunarOffset: number;
}

// Zodiac sign information
const ZODIAC_SIGNS = [
  { name: 'حمل (فروردین)', element: 'آتش', symbol: '♈', meaning: 'سرشار از انرژی، پیشرو و شجاع' },
  { name: 'ثور (اردیبهشت)', element: 'خاک', symbol: '♉', meaning: 'صبور، بااستقامت، صمیمی و هنردوست' },
  { name: 'جوزا (خرداد)', element: 'باد', symbol: '♊', meaning: 'کنجکاو، تیزهوش، اجتماعی و چندبعدی' },
  { name: 'سرطان (تیر)', element: 'آب', symbol: '♋', meaning: 'احساساتی، حامی، وفادار و خانه‌دوست' },
  { name: 'اسد (مرداد)', element: 'آتش', symbol: '♌', meaning: 'پرابهت، سخاوتمند، خلاق و پرانرژی' },
  { name: 'سنبله (شهریور)', element: 'خاک', symbol: '♍', meaning: 'دقیق، منظم، مهربان و حقیقت‌جو' },
  { name: 'میزان (مهر)', element: 'باد', symbol: '♎', meaning: 'صلح‌طلب، عدالت‌خواه، باپرستیژ و دیپلماتیک' },
  { name: 'عقرب (آبان)', element: 'آب', symbol: '♏', meaning: 'جذاب، پررمز و راز، پرقدرت و مصمم' },
  { name: 'قوس (آذر)', element: 'آتش', symbol: '♐', meaning: 'کاشف، خوش‌بین، پرتحرک و عاشق سفر' },
  { name: 'جدی (دی)', element: 'خاک', symbol: '♑', meaning: 'مسئولیت‌پذیر، جاه‌طلب، صبور و باتدبیر' },
  { name: 'دلو (بهمن)', element: 'باد', symbol: '♒', meaning: 'نوآور، مستقل، انسان‌دوست و آینده‌نگر' },
  { name: 'حوت (اسفند)', element: 'آب', symbol: '♓', meaning: 'رویاپرداز، شهودی، ایثارگر و هنرمند' }
];

export default function BirthdayCalculator({ currentTheme, lunarOffset }: BirthdayCalculatorProps) {
  // Birth Date States (Default: 1375/01/01)
  const [birthYear, setBirthYear] = useState<number>(1375);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  const isDarkSeason = currentTheme.season === 'autumn';

  // Current real date mapping
  const today = useMemo(() => {
    const now = new Date();
    const jToday = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return {
      jy: jToday.jy,
      jm: jToday.jm,
      jd: jToday.jd,
      gDate: now
    };
  }, []);

  // Set Year boundaries
  const yearsRange = useMemo(() => {
    const list = [];
    for (let y = today.jy; y >= 1300; y--) {
      list.push(y);
    }
    return list;
  }, [today.jy]);

  // Months
  const monthsList = useMemo(() => {
    return JALALI_MONTHS_FA.map((name, idx) => ({ id: idx + 1, name }));
  }, []);

  // Days list depending on leap year and month length
  const daysList = useMemo(() => {
    let limit = 30;
    if (birthMonth >= 1 && birthMonth <= 6) {
      limit = 31;
    } else if (birthMonth === 12) {
      const isLeap = jalaali.isLeapJalaaliYear(birthYear);
      limit = isLeap ? 30 : 29;
    }
    
    // Safety check for selected day
    if (birthDay > limit) {
      setBirthDay(limit);
    }

    const list = [];
    for (let d = 1; d <= limit; d++) {
      list.push(d);
    }
    return list;
  }, [birthYear, birthMonth, birthDay]);

  // Run calculation
  const calculations = useMemo(() => {
    if (!hasCalculated) return null;

    // 1. Convert to Gregorian (Miladi)
    const [gy, gm, gd] = jalaliToGregorian(birthYear, birthMonth, birthDay);
    
    // 2. Convert to Hijri Qamari
    const [hy, hm, hd] = gregorianToHijri(gy, gm, gd, lunarOffset);

    // 3. Find birth weekday
    // Custom day calculation using JS Date on birth Gregorian date
    const gBirthDate = new Date(gy, gm - 1, gd);
    const gBirthDayOfWeek = gBirthDate.getDay(); // 0 is Sunday
    const farsiWeekdayIdx = (gBirthDayOfWeek + 1) % 7; // Convert to Persian index
    const weekdayName = WEEKDAYS_FA[farsiWeekdayIdx];

    // 4. Calculate exact age (Solar Years)
    // Using standard date difference
    const now = today.gDate;
    let ageYears = today.jy - birthYear;
    let ageMonths = today.jm - birthMonth;
    let ageDays = today.jd - birthDay;

    if (ageDays < 0) {
      // borrow days from previous month
      const prevMonth = today.jm === 1 ? 12 : today.jm - 1;
      const prevMonthYear = today.jm === 1 ? today.jy - 1 : today.jy;
      const isLeap = jalaali.isLeapJalaaliYear(prevMonthYear);
      let daysInPrev = 30;
      if (prevMonth <= 6) daysInPrev = 31;
      else if (prevMonth === 12) daysInPrev = isLeap ? 30 : 29;

      ageDays += daysInPrev;
      ageMonths--;
    }

    if (ageMonths < 0) {
      ageMonths += 12;
      ageYears--;
    }

    // 5. Total Days lived
    const diffTime = Math.abs(now.getTime() - gBirthDate.getTime());
    const totalDaysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 6. Days remaining until next birthday
    // Set next birthday date in Jalali
    let nextBdayJy = today.jy;
    if (today.jm > birthMonth || (today.jm === birthMonth && today.jd > birthDay)) {
      nextBdayJy = today.jy + 1;
    }
    const [nbGy, nbGm, nbGd] = jalaliToGregorian(nextBdayJy, birthMonth, birthDay);
    const nextBdayGDate = new Date(nbGy, nbGm - 1, nbGd);
    const diffToBday = nextBdayGDate.getTime() - now.getTime();
    const daysToBirthday = Math.max(0, Math.ceil(diffToBday / (1000 * 60 * 60 * 24)));

    // 7. Astrological Zodiac Sign (Zodiac)
    const zodiacIndex = birthMonth - 1; // Simplistic jalali mapping (perfectly aligned with month)
    const zodiac = ZODIAC_SIGNS[zodiacIndex];

    // 8. Season-based poetic greeting
    let seasonGreeting = '';
    if (birthMonth >= 1 && birthMonth <= 3) {
      seasonGreeting = 'قدوم شما با ترنم شکوفه‌های بهاری و نسیم گهربار فروردین‌ماه و اردیبهشت، طراوت جاودانی به زمین بخشیده‌است.';
    } else if (birthMonth >= 4 && birthMonth <= 6) {
      seasonGreeting = 'در بلندای تابستان پربرکت و تابش رخشان خورشید تموز و گندم‌زارهای طلایی، تبلور گرمای حیات بوده‌اید.';
    } else if (birthMonth >= 7 && birthMonth <= 9) {
      seasonGreeting = 'شعر دل‌انگیز خزان، خش‌خش زیبای برگ‌های یاقوتی و باران‌های عاشقانه پاییز هم‌ساز با تولد شما جوانه زد.';
    } else {
      seasonGreeting = 'میان بلور پاک برف‌های سپید دسامبر و دی‌گان، شکوه گرمای لبخندتان مژده‌بخش نوای زندگی در سرما بوده است.';
    }

    return {
      gy, gm, gd,
      hy, hm, hd,
      weekdayName,
      ageYears,
      ageMonths,
      ageDays,
      totalDaysLived,
      daysToBirthday,
      zodiac,
      seasonGreeting
    };
  }, [birthYear, birthMonth, birthDay, hasCalculated, lunarOffset, today]);

  // Color classes
  const getThemeTextClass = () => {
    if (isDarkSeason) return 'text-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'text-emerald-750';
      case 'summer': return 'text-cyan-750';
      case 'winter': return 'text-sky-750';
    }
  };

  const getThemeBorderClass = () => {
    if (isDarkSeason) return 'border-[#fc2c54]/30 focus:border-[#fc2c54]/80';
    switch (currentTheme.season) {
      case 'spring': return 'border-emerald-300 focus:border-emerald-600';
      case 'summer': return 'border-cyan-300 focus:border-cyan-600';
      case 'winter': return 'border-sky-300 focus:border-sky-600';
    }
  };

  const getThemeBgClass = () => {
    if (isDarkSeason) return 'bg-[#fc2c54]/10';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-500/10';
      case 'summer': return 'bg-cyan-500/10';
      case 'winter': return 'bg-sky-500/10';
    }
  };

  const getButtonClass = () => {
    if (isDarkSeason) {
      return 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-lg shadow-[#fc2c54]/25';
    }
    switch (currentTheme.season) {
      case 'spring':
        return 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/25';
      case 'summer':
        return 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-700/25';
      case 'winter':
        return 'bg-gradient-to-r from-sky-600 to-purple-600 text-white shadow-lg shadow-sky-700/25';
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
      isDarkSeason 
        ? 'bg-[#1b1220]/90 border-purple-500/15 shadow-2xl shadow-black/80' 
        : 'bg-white/90 backdrop-blur-2xl border-slate-200/30 shadow-xl shadow-slate-900/5'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-xl ${getThemeBgClass()}`}>
          <Gift className={`w-5 h-5 ${getThemeTextClass()}`} />
        </div>
        <div>
          <h3 className="font-sans font-bold text-base">محاسبه سن و تبدیل تاریخ تولد</h3>
          <p className={`text-[10px] mt-0.5 ${isDarkSeason ? 'text-purple-300/60' : 'text-slate-500'}`}>
            تاریخ تولد خود را به شمسی وارد کنید تا معادل فرکوئنسی‌های قمری، میلادی و سن دقیق نجومی‌تان استخراج شود.
          </p>
        </div>
      </div>

      {/* Date Selectors Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* Year Select */}
        <div className="flex flex-col gap-1 text-right">
          <label className={`text-[10px] font-bold px-1 ${isDarkSeason ? 'text-purple-300/80' : 'text-slate-700'}`}>سال تولد</label>
          <select
            value={birthYear}
            onChange={(e) => {
              setBirthYear(Number(e.target.value));
              setHasCalculated(true);
            }}
            className={`w-full text-xs font-mono font-bold p-2.5 rounded-xl border bg-transparent cursor-pointer outline-none transition-all ${getThemeBorderClass()} ${
              isDarkSeason ? 'text-stone-200 bg-stone-900/40' : 'text-slate-800 bg-slate-50/50'
            }`}
          >
            {yearsRange.map((y) => (
              <option key={y} value={y} className="text-slate-800">
                {toPersianDigits(y)}
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div className="flex flex-col gap-1 text-right">
          <label className={`text-[10px] font-bold px-1 ${isDarkSeason ? 'text-purple-300/80' : 'text-slate-700'}`}>ماه تولد</label>
          <select
            value={birthMonth}
            onChange={(e) => {
              setBirthMonth(Number(e.target.value));
              setHasCalculated(true);
            }}
            className={`w-full text-xs font-sans font-bold p-2.5 rounded-xl border bg-transparent cursor-pointer outline-none transition-all ${getThemeBorderClass()} ${
              isDarkSeason ? 'text-stone-200 bg-stone-900/40' : 'text-slate-800 bg-slate-50/50'
            }`}
          >
            {monthsList.map((m) => (
              <option key={m.id} value={m.id} className="text-slate-800">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Day Select */}
        <div className="flex flex-col gap-1 text-right">
          <label className={`text-[10px] font-bold px-1 ${isDarkSeason ? 'text-purple-300/80' : 'text-slate-700'}`}>روز تولد</label>
          <select
            value={birthDay}
            onChange={(e) => {
              setBirthDay(Number(e.target.value));
              setHasCalculated(true);
            }}
            className={`w-full text-xs font-mono font-bold p-2.5 rounded-xl border bg-transparent cursor-pointer outline-none transition-all ${getThemeBorderClass()} ${
              isDarkSeason ? 'text-stone-200 bg-stone-900/40' : 'text-slate-800 bg-slate-50/50'
            }`}
          >
            {daysList.map((d) => (
              <option key={d} value={d} className="text-slate-800">
                {toPersianDigits(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Content */}
      {calculations && (
        <div className="space-y-4 text-right animate-fade-in">
          
          {/* Main live age summary card */}
          <div className={`p-4 rounded-2xl border text-center relative overflow-hidden ${
            isDarkSeason 
              ? 'bg-[#fc2c54]/5 border-[#fc2c54]/15 text-pink-100'
              : 'bg-gradient-to-br from-indigo-50/30 to-slate-50/70 border-slate-100 text-slate-800'
          }`}>
            <div className="absolute top-0 right-0 p-1 opacity-10">
              <Sparkles className="w-24 h-24 stroke-[1]" />
            </div>

            <span className={`text-[10px] uppercase tracking-wide font-extrabold px-3 py-1 rounded-full ${
              isDarkSeason ? 'bg-[#fc2c54]/15 text-[#fc2c54]' : 'bg-slate-150 text-slate-600'
            }`}>
              سن نجومی دقیق شما
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono font-extrabold tracking-tight">
                  {toPersianDigits(calculations.ageYears)}
                </span>
                <span className="text-[10px] text-slate-500 mr-0.5 mt-0.5">سال</span>
              </div>
              <span className="text-lg text-slate-350 font-bold">و</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono font-extrabold tracking-tight">
                  {toPersianDigits(calculations.ageMonths)}
                </span>
                <span className="text-[10px] text-slate-500 mr-0.5 mt-0.5">ماه</span>
              </div>
              <span className="text-lg text-slate-350 font-bold">و</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono font-extrabold tracking-tight">
                  {toPersianDigits(calculations.ageDays)}
                </span>
                <span className="text-[10px] text-slate-500 mr-0.5 mt-0.5">روز</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-slate-200/40 flex items-center justify-between text-xs px-2">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 opacity-70" />
                <span>کل روزهای سپری‌شده:</span>
              </div>
              <span className="font-mono font-bold">
                {toPersianDigits(calculations.totalDaysLived.toLocaleString('fa-IR'))} روز
              </span>
            </div>
          </div>

          {/* Birthday Countdown */}
          <div className={`p-3 rounded-xl flex items-center justify-between text-xs ${
            calculations.daysToBirthday === 0
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold ring-2 ring-rose-500/10 animate-pulse'
              : isDarkSeason 
                ? 'bg-purple-950/20 border border-purple-500/10 text-purple-200' 
                : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-800'
          }`}>
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 animate-bounce" />
              {calculations.daysToBirthday === 0 ? 'تولدتان مبارک باد! 🎂✨' : 'مدت مانده تا تولد بعدی شما:'}
            </span>
            {calculations.daysToBirthday > 0 && (
              <span className="font-mono font-bold bg-white/50 px-2 py-0.5 rounded-md border border-black/5 dark:bg-black/20">
                {toPersianDigits(calculations.daysToBirthday)} روز دیگر
              </span>
            )}
          </div>

          {/* Gregorian and Hijri conversions list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Miladi */}
            <div className={`p-3.5 rounded-xl border text-right flex items-start gap-2.5 ${
              isDarkSeason ? 'bg-stone-900/40 border-stone-850' : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div className={`p-2 rounded-lg ${getThemeBgClass()}`}>
                <Calendar className={`w-4 h-4 ${getThemeTextClass()}`} />
              </div>
              <div>
                <span className={`text-[9px] font-bold block ${isDarkSeason ? 'text-purple-300/40' : 'text-slate-400'}`}>معادل فرنگی (میلادی)</span>
                <span className="text-xs font-sans font-bold mt-1 block">
                  {toPersianDigits(calculations.gd)} {GREGORIAN_MONTHS_FA[calculations.gm - 1]} {toPersianDigits(calculations.gy)}
                </span>
                <span className={`text-[10px] mt-0.5 block ${isDarkSeason ? 'text-purple-300/60' : 'text-slate-500'}`}>
                  روز تولد: <span className="font-extrabold">{calculations.weekdayName}</span>
                </span>
              </div>
            </div>

            {/* Qamari */}
            <div className={`p-3.5 rounded-xl border text-right flex items-start gap-2.5 ${
              isDarkSeason ? 'bg-stone-900/40 border-stone-850' : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div className={`p-2 rounded-lg ${getThemeBgClass()}`}>
                <Compass className={`w-4 h-4 ${getThemeTextClass()}`} />
              </div>
              <div>
                <span className={`text-[9px] font-bold block ${isDarkSeason ? 'text-purple-300/40' : 'text-slate-400'}`}>معادل اسلامی (قمری)</span>
                <span className="text-xs font-sans font-bold mt-1 block">
                  {toPersianDigits(calculations.hd)} {HIJRI_MONTHS_FA[calculations.hm - 1]} {toPersianDigits(calculations.hy)}
                </span>
                <span className={`text-[10px] mt-0.5 block ${isDarkSeason ? 'text-purple-300/60' : 'text-slate-500'}`}>
                  هماهنگ با کالیبراسیون محلی تقویم
                </span>
              </div>
            </div>
          </div>

          {/* Zodiac astrology Easter Egg */}
          <div className={`p-4 rounded-2xl border text-right transition-all flex flex-col md:flex-row md:items-start justify-between gap-3 ${
            isDarkSeason 
              ? 'bg-[#25152a]/55 border-[#fc2c54]/10' 
              : 'bg-amber-500/5 border-amber-300/10'
          }`}>
            <div className="flex gap-3">
              <div className="text-3xl p-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 rounded-xl w-12 h-12 flex items-center justify-center select-none shrink-0 self-center md:self-start">
                {calculations.zodiac.symbol}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold font-sans">
                    برج طالع‌بینی ماه تولد شما: {calculations.zodiac.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    calculations.zodiac.element === 'آتش' ? 'bg-rose-500/10 text-rose-600' :
                    calculations.zodiac.element === 'باد' ? 'bg-indigo-500/10 text-indigo-600' :
                    calculations.zodiac.element === 'آب' ? 'bg-sky-500/10 text-sky-600' :
                    'bg-amber-500/10 text-amber-700'
                  }`}>
                    عنصر {calculations.zodiac.element}
                  </span>
                </div>
                <p className={`text-[10px] mt-1 leading-relaxed ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
                  {calculations.zodiac.meaning}
                </p>
              </div>
            </div>
          </div>

          {/* Soft poetic reflection based on calendar seasonal theme */}
          <div className="text-center font-sans text-[10px] opacity-75 italic py-1 leading-relaxed max-w-sm mx-auto px-4">
            « {calculations.seasonGreeting} »
          </div>

        </div>
      )}
    </div>
  );
}
