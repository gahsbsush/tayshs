/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { CustomTheme } from '../types';
import { toPersianDigits } from '../utils/dateConverter';

interface QuoteWisdomProps {
  currentTheme: CustomTheme;
}

const HAFEZ_GHAZALS = [
  {
    verse1: "بیا تا گل برافشانیم و می در ساغر اندازیم",
    verse2: "فلک را سقف بشکافیم و طرحی نو دراندازیم",
    interpretation: "شما در آستانه تحول بزرگی در زندگی هستید. طرح نو یعنی زمان شروع کار تازه یا رابطه تازه‌ای فرام رسیده است. از محافظه‌کاری دست بردارید و با دلی روشن قدم در مسیر دلخواه بگذارید."
  },
  {
    verse1: "حافظا در کنج فقر و خلوت شب‌های تار",
    verse2: "تا بود وردت دعا و درس قرآن غم مخور",
    interpretation: "غم‌های روزگار گذرا هستند و شب تاریک سختی شما رو به غزل سپیده صبح هدایت مى‌کند. با تمرکز بر مناجات و توکل الهی، روحیهٔ شاداب و ارادهٔ آهنین را به زندگی‌تان بازگردانید."
  },
  {
    verse1: "رسید مژده که ایام غم نخواهد ماند",
    verse2: "چنان نماند و چنین نیز هم نخواهد ماند",
    interpretation: "دشواری یا بن‌بست کنونی موقت است و به زودی با خبر یا مژدهٔ خوشحال‌کننده‌ای گره‌گشایی خواهد شد. قدر لحظه‌های حال را بدانید و با رها کردن نگرانی‌های پوچ، به استقبال فردا بروید."
  },
  {
    verse1: "زلف‌آشفته و خوی‌کرده و خندان‌لب و مست",
    verse2: "پیرهن‌چاک و غزل‌خوان و صراحی در دست",
    interpretation: "عشق ناب و صمیمیتی پرشور در طالع امروز شما در تپش است. بهانه‌گیری نکنید و اگر سوءتفاهمی با دوستان دارید، با آغوش باز و لبخند آن را خاتمه دهید."
  },
  {
    verse1: "در مذهب ما باده حلال است ولیکن",
    verse2: "بی‌روی تو ای سرو گل‌اندام حرام است",
    interpretation: "وفاداری و پیمان‌داری مهم‌ترین خصلت پیروزی شماست. در هر قدمی که برمی‌دارید رضایت اشخاص دلسوز را در نظر داشته باشید تا برکت در زندگی‌تان دوچندان گردد."
  }
];

export default function QuoteWisdom({ currentTheme }: QuoteWisdomProps) {
  const [activeGhazal, setActiveGhazal] = useState<typeof HAFEZ_GHAZALS[0]>(HAFEZ_GHAZALS[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const isDarkSeason = currentTheme.season === 'autumn';

  const handleTafaol = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * HAFEZ_GHAZALS.length);
      setActiveGhazal(HAFEZ_GHAZALS[idx]);
      setIsSpinning(false);
    }, 600);
  };

  return (
    <div className={`p-4 rounded-3xl border shadow-sm space-y-3.5 text-right transition-all duration-300 ${
      isDarkSeason 
        ? 'bg-[#1a0f21]/75 border-purple-500/10 text-stone-105' 
        : 'bg-gradient-to-br from-white to-amber-50/20 border-slate-200/50 text-slate-800'
    }`} style={{ direction: 'rtl' }}>
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b pb-2 border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-300">
          <BookOpen className="w-4 h-4 animate-pulse" />
          <span>یک قاچ آرامش • تفأل صوفیانه به دیوان شیراز</span>
        </div>
        
        <button
          onClick={handleTafaol}
          disabled={isSpinning}
          className="text-[9px] font-sans font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-650 dark:text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSpinning ? 'در حال ورق زدن...' : 'تفأل جدید 🔮'}
        </button>
      </div>

      {/* Ghazal lines display area */}
      <div className={`p-3.5 rounded-2xl border text-center space-y-2 border-dashed ${
        isDarkSeason ? 'bg-[#291730]/40 border-purple-500/20' : 'bg-amber-500/5 border-amber-500/10'
      }`}>
        <p className="text-xs sm:text-sm font-serif italic font-bold leading-relaxed">
          « {activeGhazal.verse1} »
        </p>
        <p className="text-xs sm:text-sm font-serif italic font-bold leading-relaxed">
          « {activeGhazal.verse2} »
        </p>
      </div>

      {/* Tafsir text */}
      <div className={`p-3 rounded-xl text-[10px] sm:text-xs leading-relaxed space-y-1 ${
        isDarkSeason ? 'bg-[#1b1220] text-stone-300' : 'bg-slate-50 text-slate-600'
      }`}>
        <div className="flex items-center gap-1 text-purple-650 dark:text-[#fc2c54] font-bold text-[9px] sm:text-[10px]">
          <Heart className="w-3.5 h-3.5 fill-red-500/10 stroke-[2.5]" />
          <span>تفسیر و معنای عرفانی غزل حضرت حافظ:</span>
        </div>
        <p className="font-sans leading-relaxed text-slate-600 dark:text-stone-300">
          {activeGhazal.interpretation}
        </p>
      </div>

    </div>
  );
}
