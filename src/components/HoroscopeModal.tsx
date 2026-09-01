/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Star, Heart, Compass, CompassIcon, RefreshCw, Award, Smile } from 'lucide-react';
import { CustomTheme } from '../types';
import { toPersianDigits } from '../utils/dateConverter';

interface HoroscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: CustomTheme;
}

// 12 Persian Zodiac signs
interface ZodiacSign {
  id: number;
  name: string;
  symbol: string;
  english: string;
  element: 'آتش' | 'خاک' | 'باد' | 'آب';
  color: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 1, name: 'فروردین', symbol: '🐑', english: 'Aries', element: 'آتش', color: 'text-amber-500' },
  { id: 2, name: 'اردیبهشت', symbol: '🐂', english: 'Taurus', element: 'خاک', color: 'text-emerald-500' },
  { id: 3, name: 'خرداد', symbol: '👥', english: 'Gemini', element: 'باد', color: 'text-sky-500' },
  { id: 4, name: 'تیر', symbol: '🦀', english: 'Cancer', element: 'آب', color: 'text-rose-500' },
  { id: 5, name: 'مرداد', symbol: '🦁', english: 'Leo', element: 'آتش', color: 'text-yellow-500' },
  { id: 6, name: 'شهریور', symbol: '🌾', english: 'Virgo', element: 'خاک', color: 'text-orange-500' },
  { id: 7, name: 'مهر', symbol: '⚖️', english: 'Libra', element: 'باد', color: 'text-pink-500' },
  { id: 8, name: 'آبان', symbol: '🦂', english: 'Scorpio', element: 'آب', color: 'text-purple-500' },
  { id: 9, name: 'آذر', symbol: '🏹', english: 'Sagittarius', element: 'آتش', color: 'text-red-500' },
  { id: 10, name: 'دی', symbol: '🐐', english: 'Capricorn', element: 'خاک', color: 'text-indigo-400' },
  { id: 11, name: 'بهمن', symbol: '🏺', english: 'Aquarius', element: 'باد', color: 'text-blue-500' },
  { id: 12, name: 'اسفند', symbol: '🐟', english: 'Pisces', element: 'آب', color: 'text-teal-500' }
];

// Poetic, Mystic, and Astrological text pools to combine based on date seeds
const POETIC_VERSES = [
  "دوش وقت سحر از غصه نجاتم دادند / واندر آن ظلمت شب آب حیاتم دادند",
  "هر آن که جانب اهل خدا نگه دارد / خداش در همه حال از بلا نگه دارد",
  "صبح است و ژاله می‌چکد از روی لاله / وقت است و عیش بر طرب آور پیاله",
  "یوسف گم گشته بازآید به کنعان غم مخور / کلبه احزان شود روزی گلستان غم مخور",
  "رسید مژده که ایام غم نخواهد ماند / چنان نماند و چنین نیز هم نخواهد ماند",
  "در میخانه ببستند خدایا مپسند / که در خانه تزویر و ریا بگشایند",
  "آسایش دو گیتی تفسیر این دو حرف است / با دوستان مروت با دشمنان مدارا",
  "سال‌ها دل طلب جام جم از ما می‌کرد / وان چه خود داشت ز بیگانه تمنا می‌کرد",
  "گل عذاری ز گلستان جهان ما را بس / زین چمن سایه آن سرو روان ما را بس",
  "نفس باد صبا مشک فشان خواهد شد / عالم پیر دگرباره جوان خواهد شد"
];

const FORECAST_LOVE = [
  "یک گفت‌وگوی عاطفی صمیمانه در شرف وقوع است. قلب خود را باز بگذارید و احساسات خالص خود را بیان کنید تفاهم عمیقی میان شما شکل می‌گیرد.",
  "محبت‌های کوچک راز پایداری روابط بزرگ است. امروز فرستادن هدیه‌ای ساده یا پیامی مهربانانه، طوفان‌های گذشته را به آرامش بدل می‌کند.",
  "سیاره ناهید در زاویه آرامش‌بخش فال شما طنین‌انداز شده؛ کینه‌های قدیمی را کنار بگذارید و به فردا لبخند بزنید.",
  "موانع احساسی به زودی مرتفع خواهند شد. صبوری کلید پیروزی شماست. برای تصمیم‌گیری کلان نیاز به زمان بیشتری دارید."
];

const FORECAST_FINANCE = [
  "سیاره برجیس سیگنال برکت مالی صادر مى‌کند. از خریدهای احساسی پرهیز کنید، چرا که اندوختهٔ امروز پله‌ای برای فرصت بزرگ فرداست.",
  "یک ایده کاری جالب در سر دارید که ارزش سرمایه‌گذاری فکری دارد. با یک فرد امین مشورت کنید تا راه‌ها هموار شود.",
  "تنبلی بزرگ‌ترین مانع رشد شغلی شماست. با اراده‌ای قوی‌تر گام‌های جدید بردارید، به زودی پاداش تلاش‌های خود را خواهید گرفت.",
  "در مسائل اقتصادی احتیاط شرط عقل است. به تعهدات کوتاه مدت وفادار بمانید و از ریسک غیرمعقول مالی خودداری فرمایید."
];

const FORECAST_HEALTH = [
  "سلامت روح شما به آرامش ذهنی گره خورده است. پیاده‌روی در فضای سبز یا دقایقی خلوت و مراقبه، انرژی از دست رفته را به تن شما بازمی‌گرداند.",
  "به الگوی خواب خود اهمیت بیشتری بدهید. نوشیدن آب کافی و دوری از شلوغی، سیستم دفاعی شما را به کمال قوام می‌رساند.",
  "افکار منفی را فیلتر کنید. استرس‌های کاری موقتی هستند؛ عضلات شانه را شل کرده و نفس عمیق بکشید.",
  "انرژی مثبت در نیمه تاریک هاله شما ظاهر شده است. با تغییر سبک تغذیه خود، حیاتی پر شور و نشاط‌تر را تجربه خواهید کرد."
];

const ASTRO_TRANSITIONS = [
  "ورود خورشید به خانه خلاقیت و آرامش معنوی",
  "تقارن بی‌نظیر ماه تابان با سیاره مشتری (برجیس)",
  "پایان گرفتگی‌های روحی و گشایش فکری در چیدمان کواکب",
  "تمرکز انرژی مثبت کیهانی در مدار خوشبختی شما",
  "انعکاس پرتوهای الهی آرامش‌بخش در زاویه ناهید",
  "انرژی صعودی اورانوس در مدار گشایش مالی"
];

const LUCK_COLORS = [
  "آبی لاجوردی و فیروزه‌ای",
  "سبز بهارنارنج و نعنایی",
  "یاسی و بنفش سلطنتی",
  "طلایی درخشان و خردلی",
  "صورتی ملایم و ارغوانی",
  "نقره‌ای مه‌آلود و زیتونی"
];

export default function HoroscopeModal({ isOpen, onClose, currentTheme }: HoroscopeModalProps) {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);

  const isDarkSeason = currentTheme.season === 'autumn';

  // Get current daily dynamic values to change horoscope daily
  const todayKeyObj = useMemo(() => {
    const d = new Date();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const seed = day + month * 31 + (year % 100) * 365;
    return { day, month, year, seed };
  }, []);

  // Compute a deterministic pseudo-random index
  const getDailyIndex = (seedBase: number, arrayLength: number, offset: number = 0): number => {
    return (seedBase + offset) % arrayLength;
  };

  // Generate deterministic daily horoscope for chosen Month
  const dailyHoroscopeDetails = useMemo(() => {
    if (!selectedSign) return null;

    const seedVal = todayKeyObj.seed * selectedSign.id;
    
    const poetryIndex = getDailyIndex(seedVal, POETIC_VERSES.length, 12);
    const loveIndex = getDailyIndex(seedVal, FORECAST_LOVE.length, 25);
    const financeIndex = getDailyIndex(seedVal, FORECAST_FINANCE.length, 45);
    const healthIndex = getDailyIndex(seedVal, FORECAST_HEALTH.length, 65);
    const transitionIndex = getDailyIndex(seedVal, ASTRO_TRANSITIONS.length, 85);
    const colorIndex = getDailyIndex(seedVal, LUCK_COLORS.length, 105);
    const luckNum = (seedVal % 9) + 1;

    return {
      poetry: POETIC_VERSES[poetryIndex],
      love: FORECAST_LOVE[loveIndex],
      finance: FORECAST_FINANCE[financeIndex],
      health: FORECAST_HEALTH[healthIndex],
      transition: ASTRO_TRANSITIONS[transitionIndex],
      color: LUCK_COLORS[colorIndex],
      luckNumber: luckNum
    };
  }, [selectedSign, todayKeyObj]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay background */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Glassmorphic modal structure */}
      <div className={`relative w-full max-w-sm max-h-[85dvh] overflow-hidden flex flex-col rounded-3xl border border-white/10 shadow-2xl select-none text-right ${
        isDarkSeason ? 'bg-stone-950 text-stone-105' : 'bg-white/90 text-slate-800'
      }`} style={{ direction: 'rtl', fontFamily: 'Inter, system-ui' }}>
        
        {/* Header decoration stars */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-amber-500 to-indigo-500" />
        
        {/* Header container */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-sans font-black text-xs sm:text-sm">⭐️ فال و طالع‌بینی روزانه بهارنارنج</h3>
              <p className="text-[10px] opacity-60 font-mono mt-0.5">
                بروزرسانی زنده آنلاین: {toPersianDigits(todayKeyObj.day)} / {toPersianDigits(todayKeyObj.month)} / {toPersianDigits(todayKeyObj.year)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal scroll body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Sign Details view if selected */}
          {selectedSign && dailyHoroscopeDetails ? (
            <div className="space-y-4 animate-fade-in">
              {/* Back Button */}
              <button 
                onClick={() => setSelectedSign(null)}
                className="text-xs font-sans font-extrabold flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-all cursor-pointer border border-black/10 dark:border-white/15 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5"
              >
                ← بازگشت به لیست ماه‌ها
              </button>

              {/* Zodiac Header card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-550/15 via-purple-550/10 to-transparent border border-purple-500/10 flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-black text-base text-purple-600 dark:text-purple-300">
                    فال روزانه متولدین {selectedSign.name}
                  </h4>
                  <p className="text-[10px] opacity-70 font-mono mt-1">
                    ترکیب عنصر {selectedSign.element} • نشانه نجومی: {selectedSign.english}
                  </p>
                </div>
                <span className="text-4xl filter drop-shadow animate-bounce">{selectedSign.symbol}</span>
              </div>

              {/* Mystic Verse Quote Box */}
              <div className="p-4 rounded-2xl border border-dashed text-center bg-amber-500/5 border-amber-500/20 text-stone-900 dark:text-amber-105">
                <span className="text-[9px] font-bold tracking-widest text-amber-600 dark:text-amber-300 block mb-1">
                  ~ بیتی از غزل صوفیانهٔ امروز برای شما ~
                </span>
                <p className="text-sm font-serif italic font-bold leading-relaxed">
                  « {dailyHoroscopeDetails.poetry} »
                </p>
              </div>

              {/* Astro transition element */}
              <div className="p-3.5 rounded-xl border flex items-center gap-2 bg-indigo-500/5 border-indigo-500/10">
                <Compass className="w-4 h-4 text-indigo-500 shrink-0 rotate-12" />
                <div className="text-right">
                  <span className="text-[9px] opacity-65 block">وضعیت کواکب و انرژی کیهانی امروز شما:</span>
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{dailyHoroscopeDetails.transition}</p>
                </div>
              </div>

              {/* Grid of Love, Finance, Health */}
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Love Forecast */}
                <div className="p-3.5 rounded-2xl border bg-rose-500/5 border-rose-500/10 space-y-1">
                  <div className="flex items-center gap-1 text-rose-500 font-bold text-xs">
                    <Heart className="w-4 h-4 fill-rose-550/10" />
                    <span>روابط و عضلات عاطفی امروز</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-stone-300">
                    {dailyHoroscopeDetails.love}
                  </p>
                </div>

                {/* 2. Finance Forecast */}
                <div className="p-3.5 rounded-2xl border bg-emerald-500/5 border-emerald-500/10 space-y-1">
                  <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>شغل و پتانسیل ثروت‌اندوزی</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-stone-300">
                    {dailyHoroscopeDetails.finance}
                  </p>
                </div>

                {/* 3. Health Forecast */}
                <div className="p-3.5 rounded-2xl border bg-amber-500/5 border-amber-500/10 space-y-1">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Smile className="w-4 h-4" />
                    <span>شادابی، هاله و سلامت فیزیکی</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-stone-300">
                    {dailyHoroscopeDetails.health}
                  </p>
                </div>
              </div>

              {/* Lucky Stats Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                  <span className="text-[10px] opacity-60 block">عدد شانس جادویی امروز</span>
                  <span className="text-lg font-black font-sans text-amber-500 mt-1 block">
                    {toPersianDigits(dailyHoroscopeDetails.luckNumber)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                  <span className="text-[10px] opacity-60 block">رنگ مکمل و جاذب انرژی</span>
                  <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 mt-1 block leading-relaxed">
                    {dailyHoroscopeDetails.color}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 animate-fade-in">
              <div className="text-center p-2.5 pb-1">
                <p className="text-xs text-slate-650 dark:text-stone-350 leading-relaxed font-sans">
                  فرکانس کواکب و فال امروز خود را دریافت کنید. جهت شروع، ماه تولد ارزشمند خود را در کادر زیر بفشارید:
                </p>
              </div>

              {/* Grid of 12 Months selection */}
              <div className="grid grid-cols-3 gap-2.5">
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    key={sign.name}
                    onClick={() => setSelectedSign(sign)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer hover:border-purple-500/30 ${
                      isDarkSeason 
                        ? 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-850' 
                        : 'bg-white border-slate-100 text-stone-800 hover:bg-slate-50 hover:shadow shadow-sm'
                    }`}
                  >
                    <span className="text-2xl filter drop-shadow-sm">{sign.symbol}</span>
                    <span className="text-xs font-sans font-bold">{sign.name}</span>
                    <span className="text-[8px] opacity-50 font-mono tracking-tighter">{sign.english}</span>
                  </button>
                ))}
              </div>

              {/* Info Tips */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[10px] leading-relaxed text-purple-600 dark:text-purple-300 text-center">
                💡 فال روزانه بر اساس چیدمان کیهانی هر روز در همین ساعت تغییر می‌یابد. فردا در هر کجای دنیا برای طالع جدید مراجعه فرمایید.
              </div>
            </div>
          )}

        </div>

        {/* Footer Container */}
        <div className="p-3 border-t border-white/10 shrink-0 text-center bg-black/5 dark:bg-white/5">
          <span className="text-[10px] opacity-40 font-mono">
            رویدادنگار بهارنارنج • نسخه طالع‌بینی هوشمند صوفیانه
          </span>
        </div>

      </div>
    </div>
  );
}
