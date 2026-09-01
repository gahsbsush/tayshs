/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Settings, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Clock3, 
  Sparkles, 
  Menu, 
  Info, 
  Check, 
  AlertCircle 
} from 'lucide-react';

import { UserNote, NoteType, CustomTheme } from './types';
import { 
  gregorianToJalali, 
  jalaliToGregorian, 
  gregorianToHijri,
  toPersianDigits, 
  JALALI_MONTHS_FA, 
  HIJRI_MONTHS_FA,
  getSeason,
  getSeasonNameFa,
  getWeekdayName
} from './utils/dateConverter';
import { getEventsForDay } from './data/events';
import { SEASONAL_THEMES } from './utils/themes';

// Primary Components
import CalendarGrid from './components/CalendarGrid';
import DailyDetails from './components/DailyDetails';
import NoteModal from './components/NoteModal';
import AdBanner from './components/AdBanner';

// Lazy-Loaded Heavy Components & Modals for reduced initial bundle size
const RemindersList = lazy(() => import('./components/RemindersList'));
const SearchPanel = lazy(() => import('./components/SearchPanel'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const WeeklyView = lazy(() => import('./components/WeeklyView'));
const DailyView = lazy(() => import('./components/DailyView'));
const HoroscopeModal = lazy(() => import('./components/HoroscopeModal'));

// Magical Bahar Narenj features
import DayProgress from './components/DayProgress';
import SeasonalNatureAudio from './components/SeasonalNatureAudio';
import DateConverterWidget from './components/DateConverterWidget';
import QuoteWisdom from './components/QuoteWisdom';
import EventCountdown from './components/EventCountdown';
const BirthdayCalculator = lazy(() => import('./components/BirthdayCalculator'));
const WidgetSimulator = lazy(() => import('./components/WidgetSimulator'));

export default function App() {
  // 1. Initial real-world date values
  const todayVal = useMemo(() => {
    const d = new Date();
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();
    const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
    // Find JS weekday index (0: Sunday, ..., 6: Saturday)
    const jsDay = d.getDay();
    // Convert to target weekday (0: Saturday, ..., 6: Friday)
    const dayOfWeek = (jsDay + 1) % 7;
    const [hy, hm, hd] = gregorianToHijri(gy, gm, gd, 0);
    return { jy, jm, jd, gy, gm, gd, hy, hm, hd, dayOfWeek };
  }, []);

  // 2. Main Calendar selection states
  const [currentJy, setCurrentJy] = useState<number>(todayVal.jy);
  const [currentJm, setCurrentJm] = useState<number>(todayVal.jm);
  
  const [selectedJy, setSelectedJy] = useState<number>(todayVal.jy);
  const [selectedJm, setSelectedJm] = useState<number>(todayVal.jm);
  const [selectedJd, setSelectedJd] = useState<number>(todayVal.jd);

  // 3. User configuration states (persisted inside LocalStorage)
  const [lunarOffset, setLunarOffset] = useState<number>(() => {
    const s = localStorage.getItem('calendar_lunar_offset');
    return s ? Number(s) : 0;
  });
  
  const [selectedThemeId, setSelectedThemeId] = useState<'auto' | 'spring' | 'summer' | 'autumn' | 'winter'>(() => {
    const s = localStorage.getItem('calendar_theme_id');
    return s ? (s as any) : 'auto';
  });

  const [voiceAlerts, setVoiceAlerts] = useState<boolean>(() => {
    const s = localStorage.getItem('calendar_voice_alerts');
    return s !== 'false'; // default to true
  });

  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>(() => {
    const s = localStorage.getItem('calendar_font_scale');
    return (s as any) || 'md';
  });

  const [userNotes, setUserNotes] = useState<UserNote[]>(() => {
    const s = localStorage.getItem('calendar_glass_notes');
    return s ? JSON.parse(s) : [];
  });

  // 4. UI presentation states
  const [currentTab, setCurrentTab] = useState<'calendar' | 'reminders' | 'search' | 'settings'>('calendar');
  const [calendarViewMode, setCalendarViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [presetModalTime, setPresetModalTime] = useState<string | undefined>(undefined);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [horoscopeModalOpen, setHoroscopeModalOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);

  // 5. Watch & alert simulation
  const [timeStr, setTimeStr] = useState('');
  const [activeVoiceNotify, setActiveVoiceNotify] = useState<string | null>(null);

  // Sync settings helper
  useEffect(() => {
    localStorage.setItem('calendar_lunar_offset', String(lunarOffset));
  }, [lunarOffset]);

  useEffect(() => {
    localStorage.setItem('calendar_theme_id', selectedThemeId);
  }, [selectedThemeId]);

  useEffect(() => {
    localStorage.setItem('calendar_voice_alerts', String(voiceAlerts));
  }, [voiceAlerts]);

  useEffect(() => {
    localStorage.setItem('calendar_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem('calendar_glass_notes', JSON.stringify(userNotes));
  }, [userNotes]);

  // Clock ticks (HH:mm:ss in Farsi digits)
  useEffect(() => {
    const refreshClock = () => {
      const d = new Date();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      
      setTimeStr(`${hrs}:${mins}:${secs}`);

      // Optional Simulated alarm notifier: if clock minutes and hrs matches a user note today
      if (voiceAlerts && secs === '00') {
        const checkDateK = `${todayVal.jy}-${todayVal.jm}-${todayVal.jd}`;
        const matchNote = userNotes.find(n => n.dateStr === checkDateK && n.time === `${hrs}:${mins}`);
        if (matchNote) {
          setActiveVoiceNotify(`${matchNote.title} (${toPersianDigits(matchNote.time || '')})`);
          setTimeout(() => setActiveVoiceNotify(null), 8000);
        }
      }
    };
    
    refreshClock();
    const interval = setInterval(refreshClock, 1000);
    return () => clearInterval(interval);
  }, [userNotes, voiceAlerts, todayVal]);

  // Calculate current season theme
  const currentTheme = useMemo(() => {
    const season = selectedThemeId === 'auto' ? getSeason(currentJm) : selectedThemeId;
    return SEASONAL_THEMES[season];
  }, [selectedThemeId, currentJm]);

  // Convert selected day to alternative dates on-the-fly for details display
  const selectedDayDetails = useMemo(() => {
    const [gy, gm, gd] = jalaliToGregorian(selectedJy, selectedJm, selectedJd);
    const [hy, hm, hd] = gregorianToHijri(gy, gm, gd, lunarOffset);
    const dayOfWeek = ( (new Date(gy, gm - 1, gd)).getDay() + 1 ) % 7;
    const events = getEventsForDay(selectedJm, selectedJd, gm, gd, hm, hd);
    const notesList = userNotes.filter(note => note.dateStr === `${selectedJy}-${selectedJm}-${selectedJd}`);

    return { gy, gm, gd, hy, hm, hd, dayOfWeek, events, notesList };
  }, [selectedJy, selectedJm, selectedJd, userNotes, lunarOffset]);

  // Switch months handler
  const handlePrevMonth = () => {
    if (currentJm === 1) {
      setCurrentJm(12);
      setCurrentJy(prev => prev - 1);
    } else {
      setCurrentJm(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentJm === 12) {
      setCurrentJm(1);
      setCurrentJy(prev => prev + 1);
    } else {
      setCurrentJm(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentJy(todayVal.jy);
    setCurrentJm(todayVal.jm);
    setSelectedJy(todayVal.jy);
    setSelectedJm(todayVal.jm);
    setSelectedJd(todayVal.jd);
    setCurrentTab('calendar');
  };

  // Navigates directly to any date
  const handleNavigateToDate = (jm: number, jd: number) => {
    setCurrentJm(jm);
    setSelectedJm(jm);
    setSelectedJd(jd);
    setSelectedJy(currentJy); // keep the active year
    setCurrentTab('calendar');
  };

  // Note management operations
  const handleSaveNote = (newNoteData: Omit<UserNote, 'id'> & { id?: string }) => {
    if (newNoteData.id) {
      // Editing
      setUserNotes(prev => prev.map(n => n.id === newNoteData.id ? { ...n, ...newNoteData } as UserNote : n));
    } else {
      // Creating
      const created: UserNote = {
        ...newNoteData,
        id: 'note_' + Date.now(),
      };
      setUserNotes(prev => [...prev, created]);
    }
    setNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setUserNotes(prev => prev.filter(n => n.id !== id));
    setNoteModalOpen(false);
    setEditingNote(null);
  };

  // Database Backup Actions
  const handleClearNotes = () => {
    setUserNotes([]);
  };

  const handleExportNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userNotes, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `calendar_backup_${currentJy}.json`);
    dlAnchorElem.click();
  };

  const handleImportNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setUserNotes(parsed);
            alert('اطلاعات پشتیبان با موفقیت بازخوانی شدند!');
          } else {
            alert('فایل پشتیبان نامعتبر است.');
          }
        } catch (ex) {
          alert('خطایی در خواندن فایل رخ داد.');
        }
      };
    }
  };

  // Active season icon mapping
  const renderSeasonIcon = () => {
    const season = getSeason(currentJm);
    switch (season) {
      case 'spring': return <span className="text-xl animate-bounce">🌸</span>;
      case 'summer': return <span className="text-xl animate-spin text-amber-500 duration-1000">☀️</span>;
      case 'autumn': return <span className="text-xl animate-pulse">🍂</span>;
      case 'winter': return <span className="text-xl animate-pulse">❄️</span>;
    }
  };

  const isDarkSeason = currentTheme.season === 'autumn';

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col items-center justify-center p-0 sm:pt-10 sm:pb-20 sm:px-3 sm:p-5 transition-all duration-700 ${currentTheme.bgGradient}`} style={{ direction: 'rtl' }}>
      
      {/* 1. Background Blur Nodes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse pointer-events-none hidden sm:block" />

      {/* 2. Audio Alert Simulation Banner */}
      {activeVoiceNotify && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-600/90 backdrop-blur text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce" style={{ direction: 'rtl' }}>
          <Bell className="w-5 h-5 shrink-0 animate-swing" />
          <div className="flex-1 text-right">
            <h4 className="font-sans font-bold text-xs">🔔 هشدار صوتی هوشمند تقویم مناسبتی</h4>
            <p className="text-[11px] mt-0.5 opacity-90 font-mono">موعد رویداد فرارسید: {toPersianDigits(activeVoiceNotify)}</p>
          </div>
          <button onClick={() => setActiveVoiceNotify(null)} className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg">
            فهمیدم
          </button>
        </div>
      )}

      {/* 3. Main Glassmorphic container - Edge-to-edge full screen on mobile, styled phone frame on desktop */}
      <div 
        className={`relative w-full max-w-full sm:max-w-sm h-[100dvh] sm:h-[880px] max-h-[100dvh] sm:max-h-none rounded-none sm:rounded-3xl overflow-hidden flex flex-col shadow-none sm:shadow-2xl transition-all duration-500 hover:shadow-2xl/40 ${currentTheme.cardBg} ${currentTheme.shadowColor} ${currentTheme.primaryText} ${
          fontScale === 'sm' ? 'scale-sm' : fontScale === 'lg' ? 'scale-lg' : 'scale-md'
        }`}
        id="calendar-mobile-shell"
      >
        {/* Header - Glass banner */}
        <div className={`p-4 pb-3 flex flex-col gap-2.5 border-b shrink-0 z-10 transition-all duration-300 ${currentTheme.cardBorder} ${
          isDarkSeason 
            ? 'bg-[#1b0d21]/96 backdrop-blur-xl shadow-lg shadow-black/30' 
            : 'bg-white/96 backdrop-blur-xl shadow-md shadow-slate-200/40'
        }`}>
          {/* Top Line: App title, season badge, live clock */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 p-1 bg-white/20 dark:bg-black/10 rounded-full px-3">
              {renderSeasonIcon()}
              <span className="font-sans font-extrabold text-xs tracking-tight">
                رویدادنگار بهارنارنج ({getSeasonNameFa(getSeason(currentJm))})
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-md">
              <Clock3 className="w-3.5 h-3.5" />
              <span>{toPersianDigits(timeStr)}</span>
            </div>
          </div>

          {/* Row 2: Navigation controls */}
          <div className="flex items-center justify-between w-full mt-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            {/* Prev month */}
            <button 
              onClick={handlePrevMonth}
              className="p-1 px-1.5 rounded-lg hover:bg-white/30 cursor-pointer text-inherit"
              title="ماه قبل"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Display Year & Month picker */}
            <div className="flex items-center gap-1">
              <select
                value={currentJm}
                onChange={(e) => setCurrentJm(Number(e.target.value))}
                className="bg-transparent text-sm font-sans font-bold text-center outline-none cursor-pointer border-none py-0.5"
              >
                {JALALI_MONTHS_FA.map((m, idx) => (
                  <option key={m} value={idx + 1} className="text-black">
                    {m}
                  </option>
                ))}
              </select>

              <span className="opacity-55">|</span>

              <select
                value={currentJy}
                onChange={(e) => setCurrentJy(Number(e.target.value))}
                className="bg-transparent text-sm font-sans font-black text-center outline-none cursor-pointer border-none py-0.5"
              >
                {Array.from({ length: 31 }, (_, i) => 1390 + i).map((y) => (
                  <option key={y} value={y} className="text-black">
                    {toPersianDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            {/* Next month */}
            <button 
              onClick={handleNextMonth}
              className="p-1 px-1.5 rounded-lg hover:bg-white/30 cursor-pointer text-inherit"
              title="ماه بعد"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Today and Horoscope Buttons */}
          <div className="flex items-center justify-between mt-1 text-[11px] px-0.5">
            <span className="opacity-75 font-sans">
              امروز: {toPersianDigits(todayVal.jd)} {JALALI_MONTHS_FA[todayVal.jm - 1]} {toPersianDigits(todayVal.jy)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHoroscopeModalOpen(true)}
                className="font-sans font-black px-2.5 py-0.5 rounded-md hover:opacity-90 active:scale-95 transition-all text-[10px] cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-650 to-pink-600 text-white shadow shadow-purple-500/25 flex items-center gap-1.5 animate-pulse"
                title="فال روزانه متولدین ماه‌ها"
              >
                <span>فال روزانه 🔮</span>
              </button>

              <button
                onClick={handleGoToToday}
                className={`font-sans font-black px-2.5 py-0.5 rounded-md hover:opacity-90 active:scale-95 transition-all text-[10px] cursor-pointer text-white ${currentTheme.accentColor}`}
              >
                امروز
              </button>
            </div>
          </div>
        </div>

        {/* 4. Tab Body Content Panel */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 pb-28 space-y-4">
          
          {/* Dynamic Online Advertisement Slot */}
          <AdBanner currentTheme={currentTheme} />
          
          {currentTab === 'calendar' && (
            <div className="space-y-4 animate-fade-in">
              {/* Modern Segmented Control for Views */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-black/10 dark:bg-black/25 rounded-2xl border border-white/5 shadow-inner">
                <button
                  onClick={() => setCalendarViewMode('monthly')}
                  className={`py-2 text-xs font-sans font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer ${
                    calendarViewMode === 'monthly'
                      ? `${currentTheme.accentColor} text-white shadow-md font-black`
                      : 'text-inherit opacity-75 hover:bg-white/10 hover:opacity-100'
                  }`}
                >
                  ماهانه
                </button>
                <button
                  onClick={() => setCalendarViewMode('weekly')}
                  className={`py-2 text-xs font-sans font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer ${
                    calendarViewMode === 'weekly'
                      ? `${currentTheme.accentColor} text-white shadow-md font-black`
                      : 'text-inherit opacity-75 hover:bg-white/10 hover:opacity-100'
                  }`}
                >
                  هفتگی
                </button>
                <button
                  onClick={() => setCalendarViewMode('daily')}
                  className={`py-2 text-xs font-sans font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer ${
                    calendarViewMode === 'daily'
                      ? `${currentTheme.accentColor} text-white shadow-md font-black`
                      : 'text-inherit opacity-75 hover:bg-white/10 hover:opacity-100'
                  }`}
                >
                  روزانه
                </button>
              </div>

              {calendarViewMode === 'monthly' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Calendar Days Board Grid */}
                  <CalendarGrid
                    currentJy={currentJy}
                    currentJm={currentJm}
                    selectedJy={selectedJy}
                    selectedJm={selectedJm}
                    selectedJd={selectedJd}
                    onSelectDay={(jy, jm, jd) => {
                      setSelectedJy(jy);
                      setSelectedJm(jm);
                      setSelectedJd(jd);
                      // Make sure current active matches scroll
                      setCurrentJy(jy);
                      setCurrentJm(jm);
                    }}
                    userNotes={userNotes}
                    lunarOffset={lunarOffset}
                    currentTheme={currentTheme}
                    todayJy={todayVal.jy}
                    todayJm={todayVal.jm}
                    todayJd={todayVal.jd}
                  />

                  {/* Dynamic Daily selected Details */}
                  <DailyDetails
                    jy={selectedJy}
                    jm={selectedJm}
                    jd={selectedJd}
                    gy={selectedDayDetails.gy}
                    gm={selectedDayDetails.gm}
                    gd={selectedDayDetails.gd}
                    hy={selectedDayDetails.hy}
                    hm={selectedDayDetails.hm}
                    hd={selectedDayDetails.hd}
                    dayOfWeek={selectedDayDetails.dayOfWeek}
                    events={selectedDayDetails.events}
                    notes={selectedDayDetails.notesList}
                    onAddNote={() => {
                      setEditingNote(null);
                      setNoteModalOpen(true);
                    }}
                    onEditNote={(note) => {
                      setEditingNote(note);
                      setNoteModalOpen(true);
                    }}
                    currentTheme={currentTheme}
                  />

                  {/* Collapsible magical Bahar Narenj Hub */}
                  <div className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                    isDarkSeason
                      ? 'bg-stone-900/40 border-stone-850/60'
                      : 'bg-white/40 border-white/20 shadow-sm'
                  }`}>
                    {/* Trigger Bar */}
                    <button
                      onClick={() => setToolsExpanded(!toolsExpanded)}
                      className="w-full p-4 flex items-center justify-between font-sans font-black text-xs sm:text-sm cursor-pointer select-none outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg animate-pulse">🍊</span>
                        <div className="text-right">
                          <span>پیشخان هوشمند و ابزارهای بهارنارنج</span>
                          <span className="text-[9px] opacity-65 block font-normal mt-0.5">شامل ملودی فصول، تفأل حافظ، مبدل تاریخ و پیشرفت روز</span>
                        </div>
                      </div>
                      <span className="text-base text-inherit opacity-70 transition-transform duration-300 transform" style={{ transform: toolsExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        {toolsExpanded ? '▼' : '◀'}
                      </span>
                    </button>

                    {/* Exanded Body Content */}
                    {toolsExpanded && (
                      <div className="p-4 pt-1 border-t border-dashed border-black/5 dark:border-white/5 space-y-4 animate-fade-in max-h-[500px] overflow-y-auto">
                        
                        {/* 1. Day Progress Meter */}
                        <DayProgress 
                          currentTheme={currentTheme} 
                          gy={selectedDayDetails.gy} 
                          gm={selectedDayDetails.gm} 
                          gd={selectedDayDetails.gd} 
                        />

                        {/* 2. Holiday Countdown */}
                        <EventCountdown 
                          currentTheme={currentTheme} 
                          jy={selectedJy} 
                          jm={selectedJm} 
                          jd={selectedJd} 
                        />

                        {/* 3. Seasonal Soundscape Synthesizer */}
                        <SeasonalNatureAudio 
                          currentTheme={currentTheme} 
                          season={getSeason(currentJm)} 
                        />

                        {/* 4. Divine Hafez Divan (Tafaol) */}
                        <QuoteWisdom currentTheme={currentTheme} />

                        {/* 5. Custom Interactive Widget Simulator */}
                        <Suspense fallback={<div className="p-4 text-center text-xs opacity-50">در حال بارگذاری شبیه‌ساز...</div>}>
                          <WidgetSimulator
                            currentTheme={currentTheme}
                            jy={selectedJy}
                            jm={selectedJm}
                            jd={selectedJd}
                            gy={selectedDayDetails.gy}
                            gm={selectedDayDetails.gm}
                            gd={selectedDayDetails.gd}
                            dayOfWeek={selectedDayDetails.dayOfWeek}
                            hijriText={`${toPersianDigits(selectedDayDetails.hd)} ${HIJRI_MONTHS_FA[selectedDayDetails.hm - 1]} ${toPersianDigits(selectedDayDetails.hy)} (قمری)`}
                          />
                        </Suspense>

                        {/* 6. Date Converter */}
                        <DateConverterWidget 
                          currentTheme={currentTheme} 
                          onNavigateToDate={handleNavigateToDate} 
                        />

                        {/* 7. Lifespan & Zodiac Calculator */}
                        <div className="border-t border-dashed border-black/5 dark:border-white/5 pt-4">
                          <span className="text-[10px] font-bold opacity-60 block text-right mb-2">💫 ماشین‌حساب طالع‌بینی زیستی و سن شما:</span>
                          <Suspense fallback={<div className="p-4 text-center text-xs opacity-50">در حال بارگذاری ماشین‌حساب...</div>}>
                            <BirthdayCalculator 
                              currentTheme={currentTheme} 
                              lunarOffset={lunarOffset} 
                            />
                          </Suspense>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {calendarViewMode === 'weekly' && (
                <div className="animate-fade-in">
                  <Suspense fallback={<div className="p-8 text-center text-xs opacity-50">در حال بارگذاری نمای هفتگی...</div>}>
                    <WeeklyView
                      selectedJy={selectedJy}
                      selectedJm={selectedJm}
                      selectedJd={selectedJd}
                      onSelectDay={(jy, jm, jd) => {
                        setSelectedJy(jy);
                        setSelectedJm(jm);
                        setSelectedJd(jd);
                        setCurrentJy(jy);
                        setCurrentJm(jm);
                      }}
                      userNotes={userNotes}
                      lunarOffset={lunarOffset}
                      currentTheme={currentTheme}
                      todayJy={todayVal.jy}
                      todayJm={todayVal.jm}
                      todayJd={todayVal.jd}
                      onAddNote={() => {
                        setEditingNote(null);
                        setNoteModalOpen(true);
                      }}
                      onEditNote={(note) => {
                        setEditingNote(note);
                        setNoteModalOpen(true);
                      }}
                    />
                  </Suspense>
                </div>
              )}

              {calendarViewMode === 'daily' && (
                <div className="animate-fade-in">
                  <Suspense fallback={<div className="p-8 text-center text-xs opacity-50">در حال بارگذاری نمای روزانه...</div>}>
                    <DailyView
                      selectedJy={selectedJy}
                      selectedJm={selectedJm}
                      selectedJd={selectedJd}
                      onSelectDay={(jy, jm, jd) => {
                        setSelectedJy(jy);
                        setSelectedJm(jm);
                        setSelectedJd(jd);
                        setCurrentJy(jy);
                        setCurrentJm(jm);
                      }}
                      userNotes={userNotes}
                      lunarOffset={lunarOffset}
                      currentTheme={currentTheme}
                      todayJy={todayVal.jy}
                      todayJm={todayVal.jm}
                      todayJd={todayVal.jd}
                      onAddNote={(time) => {
                        setEditingNote(null);
                        setPresetModalTime(time);
                        setNoteModalOpen(true);
                      }}
                      onEditNote={(note) => {
                        setEditingNote(note);
                        setNoteModalOpen(true);
                      }}
                    />
                  </Suspense>
                </div>
              )}

            </div>
          )}

          {currentTab === 'reminders' && (
            <div className="animate-fade-in">
              <Suspense fallback={<div className="p-8 text-center text-xs opacity-50">در حال بارگذاری یادآوری‌ها...</div>}>
                <RemindersList
                  userNotes={userNotes}
                  currentTheme={currentTheme}
                  onEditNote={(note) => {
                    setEditingNote(note);
                    setNoteModalOpen(true);
                  }}
                  onDeleteNote={handleDeleteNote}
                  onNavigateToDate={handleNavigateToDate}
                />
              </Suspense>
            </div>
          )}

          {currentTab === 'search' && (
            <div className="animate-fade-in">
              <Suspense fallback={<div className="p-8 text-center text-xs opacity-50">در حال بارگذاری جستجو...</div>}>
                <SearchPanel
                  userNotes={userNotes}
                  currentTheme={currentTheme}
                  onNavigateToDate={handleNavigateToDate}
                  lunarOffset={lunarOffset}
                />
              </Suspense>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="animate-fade-in">
              <Suspense fallback={<div className="p-8 text-center text-xs opacity-50">در حال بارگذاری تنظیمات...</div>}>
                <SettingsPanel
                  lunarOffset={lunarOffset}
                  setLunarOffset={setLunarOffset}
                  fontScale={fontScale}
                  setFontScale={setFontScale}
                  selectedThemeId={selectedThemeId}
                  setSelectedThemeId={setSelectedThemeId}
                  voiceAlerts={voiceAlerts}
                  setVoiceAlerts={setVoiceAlerts}
                  onClearNotes={handleClearNotes}
                  onExportNotes={handleExportNotes}
                  onImportNotes={handleImportNotes}
                  currentTheme={currentTheme}
                />
              </Suspense>
            </div>
          )}

        </div>

        {/* 5. Floating Isolated Glassmorphic Tab Bar - Compact & Slim Curvy Dock */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex shrink-0 select-none pointer-events-auto">
          <div className={`w-full h-13 rounded-[20px] px-2 flex items-center justify-around shadow-lg backdrop-blur-xl transition-all duration-300 border relative ${
            isDarkSeason 
              ? 'bg-[#1a0f26]/90 border-purple-500/30 shadow-purple-950/50' 
              : 'bg-gradient-to-r from-[#e0f2fe]/95 via-[#eef2ff]/95 to-[#f3e8ff]/95 border-indigo-200/80 shadow-indigo-900/10'
          }`}>
            {/* Tab Calendar */}
            <button
              onClick={() => setCurrentTab('calendar')}
              className={`flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer w-12 ${
                currentTab === 'calendar'
                  ? `h-12 w-12 rounded-full -translate-y-3.5 shadow-md border-[3px] relative z-20 ${
                      isDarkSeason ? 'border-[#24172a]' : 'border-[#e0f2fe]'
                    } ${
                      isDarkSeason
                        ? 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-[#fc2c54]/30'
                        : currentTheme.season === 'spring'
                          ? 'bg-[#0d5236] text-white shadow-emerald-800/30'
                          : currentTheme.season === 'summer'
                            ? 'bg-[#0e5c6a] text-white shadow-cyan-800/30'
                            : 'bg-[#1e6091] text-white shadow-sky-800/30'
                    }`
                  : `h-10 ${
                      isDarkSeason
                        ? 'text-purple-300/70 hover:text-white'
                        : 'text-slate-600 hover:text-indigo-700'
                    }`
              }`}
            >
              <CalendarIcon className={`${currentTab === 'calendar' ? 'w-4.5 h-4.5 stroke-[2.2]' : 'w-4.5 h-4.5 opacity-85 stroke-[1.8]'} transition-all`} />
              {currentTab !== 'calendar' && (
                <span className="text-[9px] font-sans font-bold mt-0.5">تقویم</span>
              )}
            </button>

            {/* Tab Reminders */}
            <button
              onClick={() => setCurrentTab('reminders')}
              className={`flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer w-12 ${
                currentTab === 'reminders'
                  ? `h-12 w-12 rounded-full -translate-y-3.5 shadow-md border-[3px] relative z-20 ${
                      isDarkSeason ? 'border-[#24172a]' : 'border-[#eef2ff]'
                    } ${
                      isDarkSeason
                        ? 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-[#fc2c54]/30'
                        : currentTheme.season === 'spring'
                          ? 'bg-[#0d5236] text-white shadow-emerald-800/30'
                          : currentTheme.season === 'summer'
                            ? 'bg-[#0e5c6a] text-white shadow-cyan-800/30'
                            : 'bg-[#1e6091] text-white shadow-sky-800/30'
                    }`
                  : `h-10 ${
                      isDarkSeason
                        ? 'text-purple-300/70 hover:text-white'
                        : 'text-slate-600 hover:text-indigo-700'
                    }`
              }`}
            >
              <Bell className={`${currentTab === 'reminders' ? 'w-4.5 h-4.5 stroke-[2.2]' : 'w-4.5 h-4.5 opacity-85 stroke-[1.8]'} transition-all`} />
              {currentTab !== 'reminders' && (
                <span className="text-[9px] font-sans font-bold mt-0.5">برنامه‌ها</span>
              )}
            </button>

            {/* Tab Search */}
            <button
              onClick={() => setCurrentTab('search')}
              className={`flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer w-12 ${
                currentTab === 'search'
                  ? `h-12 w-12 rounded-full -translate-y-3.5 shadow-md border-[3px] relative z-20 ${
                      isDarkSeason ? 'border-[#24172a]' : 'border-[#eef2ff]'
                    } ${
                      isDarkSeason
                        ? 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-[#fc2c54]/30'
                        : currentTheme.season === 'spring'
                          ? 'bg-[#0d5236] text-white shadow-emerald-800/30'
                          : currentTheme.season === 'summer'
                            ? 'bg-[#0e5c6a] text-white shadow-cyan-800/30'
                            : 'bg-[#1e6091] text-white shadow-sky-800/30'
                    }`
                  : `h-10 ${
                      isDarkSeason
                        ? 'text-purple-300/70 hover:text-white'
                        : 'text-slate-600 hover:text-indigo-700'
                    }`
              }`}
            >
              <Search className={`${currentTab === 'search' ? 'w-4.5 h-4.5 stroke-[2.2]' : 'w-4.5 h-4.5 opacity-85 stroke-[1.8]'} transition-all`} />
              {currentTab !== 'search' && (
                <span className="text-[9px] font-sans font-bold mt-0.5">مناسبت‌ها</span>
              )}
            </button>

            {/* Tab Settings */}
            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer w-12 ${
                currentTab === 'settings'
                  ? `h-12 w-12 rounded-full -translate-y-3.5 shadow-md border-[3px] relative z-20 ${
                      isDarkSeason ? 'border-[#24172a]' : 'border-[#f3e8ff]'
                    } ${
                      isDarkSeason
                        ? 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-[#fc2c54]/30'
                        : currentTheme.season === 'spring'
                          ? 'bg-[#0d5236] text-white shadow-emerald-800/30'
                          : currentTheme.season === 'summer'
                            ? 'bg-[#0e5c6a] text-white shadow-cyan-800/30'
                            : 'bg-[#1e6091] text-white shadow-sky-800/30'
                    }`
                  : `h-10 ${
                      isDarkSeason
                        ? 'text-purple-300/70 hover:text-white'
                        : 'text-slate-600 hover:text-indigo-700'
                    }`
              }`}
            >
              <Settings className={`${currentTab === 'settings' ? 'w-4.5 h-4.5 stroke-[2.2]' : 'w-4.5 h-4.5 opacity-85 stroke-[1.8]'} transition-all`} />
              {currentTab !== 'settings' && (
                <span className="text-[9px] font-sans font-bold mt-0.5">تنظیمات</span>
              )}
            </button>
          </div>
        </div>

        {/* 6. Creative credit line */}
        <div className="absolute top-[8px] right-[10px] text-[7px] select-none pointer-events-none opacity-20">
          behar narenj v1.3
        </div>

      </div>

      {/* 4. Note Modal (Popup component) */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setEditingNote(null);
          setPresetModalTime(undefined);
        }}
        selectedDateStr={`${selectedJy}-${selectedJm}-${selectedJd}`}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        editingNote={editingNote}
        season={getSeason(currentJm)}
        defaultTime={presetModalTime}
      />

      {/* 5. Horoscope Modal (Popup component) */}
      {horoscopeModalOpen && (
        <Suspense fallback={null}>
          <HoroscopeModal
            isOpen={horoscopeModalOpen}
            onClose={() => setHoroscopeModalOpen(false)}
            currentTheme={currentTheme}
          />
        </Suspense>
      )}

    </div>
  );
}
