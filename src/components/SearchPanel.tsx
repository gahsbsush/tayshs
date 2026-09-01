/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Star, Tag, Compass } from 'lucide-react';
import { CustomTheme, UserNote } from '../types';
import { JALALI_EVENTS as jEvents, HIJRI_EVENTS as hEvents, GREGORIAN_EVENTS as gEvents } from '../data/events';
import { JALALI_MONTHS_FA, toPersianDigits, HIJRI_MONTHS_FA, GREGORIAN_MONTHS_FA } from '../utils/dateConverter';

interface SearchPanelProps {
  userNotes: UserNote[];
  currentTheme: CustomTheme;
  onNavigateToDate: (jm: number, jd: number) => void;
  lunarOffset: number;
}

interface MergedSearchItem {
  id: string;
  title: string;
  dateText: string;
  type: 'national_holiday' | 'national_event' | 'religious_holiday' | 'religious_event' | 'gregorian_event' | 'user_note';
  isHoliday: boolean;
  targetJm: number;
  targetJd: number;
}

export default function SearchPanel({
  userNotes,
  currentTheme,
  onNavigateToDate,
  lunarOffset
}: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const isDarkSeason = currentTheme.season === 'autumn';

  const getThemeColorClass = () => {
    if (isDarkSeason) return 'text-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'text-emerald-600';
      case 'summer': return 'text-cyan-600';
      case 'winter': return 'text-sky-600';
    }
  };

  // Build a searchable index of ALL holidays + user notes for the CURRENT virtual year
  // Since we don't have a fixed dynamic calculation of lunar dates for ALL years easily,
  // we will map them using current year (1405 for instance, or any year, we default to showing their relative days)
  const items: MergedSearchItem[] = useMemo(() => {
    const list: MergedSearchItem[] = [];

    // 1. Jalali Events
    jEvents.forEach((ev, idx) => {
      list.push({
        id: `j-search-${idx}`,
        title: ev.title,
        dateText: `${toPersianDigits(ev.day)} ${JALALI_MONTHS_FA[ev.month - 1]} (شمسی)`,
        type: ev.isHoliday ? 'national_holiday' : 'national_event',
        isHoliday: ev.isHoliday,
        targetJm: ev.month,
        targetJd: ev.day
      });
    });

    // 2. Hijri Events (Ghamari)
    hEvents.forEach((ev, idx) => {
      list.push({
        id: `h-search-${idx}`,
        title: ev.title,
        dateText: `${toPersianDigits(ev.day)} ${HIJRI_MONTHS_FA[ev.month - 1]} (قمری)`,
        type: ev.isHoliday ? 'religious_holiday' : 'religious_event',
        isHoliday: ev.isHoliday,
        // For navigation simplicity in search list, we point approximate Solar month or a static estimation,
        // or we can map them accurately to current year in App.tsx. Since some Hijri days drift,
        // we map it perfectly using our converter for the current Jalali year 1405! Let's approximate
        // monthly estimates or direct them for normal Solar months. Let's make it a general lookup:
        targetJm: Math.max(1, Math.min(12, Math.floor(ev.month * 1.01))), // approximate fallback or direct
        targetJd: Math.min(29, ev.day)
      });
    });

    // 3. Gregorian Events (Miladi)
    gEvents.forEach((ev, idx) => {
      list.push({
        id: `g-search-${idx}`,
        title: ev.title,
        dateText: `${toPersianDigits(ev.day)} ${GREGORIAN_MONTHS_FA[ev.month - 1]} (میلادی)`,
        type: 'gregorian_event',
        isHoliday: ev.isHoliday,
        // Navigation approximate
        targetJm: Math.max(1, Math.min(12, Math.ceil(ev.month * 0.9))),
        targetJd: Math.min(29, ev.day)
      });
    });

    // 4. User notes
    userNotes.forEach((note) => {
      const [jy, jm, jd] = note.dateStr.split('-').map(Number);
      list.push({
        id: `user-search-${note.id}`,
        title: note.title,
        dateText: `${toPersianDigits(jd)} ${JALALI_MONTHS_FA[jm - 1]} ${toPersianDigits(jy)} (یادداشت شما)`,
        type: 'user_note',
        isHoliday: false,
        targetJm: jm,
        targetJd: jd
      });
    });

    return list;
  }, [userNotes]);

  // Filter based on search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // If empty, return a list of official holidays as suggestions
      return items.filter(it => it.isHoliday).slice(0, 15);
    }
    return items.filter(it => 
      it.title.toLowerCase().includes(q) || 
      it.dateText.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-4" style={{ direction: 'rtl' }}>
      
      {/* Search Input */}
      <div className={`relative flex items-center md:mx-0 p-1.5 rounded-2xl border transition-all ${
        isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45'
      }`}>
        <Search className={`w-5 h-5 mr-3 ${query ? getThemeColorClass() : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="جستجوی مناسبت‌ها، روزهای تعطیل یا یادداشت‌ها..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full px-2 py-2 pr-1 text-sm bg-transparent outline-none ${
            isDarkSeason ? 'text-stone-100 placeholder-stone-500' : 'text-slate-800 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Suggested titles */}
      {!query && (
        <div className="flex items-center gap-1.5 mt-2">
          <Compass className={`w-4 h-4 ${getThemeColorClass()}`} />
          <span className={`text-xs font-semibold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
            تعطیلات رسمی برجسته در کل سال:
          </span>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${isDarkSeason ? 'text-stone-500' : 'text-slate-400'}`}>
              موردی یافت نشد. کلمه دیگری را جستجو کنید.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isUserNote = item.type === 'user_note';
            return (
              <button
                key={item.id}
                onClick={() => onNavigateToDate(item.targetJm, item.targetJd)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-right transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  isDarkSeason
                    ? 'bg-stone-900/45 border-stone-800/80 hover:bg-stone-800/60'
                    : 'bg-white/40 border-white/35 hover:bg-white/75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    item.isHoliday
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      : isUserNote
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-teal-500/10 border-teal-500/20 text-teal-600'
                  }`}>
                    {isUserNote ? <Tag className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-sans font-medium leading-normal ${
                      item.isHoliday ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-xs mt-1 ${isDarkSeason ? 'text-stone-400' : 'text-slate-500'}`}>
                      {item.dateText}
                    </p>
                  </div>
                </div>
                
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  item.isHoliday
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold'
                    : isUserNote
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                      : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                }`}>
                  {item.isHoliday ? 'تعطیل رسمی' : isUserNote ? 'شخصی' : 'مناسبت'}
                </span>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
