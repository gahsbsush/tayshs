/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomTheme } from '../types';

export const SEASONAL_THEMES: Record<'spring' | 'summer' | 'autumn' | 'winter', CustomTheme> = {
  spring: {
    name: 'بهار ملایم ارغوان و نارنج',
    season: 'spring',
    bgGradient: 'bg-gradient-to-tr from-[#fff5f5] via-[#f0fcf5] to-[#fbf7ff]',
    primaryBg: 'bg-[#0d5236]',
    primaryText: 'text-slate-800',
    cardBg: 'bg-white/90 backdrop-blur-2xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5',
    cardBorder: 'border-emerald-500/15 border-b-emerald-500/25',
    accentColor: 'bg-gradient-to-r from-emerald-600 to-teal-700',
    accentText: 'text-white',
    shadowColor: 'shadow-emerald-950/10'
  },
  summer: {
    name: 'تابستان طلایی و فیروزه‌ای',
    season: 'summer',
    bgGradient: 'bg-gradient-to-br from-[#e0f8fc] via-[#daf2f7] to-[#fff4e0]',
    primaryBg: 'bg-[#0e5c6a]',
    primaryText: 'text-slate-800',
    cardBg: 'bg-white/90 backdrop-blur-2xl border border-cyan-500/15 shadow-xl shadow-cyan-950/5',
    cardBorder: 'border-cyan-500/15 border-b-cyan-500/25',
    accentColor: 'bg-gradient-to-r from-cyan-600 to-amber-500',
    accentText: 'text-white',
    shadowColor: 'shadow-cyan-950/10'
  },
  autumn: {
    name: 'یاقوت پاییزی (تیره لوکس)',
    season: 'autumn',
    bgGradient: 'bg-gradient-to-br from-[#12071a] via-[#1a0c16] to-[#0e0411]',
    primaryBg: 'bg-[#fc2c54]',
    primaryText: 'text-white',
    cardBg: 'bg-[#24172a]/92 backdrop-blur-3xl border border-[#fc2c54]/25 shadow-2xl shadow-black/80',
    cardBorder: 'border-[#fc2c54]/30 border-b-[#f0853c]/40',
    accentColor: 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c]',
    accentText: 'text-white',
    shadowColor: 'shadow-black/95'
  },
  winter: {
    name: 'زمستان برفی و بلورین',
    season: 'winter',
    bgGradient: 'bg-gradient-to-br from-[#e1f5fe] via-[#ede7f6] to-[#eceff1]',
    primaryBg: 'bg-[#1e6091]',
    primaryText: 'text-slate-800',
    cardBg: 'bg-white/92 backdrop-blur-2xl border border-sky-450/20 shadow-xl shadow-sky-950/5',
    cardBorder: 'border-sky-300/25 border-b-sky-400/35',
    accentColor: 'bg-gradient-to-r from-[#2196f3] to-[#9c27b0]',
    accentText: 'text-white',
    shadowColor: 'shadow-sky-950/5'
  }
};
