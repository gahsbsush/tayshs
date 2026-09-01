/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jalaali from 'jalaali-js';

// Helper: Convert Gregorian date to Julian Day Number (JDN)
export function g2d(gy: number, gm: number, gd: number): number {
  return jalaali.g2d(gy, gm, gd);
}

// Helper: Convert Julian Day Number (JDN) to Gregorian date
export function d2g(jdn: number): [number, number, number] {
  const r = jalaali.d2g(jdn);
  return [r.gy, r.gm, r.gd];
}

// Helper: Convert Jalali date to Julian Day Number (JDN)
export function j2d(jy: number, jm: number, jd: number): number {
  return jalaali.j2d(jy, jm, jd);
}

// Helper: Convert Julian Day Number (JDN) to Jalali date
export function d2j(jdn: number): [number, number, number] {
  const r = jalaali.d2j(jdn);
  return [r.jy, r.jm, r.jd];
}

// Exported standard converter: Gregorian to Jalali
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const r = jalaali.toJalaali(gy, gm, gd);
  return [r.jy, r.jm, r.jd];
}

// Exported standard converter: Jalali to Gregorian
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const r = jalaali.toGregorian(jy, jm, jd);
  return [r.gy, r.gm, r.gd];
}

// Exported: Lunar Hijri Leap Year verification
export function isHijriLeap(hy: number): boolean {
  // 11 leap years in a 30-year Islamic cycle
  const rem = hy % 30;
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(rem);
}

// Exported: Gregorian to Lunar Hijri (Ghamari) with customizable offset (-2 to +2)
export function gregorianToHijri(gy: number, gm: number, gd: number, offsetDays: number = 0): [number, number, number] {
  const jdn = g2d(gy, gm, gd) + offsetDays;
  
  // Base tabular Islamic calculation
  const jd = jdn - 1948439.5;
  const cycle = Math.floor(jd / 10631);
  let rem = jd % 10631;
  if (rem < 0) {
    rem += 10631;
  }
  const cy = Math.floor((30 * rem + 15) / 10631);
  const hy = cycle * 30 + cy + 1;
  let remDays = rem - Math.floor((11 * cy + 3) / 30) - cy * 354;
  
  let hm = 1;
  while (hm <= 12) {
    const len = (hm % 2 === 1) ? 30 : ((hm === 12 && isHijriLeap(hy)) ? 30 : 29);
    if (remDays < len) {
      break;
    }
    remDays -= len;
    hm++;
  }
  let hd = Math.floor(remDays) + 1;
  if (hd <= 0) {
    hd = 1;
  }
  return [hy, hm, hd];
}

// Useful Jalali specific helpers
export function isJalaliLeap(jy: number): boolean {
  return jalaali.isLeapJalaaliYear(jy);
}

export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) return isJalaliLeap(jy) ? 30 : 29;
  return 0;
}

// Translation helpers
export const JALALI_MONTHS_FA = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export const GREGORIAN_MONTHS_FA = [
  'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
  'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
];

export const HIJRI_MONTHS_FA = [
  'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'
];

export const WEEKDAYS_FA = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'
];

// Returns the full name of a week day, starting with شنبه=0
export function getWeekdayName(index: number): string {
  return WEEKDAYS_FA[index % 7];
}

// Convert numbers of a string to Persian equivalents
export function toPersianDigits(num: number | string): string {
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

// Get the Season from a Jalali Month (1-12)
export function getSeason(jm: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (jm >= 1 && jm <= 3) return 'spring';
  if (jm >= 4 && jm <= 6) return 'summer';
  if (jm >= 7 && jm <= 9) return 'autumn';
  return 'winter';
}

// Get season display name in Persian
export function getSeasonNameFa(season: 'spring' | 'summer' | 'autumn' | 'winter'): string {
  const map = {
    spring: 'بهار',
    summer: 'تابستان',
    autumn: 'پاییز',
    winter: 'زمستان'
  };
  return map[season];
}

// Full descriptive Persian date
export function getFullPersianDateText(jy: number, jm: number, jd: number, dayOfWeek: number): string {
  return `${getWeekdayName(dayOfWeek)}، ${toPersianDigits(jd)} ${JALALI_MONTHS_FA[jm - 1]} ${toPersianDigits(jy)}`;
}
