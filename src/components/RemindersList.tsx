/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Bell, Cake, Briefcase, CheckCircle2, Bookmark, Trash2, ArrowLeft, Edit3 } from 'lucide-react';
import { CustomTheme, UserNote } from '../types';
import { JALALI_MONTHS_FA, toPersianDigits } from '../utils/dateConverter';

interface RemindersListProps {
  userNotes: UserNote[];
  currentTheme: CustomTheme;
  onEditNote: (note: UserNote) => void;
  onDeleteNote: (id: string) => void;
  onNavigateToDate: (jm: number, jd: number) => void;
}

const CATEGORY_MAP = {
  reminder: { label: 'یادآوری', icon: <Bell className="w-4 h-4" />, color: 'bg-blue-500/10 border-blue-500/20 text-blue-600' },
  birthday: { label: 'تولد', icon: <Cake className="w-4 h-4" />, color: 'bg-rose-500/10 border-rose-500/20 text-rose-500' },
  meeting: { label: 'جلسه کاری', icon: <Briefcase className="w-4 h-4" />, color: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
  anniversary: { label: 'سالگرد', icon: <Bookmark className="w-4 h-4" />, color: 'bg-purple-500/10 border-purple-500/20 text-purple-600' },
  todo: { label: 'کار روزانه', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' },
};

export default function RemindersList({
  userNotes,
  currentTheme,
  onEditNote,
  onDeleteNote,
  onNavigateToDate
}: RemindersListProps) {
  
  const isDarkSeason = currentTheme.season === 'autumn';

  const getThemeTextClass = () => {
    if (isDarkSeason) return 'text-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'text-emerald-600';
      case 'summer': return 'text-cyan-600';
      case 'winter': return 'text-sky-600';
    }
  };

  const getThemeBadgeClass = () => {
    if (isDarkSeason) return 'bg-[#fc2c54]/10 text-rose-400';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-500/10 text-emerald-800';
      case 'summer': return 'bg-cyan-500/10 text-cyan-900';
      case 'winter': return 'bg-sky-550/15 text-sky-900';
    }
  };

  // Sort user notes chronologically by date
  const sortedNotes = [...userNotes].sort((a, b) => {
    // Parse 'jy-jm-jd'
    const [ay, am, ad] = a.dateStr.split('-').map(Number);
    const [by, bm, bd] = b.dateStr.split('-').map(Number);
    if (ay !== by) return ay - by;
    if (am !== bm) return am - bm;
    return ad - bd;
  });

  const getReadableDate = (dateStr: string) => {
    const [jy, jm, jd] = dateStr.split('-').map(Number);
    return `${toPersianDigits(jd)} ${JALALI_MONTHS_FA[jm - 1]} ${toPersianDigits(jy)}`;
  };

  return (
    <div className="space-y-4" style={{ direction: 'rtl' }}>
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sans font-bold text-sm">لیست رویدادها و یادآوری‌های شخصی</h3>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getThemeBadgeClass()}`}>
          {toPersianDigits(userNotes.length)} مورد ثبت‌شده
        </span>
      </div>

      {sortedNotes.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center border-dashed ${
          isDarkSeason ? 'border-stone-800' : 'border-slate-200'
        }`}>
          <Bell className="w-8 h-8 mx-auto stroke-1 mb-2 text-slate-400" />
          <h4 className={`text-sm font-semibold mb-1 ${isDarkSeason ? 'text-stone-300' : 'text-slate-700'}`}>هیچ رویدادی ذخیره نشده است</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            با کلیک روی روزهای مختلف تقویم طلایی، تولدها، جلسه‌ها و کارهای خود را یادداشت کنید تا در این بخش فهرست شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {sortedNotes.map((note) => {
            const cat = CATEGORY_MAP[note.type] || CATEGORY_MAP.reminder;
            const [jy, jm, jd] = note.dateStr.split('-').map(Number);
            
            return (
              <div
                key={note.id}
                className={`flex flex-col p-4 rounded-xl border transition-all ${
                  isDarkSeason 
                    ? 'bg-stone-900/40 border-stone-800/80 hover:bg-stone-850/60' 
                    : 'bg-white/40 border-white/35 hover:bg-white/75'
                }`}
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${cat.color}`}>
                      {cat.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-sans font-bold leading-snug">{note.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                        <span className={`text-[10px] font-sans flex items-center gap-1 font-semibold ${
                          isDarkSeason ? 'text-stone-400' : 'text-slate-500'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {getReadableDate(note.dateStr)}
                        </span>
                        
                        {note.time && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                            isDarkSeason ? 'bg-stone-800 border-stone-750 text-amber-400' : 'bg-slate-50 border-slate-100 text-slate-600'
                          }`}>
                            ساعت {toPersianDigits(note.time)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onEditNote(note)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDarkSeason ? 'hover:bg-stone-800 text-stone-300' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                      title="ویرایش یادداشت"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('آیا از حذف این یادداشت اطمینان دارید؟')) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="حذف یادداشت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {note.description && (
                  <p className={`mt-2.5 pr-11 text-xs leading-relaxed border-t border-dashed pt-2 ${
                    isDarkSeason ? 'text-stone-400 border-stone-800' : 'text-slate-600 border-slate-100'
                  }`}>
                    {note.description}
                  </p>
                )}

                {/* Navigation jump */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => onNavigateToDate(jm, jd)}
                    className={`flex items-center gap-1 text-[10px] font-sans font-bold hover:underline cursor-pointer ${getThemeTextClass()}`}
                  >
                    نمایش روی تقویم
                    <ArrowLeft className="w-3 h-3 text-current transform rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
