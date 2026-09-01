/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DayEvent } from '../types';

export interface StaticEvent {
  month: number;
  day: number;
  title: string;
  isHoliday: boolean;
}

// 1. Jalali Official Holidays & Events
export const JALALI_EVENTS: StaticEvent[] = [
  // Holidays (تعطیلات رسمی)
  { month: 1, day: 1, title: 'عید نوروز (آغاز سال نو)', isHoliday: true },
  { month: 1, day: 2, title: 'عید نوروز', isHoliday: true },
  { month: 1, day: 3, title: 'عید نوروز', isHoliday: true },
  { month: 1, day: 4, title: 'عید نوروز', isHoliday: true },
  { month: 1, day: 12, title: 'روز جمهوری اسلامی ایران', isHoliday: true },
  { month: 1, day: 13, title: 'روز طبیعت (سیزده به در)', isHoliday: true },
  { month: 3, day: 14, title: 'رحلت حضرت امام خمینی (ره)', isHoliday: true },
  { month: 3, day: 15, title: 'قیام خونین ۱۵ خرداد', isHoliday: true },
  { month: 11, day: 22, title: 'پیروزی انقلاب اسلامی ایران', isHoliday: true },
  { month: 12, day: 29, title: 'روز ملی شدن صنعت نفت ایران', isHoliday: true },

  // Special Days (مناسبت‌های غیر تعطیل)
  { month: 1, day: 18, title: 'روز سلامتی', isHoliday: false },
  { month: 1, day: 25, title: 'روز بزرگداشت عطار نیشابوری', isHoliday: false },
  { month: 2, day: 3, title: 'روز بزرگداشت شیخ بهایی / روز معمار', isHoliday: false },
  { month: 2, day: 10, title: 'روز ملی خلیج فارس', isHoliday: false },
  { month: 2, day: 15, title: 'بزرگداشت شیخ صدوق / روز شیراز', isHoliday: false },
  { month: 2, day: 25, title: 'روز بزرگداشت حکیم ابوالقاسم فردوسی', isHoliday: false },
  { month: 2, day: 28, title: 'روز بزرگداشت حکیم عمر خیام', isHoliday: false },
  { month: 3, day: 20, title: 'روز جهانی صنایع دستی', isHoliday: false },
  { month: 4, day: 10, title: 'روز صنعت و معدن', isHoliday: false },
  { month: 5, day: 1, title: 'روز بزرگداشت ابن سینا / روز پزشک', isHoliday: false },
  { month: 5, day: 4, title: 'روز کارمند', isHoliday: false },
  { month: 5, day: 5, title: 'بزرگداشت زکریای رازی / روز داروساز', isHoliday: false },
  { month: 6, day: 27, title: 'روز شعر و ادب فارسی (بزرگداشت استاد شهریار)', isHoliday: false },
  { month: 7, day: 8, title: 'روز بزرگداشت مولوی', isHoliday: false },
  { month: 7, day: 20, title: 'روز بزرگداشت حافظ', isHoliday: false },
  { month: 8, day: 7, title: 'روز بزرگداشت کوروش بزرگ', isHoliday: false },
  { month: 9, day: 16, title: 'روز دانشجو', isHoliday: false },
  { month: 9, day: 30, title: 'شب یلدا', isHoliday: false },
  { month: 12, day: 5, title: 'روز بزرگداشت خواجه نصیرالدین طوسی / روز مهندس', isHoliday: false },
  { month: 12, day: 15, title: 'روز درختکاری', isHoliday: false }
];

// 2. Lunar Hijri Official Holidays & Events in Iran
export const HIJRI_EVENTS: StaticEvent[] = [
  // Holidays (تعطیلات رسمی مذهبی)
  { month: 1, day: 9, title: 'تاسوعای حسینی', isHoliday: true },
  { month: 1, day: 10, title: 'عاشورای حسینی (شهادت حضرت امام حسین علیه‌السلام)', isHoliday: true },
  { month: 2, day: 20, title: 'اربعین حسینی', isHoliday: true },
  { month: 2, day: 28, title: 'رحلت رسول اکرم و شهادت امام حسن مجتبی (ع)', isHoliday: true },
  { month: 2, day: 30, title: 'شهادت حضرت امام رضا علیه‌السلام', isHoliday: true },
  { month: 3, day: 8, title: 'شهادت امام حسن عسکری (ع) و آغاز ولایت امام زمان (عج)', isHoliday: true },
  { month: 3, day: 17, title: 'ولادت پیامبر اکرم (ص) و ولادت امام جعفر صادق (ع)', isHoliday: true },
  { month: 6, day: 3, title: 'شهادت حضرت فاطمه زهرا سلام‌الله‌علیها', isHoliday: true },
  { month: 7, day: 13, title: 'ولادت حضرت امام علی علیه‌السلام (روز پدر)', isHoliday: true },
  { month: 7, day: 27, title: 'مبعث پیامبر گرامی اسلام (ص)', isHoliday: true },
  { month: 8, day: 15, title: 'ولادت حضرت قائم (عج) / نیمه شعبان', isHoliday: true },
  { month: 9, day: 21, title: 'شهادت امام علی علیه‌السلام', isHoliday: true },
  { month: 10, day: 1, title: 'عید سعید فطر', isHoliday: true },
  { month: 10, day: 2, title: 'تعطیل عید فطر', isHoliday: true },
  { month: 10, day: 25, title: 'شهادت امام جعفر صادق (ع)', isHoliday: true },
  { month: 12, day: 10, title: 'عید سعید قربان', isHoliday: true },
  { month: 12, day: 18, title: 'عید سعید غدیر خم', isHoliday: true },

  // Special Days (غیر تعطیل مذهبی)
  { month: 1, day: 1, title: 'آغاز سال نو هجری قمری', isHoliday: false },
  { month: 8, day: 3, title: 'ولادت حضرت امام حسین (ع) - روز پاسدار', isHoliday: false },
  { month: 8, day: 4, title: 'ولادت حضرت ابوالفضل (ع) - روز جانباز', isHoliday: false },
  { month: 8, day: 5, title: 'ولادت حضرت امام سجاد (ع)', isHoliday: false },
  { month: 9, day: 15, title: 'ولادت حضرت امام حسن مجتبی (ع)', isHoliday: false },
  { month: 9, day: 19, title: 'ضربت خوردن حضرت امام علی (ع) / شب قدر', isHoliday: false },
  { month: 9, day: 23, title: 'شب قدر سوم مذهبی', isHoliday: false }
];

// 3. Gregorian Commemorations in Iran (Mostly international calendar matches)
export const GREGORIAN_EVENTS: StaticEvent[] = [
  { month: 1, day: 1, title: 'آغاز سال نو میلادی', isHoliday: false },
  { month: 4, day: 22, title: 'روز جهانی زمین', isHoliday: false },
  { month: 5, day: 1, title: 'روز جهانی کار و کارگر (تعطیل بخش کارگری)', isHoliday: false },
  { month: 5, day: 15, title: 'روز جهانی خانواده', isHoliday: false },
  { month: 6, day: 1, title: 'روز جهانی کودک', isHoliday: false },
  { month: 9, day: 21, title: 'روز جهانی صلح', isHoliday: false },
  { month: 10, day: 5, title: 'روز جهانی معلم', isHoliday: false },
  { month: 12, day: 10, title: 'روز جهانی حقوق بشر', isHoliday: false },
  { month: 12, day: 25, title: 'میلاد حضرت عیسی مسیح (ع) - کریسمس', isHoliday: false }
];

/**
 * Merges and returns all events matching any of the three calendars for the given day
 */
export function getEventsForDay(
  jm: number, jd: number,
  gm: number, gd: number,
  hm: number, hd: number
): DayEvent[] {
  const matchedEvents: DayEvent[] = [];

  // 1. Check Jalali events
  JALALI_EVENTS.forEach((ev, idx) => {
    if (ev.month === jm && ev.day === jd) {
      matchedEvents.push({
        id: `jalali-${idx}-${jm}-${jd}`,
        title: ev.title,
        isHoliday: ev.isHoliday,
        calendar: 'jalali'
      });
    }
  });

  // 2. Check Hijri events
  HIJRI_EVENTS.forEach((ev, idx) => {
    if (ev.month === hm && ev.day === hd) {
      matchedEvents.push({
        id: `hijri-${idx}-${hm}-${hd}`,
        title: ev.title,
        isHoliday: ev.isHoliday,
        calendar: 'hijri'
      });
    }
  });

  // 3. Check Gregorian events
  GREGORIAN_EVENTS.forEach((ev, idx) => {
    if (ev.month === gm && ev.day === gd) {
      matchedEvents.push({
        id: `gregorian-${idx}-${gm}-${gd}`,
        title: ev.title,
        isHoliday: ev.isHoliday,
        calendar: 'gregorian'
      });
    }
  });

  return matchedEvents;
}
