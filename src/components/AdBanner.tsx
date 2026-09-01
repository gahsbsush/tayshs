/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Megaphone, ExternalLink, Sparkles, AlertCircle, ArrowLeft, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import { CustomTheme } from '../types';
import { subscribeToAds, Ad, DEFAULT_ADS } from '../lib/firebaseService';
import { toPersianDigits } from '../utils/dateConverter';
import AdRequestModal from './AdRequestModal';

interface AdBannerProps {
  currentTheme: CustomTheme;
}

export default function AdBanner({ currentTheme }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>(DEFAULT_ADS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const isDarkSeason = currentTheme.season === 'autumn';

  // Real-time listener for the active ads
  useEffect(() => {
    const unsubscribe = subscribeToAds((liveAds) => {
      // Filter out any ad that has gone past its expiration time
      const activeOnly = liveAds.filter(ad => {
        if (!ad.expiresAt) return true;
        try {
          const expTime = new Date(ad.expiresAt).getTime();
          return expTime > Date.now();
        } catch (err) {
          return true;
        }
      });
      setAds(activeOnly.length > 0 ? activeOnly : DEFAULT_ADS);
    });
    return () => unsubscribe();
  }, []);

  // Set interval to rotate ads automatically every 12 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [ads]);

  if (ads.length === 0) return null;

  const activeAd = ads[currentIndex] || ads[0];

  const getThemeTextClass = () => {
    if (isDarkSeason) return 'text-[#fc2c54]';
    switch (currentTheme.season) {
      case 'spring': return 'text-emerald-600';
      case 'summer': return 'text-cyan-600';
      case 'winter': return 'text-sky-600';
    }
  };

  const getThemeBadgeClass = () => {
    if (isDarkSeason) return 'bg-[#fc2c54]/15 text-rose-300 border-[#fc2c54]/30';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20';
      case 'summer': return 'bg-cyan-500/10 text-cyan-850 border-cyan-500/20';
      case 'winter': return 'bg-sky-500/10 text-sky-850 border-sky-400/25';
    }
  };

  const getThemeBorderHoverClass = () => {
    if (isDarkSeason) return 'hover:border-[#fc2c54]/40';
    switch (currentTheme.season) {
      case 'spring': return 'hover:border-emerald-300';
      case 'summer': return 'hover:border-cyan-300';
      case 'winter': return 'hover:border-sky-300';
    }
  };

  const getThemeButtonClass = () => {
    if (isDarkSeason) return 'bg-[#fc2c54] text-white hover:bg-[#fc2c54]/90';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'summer': return 'bg-cyan-600 text-white hover:bg-cyan-700';
      case 'winter': return 'bg-[#1e6091] text-white hover:bg-[#1a527c]';
    }
  };

  const handleNextAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrevAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  return (
    <div className="w-full" style={{ direction: 'rtl' }}>
      <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 text-right overflow-hidden relative group ${getThemeBorderHoverClass()} ${
        isDarkSeason 
          ? 'bg-[#1b1220]/70 border-stone-850 shadow-md text-stone-200' 
          : 'bg-white/45 border-white/45 shadow-sm text-slate-800'
      }`}>
        
        {/* Decorative Grid or Sparkle */}
        <div className="absolute top-0 left-0 p-1 opacity-5">
          <Megaphone className="w-20 h-20 rotate-12" />
        </div>

        {/* Ad Header Info */}
        <div className="flex items-center justify-between gap-1 mb-2.5">
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[8.5px] sm:text-[9px] font-sans font-bold px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap shrink-0 ${getThemeBadgeClass()}`}>
              حامی برنامه (تبلیغات آنلاین)
            </span>
            {ads.length > 1 && (
              <span className={`text-[8px] font-mono px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 whitespace-nowrap shrink-0 ${isDarkSeason ? 'text-stone-400' : 'text-slate-500'}`}>
                {toPersianDigits(currentIndex + 1)} از {toPersianDigits(ads.length)}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className={`text-[9.5px] sm:text-[10px] font-bold font-sans cursor-pointer transition-all hover:underline flex items-center gap-0.5 whitespace-nowrap shrink-0 ${getThemeTextClass()}`}
          >
            <span>سفارش تبلیغ شما اینجا</span>
            <ArrowLeft className="w-2.5 h-2.5 text-current transform rotate-180 shrink-0" />
          </button>
        </div>

        {/* Inner Ad Card */}
        <div className="flex flex-col md:flex-row gap-3 items-center relative z-10">
          
          {/* Ad Image (Optional) */}
          {activeAd.imageUrl && (
            <div className={`w-full md:w-32 h-20 rounded-xl overflow-hidden shadow-inner flex-shrink-0 self-start md:self-center border border-black/5 dark:border-white/10 ${
              activeAd.imageMode === 'contain' ? 'bg-black/60' : ''
            }`}>
              <img 
                src={activeAd.imageUrl} 
                alt={activeAd.title} 
                referrerPolicy="no-referrer"
                className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
                  activeAd.imageMode === 'contain' 
                    ? 'object-contain' 
                    : activeAd.imageMode === 'natural' 
                      ? 'object-scale-down' 
                      : 'object-cover'
                }`}
              />
            </div>
          )}

          {/* Ad texts and description */}
          <div className="flex-1 w-full space-y-1">
            <h4 className="text-xs font-sans font-extrabold tracking-tight">
              {activeAd.title}
            </h4>
            <p className={`text-[10px] leading-relaxed line-clamp-2 md:line-clamp-3 ${isDarkSeason ? 'text-stone-350' : 'text-slate-600'}`}>
              {activeAd.description}
            </p>
          </div>

          {/* Ad Actions Column */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 justify-between items-center md:items-end mt-1.5 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-slate-200/50">
            
            {/* Nav Arrows if we have multiple ads */}
            {ads.length > 1 && (
              <div className="flex gap-1">
                <button 
                  onClick={handlePrevAd}
                  className="p-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-current cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNextAd}
                  className="p-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-current cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <a
              href={activeAd.link}
              target="_blank"
              rel="noopener noreferrer referrer"
              className={`flex items-center gap-1 text-[10px] py-1.5 px-3 rounded-lg font-bold font-sans transition-all active:scale-95 cursor-pointer text-center ${getThemeButtonClass()}`}
            >
              <span>{activeAd.buttonText || 'مشاهده وب‌سایت'}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

        </div>

      </div>

      {/* Ad Request Form Modal */}
      <AdRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentTheme={currentTheme}
      />
    </div>
  );
}
