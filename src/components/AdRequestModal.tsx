/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Megaphone, CheckCircle, Sparkles, AlertCircle, Phone, FileText, User, MessageSquare } from 'lucide-react';
import { CustomTheme } from '../types';
import { submitAdRequest, isFirebaseConfigured, getSocialConfig, SocialConfig } from '../lib/firebaseService';
import { toPersianDigits } from '../utils/dateConverter';

interface AdRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: CustomTheme;
}

export default function AdRequestModal({ isOpen, onClose, currentTheme }: AdRequestModalProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [socialConfig, setSocialConfig] = useState<SocialConfig | null>(null);

  useEffect(() => {
    if (isOpen) {
      getSocialConfig()
        .then(setSocialConfig)
        .catch(err => console.warn("Could not read social contact config on modal open", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    if (isDarkSeason) return 'bg-[#fc2c54]/10 text-rose-450';
    switch (currentTheme.season) {
      case 'spring': return 'bg-emerald-500/10 text-emerald-800';
      case 'summer': return 'bg-cyan-500/10 text-cyan-800';
      case 'winter': return 'bg-sky-500/10 text-sky-800';
    }
  };

  const getButtonClass = () => {
    if (isSubmitting) return 'opacity-50 cursor-wait bg-slate-350';
    if (isDarkSeason) {
      return 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-lg shadow-[#fc2c54]/25';
    }
    switch (currentTheme.season) {
      case 'spring':
        return 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/25';
      case 'summer':
        return 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-700/25';
      case 'winter':
        return 'bg-gradient-to-r from-[#1e6091] to-purple-600 text-white shadow-lg shadow-[#1e6091]/25';
    }
  };

  const getThemeBorderClass = () => {
    if (isDarkSeason) return 'border-stone-800 focus:border-[#fc2c54]/80';
    switch (currentTheme.season) {
      case 'spring': return 'border-slate-200 focus:border-emerald-600';
      case 'summer': return 'border-slate-200 focus:border-cyan-600';
      case 'winter': return 'border-slate-200 focus:border-sky-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !description.trim()) {
      setError('ارابه اطلاعات در تمام بخش‌ها الزامی است.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitAdRequest(name, contact, description);
      setSuccess(true);
      setName('');
      setContact('');
      setDescription('');
    } catch (err: any) {
      setError('خطایی در ارسال رخ داد. لطفاً نوع اتصال خود را بررسی کرده و مجدد تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" 
      style={{ direction: 'rtl' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-3xl border p-5 sm:p-6 transition-all shadow-2xl relative ${
        isDarkSeason 
          ? 'bg-[#1b1220] border-purple-500/20 text-stone-100 shadow-black/80' 
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
      }`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 left-4 p-1.5 rounded-full transition-all border cursor-pointer ${
            isDarkSeason 
              ? 'border-stone-800 bg-stone-900/40 text-stone-300 hover:bg-stone-800/80' 
              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-6 animate-fade-in flex flex-col items-center">
            <div className={`p-3.5 rounded-full mb-4 animate-bounce ${getThemeBadgeClass()}`}>
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>
            
            <h3 className="font-sans font-bold text-lg">درخواست شما با موفقیت ثبت شد</h3>
            <p className={`text-xs mt-2.5 px-4 leading-relaxed ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
              از حسن اعتماد شما سپاسگزاریم. مشخصات آگهی و اطلاعات تماس شما با موفقیت در دستان مدیریت شبکه تبلیغاتی قرار گرفت. به زودی جهت هماهنگی با شما تماس حاصل خواهیم کرد.
            </p>

            <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {isFirebaseConfigured() ? 'ذخیره‌سازی زنده در پایگاه داده ابری' : 'ذخیره‌سازی پیش‌نمایش در حافظه محلی مروگر'}
            </span>

            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className={`mt-6 w-full py-2.5 rounded-xl font-bold font-sans text-xs transition-transform active:scale-95 cursor-pointer ${getButtonClass()}`}
            >
              متوجه شدم
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-xl ${getThemeBadgeClass()}`}>
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-md">سفارش و ثبت تبلیغ آنلاین</h3>
                <p className={`text-[10px] mt-0.5 ${isDarkSeason ? 'text-purple-300/60' : 'text-slate-500'}`}>
                  برای نمایش تبلیغ، خدمات، کانال، یا وب‌سایت خود در این اپلیکیشن فرم زیر را پر کنید.
                </p>
              </div>
            </div>

            {/* Quick social shortcuts (If configured) */}
            {socialConfig && (socialConfig.telegram || socialConfig.whatsapp || socialConfig.bale) && (
              <div className={`p-3 rounded-xl border text-right space-y-2 select-none ${
                isDarkSeason ? 'bg-[#291730]/70 border-purple-500/10' : 'bg-slate-50 border-slate-250/30'
              }`}>
                <span className="text-[9px] font-bold text-slate-500 dark:text-purple-300 block">
                  ارتباط مستقیم و گفتگوی زنده با مدیر در پیام‌رسان‌ها:
                </span>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {socialConfig.telegram && (
                    <a 
                      href={`https://t.me/${socialConfig.telegram}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-450 hover:bg-sky-500/20 text-[10px] font-bold rounded-lg transition-all"
                    >
                      <span>تلگرام 🚀</span>
                    </a>
                  )}

                  {socialConfig.whatsapp && (
                    <a 
                      href={`https://wa.me/${socialConfig.whatsapp}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/20 text-[10px] font-bold rounded-lg transition-all"
                    >
                      <span>واتس‌اپ 💬</span>
                    </a>
                  )}

                  {socialConfig.bale && (
                    <a 
                      href={`https://ble.ir/${socialConfig.bale}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 hover:bg-indigo-500/20 text-[10px] font-bold rounded-lg transition-all"
                    >
                      <span>بله 🌀</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Field: Name */}
            <div className="flex flex-col gap-1 text-right">
              <label className={`text-[10px] font-bold px-1 flex items-center gap-1 ${isDarkSeason ? 'text-purple-300/80' : 'text-slate-700'}`}>
                <User className="w-3.5 h-3.5" />
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                placeholder="مثال: علی جلالی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                required
                className={`w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none transition-all ${getThemeBorderClass()} ${
                  isDarkSeason ? 'text-stone-200 placeholder-stone-600' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Field: Phone or email */}
            <div className="flex flex-col gap-1 text-right">
              <label className={`text-[10px] font-bold px-1 flex items-center gap-1 ${isDarkSeason ? 'text-purple-300/80' : 'text-slate-700'}`}>
                <Phone className="w-3.5 h-3.5" />
                شماره تماس یا آیدی تلگرام / ایمیل
              </label>
              <input
                type="text"
                placeholder="تلفن همراه، آیدی تلگرام یا آدرس ایمیل"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={100}
                required
                className={`w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none transition-all ${getThemeBorderClass()} ${
                  isDarkSeason ? 'text-stone-200 placeholder-stone-600' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Field: Description */}
            <div className="flex flex-col gap-1 text-right">
              <label className={`text-[10px] font-bold px-1 flex items-center gap-1 ${isDarkSeason ? 'text-purple-300/80' : 'text-slate-700'}`}>
                <FileText className="w-3.5 h-3.5" />
                توضیحات آگهی / کسب‌وکار شما
              </label>
              <textarea
                placeholder="جزئیاتی از کسب‌وکار، لینک وب‌سایت یا پیج و نحوه نمایش مدنظرتان را بنویسید..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={600}
                rows={3}
                required
                className={`w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none transition-all resize-none ${getThemeBorderClass()} ${
                  isDarkSeason ? 'text-stone-200 placeholder-stone-600' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Footer Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-sans text-xs transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${getButtonClass()}`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'در حال ثبت درخواست...' : 'ارسال نهایی و ثبت سفارش'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
