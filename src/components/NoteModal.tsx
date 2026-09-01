/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, Cake, Briefcase, CheckCircle2, Bookmark, Trash2 } from 'lucide-react';
import { NoteType, UserNote } from '../types';
import { toPersianDigits, JALALI_MONTHS_FA } from '../utils/dateConverter';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateStr: string; // "jy-jm-jd"
  onSave: (note: Omit<UserNote, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  editingNote?: UserNote | null;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  defaultTime?: string;
}

const CATEGORIES: { value: NoteType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'reminder', label: 'یادآوری عمومی', icon: <Bell className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  { value: 'birthday', label: 'تولد', icon: <Cake className="w-4 h-4" />, color: 'bg-rose-500/20 text-rose-600 border-rose-500/30' },
  { value: 'meeting', label: 'جلسه کاری', icon: <Briefcase className="w-4 h-4" />, color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  { value: 'anniversary', label: 'سالگرد', icon: <Bookmark className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
  { value: 'todo', label: 'کار روزانه', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
];

export default function NoteModal({
  isOpen,
  onClose,
  selectedDateStr,
  onSave,
  onDelete,
  editingNote,
  season,
  defaultTime
}: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<NoteType>('reminder');
  const [reminderBefore, setReminderBefore] = useState<number>(0);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setDescription(editingNote.description);
      setTime(editingNote.time || '09:00');
      setType(editingNote.type);
      setReminderBefore(editingNote.reminderMinutesBefore || 0);
    } else {
      setTitle('');
      setDescription('');
      setTime(defaultTime || '09:00');
      setType('reminder');
      setReminderBefore(0);
    }
  }, [editingNote, selectedDateStr, isOpen, defaultTime]);

  if (!isOpen) return null;

  // Format Persian date for head
  const [jy, jm, jd] = selectedDateStr.split('-').map(Number);
  const formattedDate = `${toPersianDigits(jd)} ${JALALI_MONTHS_FA[jm - 1]} ${toPersianDigits(jy)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: editingNote?.id,
      title: title.trim(),
      description: description.trim(),
      time,
      type,
      dateStr: selectedDateStr,
      reminderMinutesBefore: reminderBefore,
    });
    onClose();
  };

  const isDarkSeason = season === 'autumn';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className={`w-full sm:max-w-md h-[85dvh] sm:h-auto max-h-[90dvh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isDarkSeason 
            ? 'bg-stone-900/95 text-stone-100 border border-stone-800' 
            : 'bg-white/95 text-slate-800 border border-white/20'
        }`}
        id="note-modal-container"
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${isDarkSeason ? 'border-stone-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <Calendar className={`w-5 h-5 ${isDarkSeason ? 'text-amber-500' : 'text-teal-600'}`} />
            <div>
              <h3 className="font-sans font-bold text-lg">
                {editingNote ? 'ویرایش یادداشت / یادآوری' : 'یادداشت جدید'}
              </h3>
              <p className={`text-xs ${isDarkSeason ? 'text-stone-400' : 'text-slate-500'}`}>
                برای تاریخ {formattedDate}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkSeason ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-slate-150 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Title */}
          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
              عنوان یادداشت <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثلاً: تولد مریم، جلسه شرکت، خرید نان..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl outline-none border transition-all text-sm ${
                isDarkSeason 
                  ? 'bg-stone-850 border-stone-700 text-stone-100 focus:border-amber-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Category SELECTOR */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
              دسته‌بندی (نوع رویداد)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = type === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setType(cat.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      isSelected
                        ? isDarkSeason
                          ? 'bg-stone-800 border-amber-500 font-bold'
                          : 'bg-emerald-50 border-teal-500 font-bold'
                        : isDarkSeason
                          ? 'bg-stone-850/50 border-stone-800 hover:border-stone-750'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg border ${cat.color.split(' ')[0]} ${cat.color.split(' ')[2]}`}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time and Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
                <Clock className="w-3.5 h-3.5 inline ml-1 align-text-bottom" />
                ساعت رویداد
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl outline-none border text-center text-sm ${
                  isDarkSeason 
                    ? 'bg-stone-850 border-stone-700 text-stone-100 focus:border-amber-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
                بازه یادآوری
              </label>
              <select
                value={reminderBefore}
                onChange={(e) => setReminderBefore(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl outline-none border text-sm text-right ${
                  isDarkSeason 
                    ? 'bg-stone-850 border-stone-700 text-stone-100 focus:border-amber-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                }`}
              >
                <option value={0}>سر موقع مقرر</option>
                <option value={15}>۱۵ دقیقه قبل</option>
                <option value={30}>۳۰ دقیقه قبل</option>
                <option value={60}>۱ ساعت قبل</option>
                <option value={1440}>۱ روز قبل</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 overflow-hidden">
            <label className={`text-xs font-semibold ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
              توضیحات بیشتر (اختیاری)
            </label>
            <textarea
              rows={3}
              placeholder="نوشتن جزییات، آدرس، پیگیری‌ها و یادداشت‌های اضافه..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl outline-none border transition-all text-sm resize-none ${
                isDarkSeason 
                  ? 'bg-stone-850 border-stone-700 text-stone-100 focus:border-amber-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-center text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                isDarkSeason
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/20'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/10'
              }`}
            >
              ذخیره تغییرات
            </button>

            {editingNote && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('آیا از حذف این یادداشت اطمینان دارید؟')) {
                    onDelete(editingNote.id);
                    onClose();
                  }
                }}
                className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center border transition-all active:scale-[0.98] cursor-pointer ${
                  isDarkSeason
                    ? 'border-red-900/50 hover:bg-red-950/30 text-rose-400'
                    : 'border-red-100 hover:bg-red-50 text-red-500'
                }`}
                title="حذف یادداشت"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
