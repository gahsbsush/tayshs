/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NoteType = 'meeting' | 'birthday' | 'reminder' | 'anniversary' | 'todo';

export interface UserNote {
  id: string;
  title: string;
  description: string;
  time?: string; // HH:mm format
  type: NoteType;
  dateStr: string; // Format: "jy-jm-jd" (e.g. "1405-3-10")
  reminderMinutesBefore?: number; // Minutes before
}

export interface DayEvent {
  id: string;
  title: string;
  isHoliday: boolean;
  calendar: 'jalali' | 'gregorian' | 'hijri';
}

export interface CustomTheme {
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  bgGradient: string;
  primaryBg: string;
  primaryText: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  accentText: string;
  shadowColor: string;
}

export interface CalendarDay {
  jy: number;
  jm: number;
  jd: number;
  gy: number;
  gm: number;
  gd: number;
  hy: number;
  hm: number;
  hd: number;
  dayOfWeek: number; // 0 (Saturday) to 6 (Friday)
  isCurrentMonth: boolean;
  isToday: boolean;
  events: DayEvent[];
  hasNotes: boolean;
  notesList: UserNote[];
  isHoliday: boolean;
}
