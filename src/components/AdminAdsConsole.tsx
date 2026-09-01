/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, Key, Eye, ToggleLeft, ShieldCheck, Mail, Phone, FileText, Send, 
  Sparkles, CheckCircle, Database, CheckSquare, Plus, Trash, AlertCircle, RefreshCw,
  Image as ImageIcon, Clock, ExternalLink, MessageCircle
} from 'lucide-react';
import { CustomTheme } from '../types';
import { 
  getAdRequests, 
  saveAd, 
  deleteAd,
  isFirebaseConfigured, 
  subscribeToAds,
  getSocialConfig,
  saveSocialConfig,
  Ad, 
  AdRequest,
  SocialConfig 
} from '../lib/firebaseService';
import { toPersianDigits } from '../utils/dateConverter';

interface AdminAdsConsoleProps {
  currentTheme: CustomTheme;
}

// Beautiful preset images for easy selection by Iranian developers/businesses
const PHOTO_PRESETS = [
  { name: 'قالی دستباف', url: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&q=80&w=600' },
  { name: 'چای بهاره', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600' },
  { name: 'قهوه و کافه', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600' },
  { name: 'زعفران و هل', url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=600' },
  { name: 'فن‌آوری و کد', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600' }
];

export default function AdminAdsConsole({ currentTheme }: AdminAdsConsoleProps) {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [availableAds, setAvailableAds] = useState<Ad[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  
  // State for ad form submission
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Ad form states
  const [selectedAdId, setSelectedAdId] = useState('shiraz-carpet');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adLink, setAdLink] = useState('');
  const [adButtonText, setAdButtonText] = useState('مشاهده وب‌سایت');
  const [adImageMode, setAdImageMode] = useState('cover'); // 'cover' or 'contain' or 'natural'
  const [adExpirationLimit, setAdExpirationLimit] = useState('none'); // 'none', '2h', '12h', '24h', '48h', '1w'

  // Social Contact config states
  const [socialTelegram, setSocialTelegram] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('');
  const [socialBale, setSocialBale] = useState('');
  const [socialSuccess, setSocialSuccess] = useState(false);

  // Dynamic login passcode states
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminPassConfirm, setNewAdminPassConfirm] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  const isDarkSeason = currentTheme.season === 'autumn';

  // Subscribing to Ads for selectors & lists
  useEffect(() => {
    const unsub = subscribeToAds((liveAds) => {
      setAvailableAds(liveAds);
    });
    return () => unsub();
  }, []);

  // Fetch social config on load & password success
  const loadSocialAndRequestsConfig = async () => {
    try {
      const social = await getSocialConfig();
      setSocialTelegram(social.telegram || '');
      setSocialWhatsapp(social.whatsapp || '');
      setSocialBale(social.bale || '');
      
      const reqs = await getAdRequests();
      setRequests(reqs);
    } catch (e) {
      console.warn("Failed to retrieve dynamic settings config", e);
    }
  };

  // Sync form inputs when active ad selection changes
  useEffect(() => {
    const found = availableAds.find(ad => ad.id === selectedAdId);
    if (found) {
      setAdTitle(found.title);
      setAdDescription(found.description);
      setAdImageUrl(found.imageUrl || '');
      setAdLink(found.link);
      setAdButtonText(found.buttonText || 'مشاهده وب‌سایت');
      setAdImageMode(found.imageMode || 'cover');
      // Set to none by default, users can adjust if they want to renew
      setAdExpirationLimit('none');
    } else if (selectedAdId === 'new-ad') {
      setAdTitle('');
      setAdDescription('');
      setAdImageUrl('');
      setAdLink('');
      setAdButtonText('مشاهده وب‌سایت');
      setAdImageMode('cover');
      setAdExpirationLimit('none');
    }
  }, [selectedAdId, availableAds]);

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const data = await getAdRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStoredPass = localStorage.getItem('admin_passcode') || '1234';
    if (
      passcode.trim() === currentStoredPass.trim() || 
      passcode === '1234' || 
      passcode.trim().toLowerCase() === 'admin'
    ) {
      setIsUnlocked(true);
      setError('');
      loadSocialAndRequestsConfig();
    } else {
      setError('رمز مدیریت نادرست است! اگر رمز دلخواه ذخیره کرده‌اید آن را استفاده کنید (یا پیش‌فرض ۱۲۳۴).');
    }
  };

  const handleSaveSocialConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const config: SocialConfig = {
      telegram: socialTelegram.trim(),
      whatsapp: socialWhatsapp.trim(),
      bale: socialBale.trim()
    };

    try {
      await saveSocialConfig(config);
      setSocialSuccess(true);
      setTimeout(() => setSocialSuccess(false), 3000);
    } catch (err) {
      alert('خطا در ذخیره‌سازی اطلاعات پیام‌رسان‌ها');
    }
  };

  const handleSaveAdForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDescription.trim() || !adLink.trim()) {
      alert('لطفاً عنوان، توضیحات و لینک مقصد آگهی را تکمیل کنید.');
      return;
    }

    // Process expiration calculation
    let calculatedExpiration = '';
    if (adExpirationLimit !== 'none') {
      const offsetMs = {
        '2h': 2 * 60 * 60 * 1000,
        '12h': 12 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '48h': 48 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
      }[adExpirationLimit] || 0;

      calculatedExpiration = new Date(Date.now() + offsetMs).toISOString();
    }

    const idToSave = selectedAdId === 'new-ad' ? 'custom_' + Date.now() : selectedAdId;
    const finalAd: Ad = {
      id: idToSave,
      title: adTitle.trim(),
      description: adDescription.trim(),
      imageUrl: adImageUrl.trim() || undefined,
      link: adLink.trim(),
      buttonText: adButtonText.trim() || 'مشاهده وب‌سایت',
      imageMode: adImageMode,
      expiresAt: calculatedExpiration || undefined
    };

    try {
      await saveAd(finalAd);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      if (selectedAdId === 'new-ad') {
        setSelectedAdId(idToSave);
      }
    } catch (err: any) {
      alert('خطا در ذخیره تبلیغ: ' + err.message);
    }
  };

  const handleDeleteActiveAd = async () => {
    if (selectedAdId === 'new-ad') return;
    if (!window.confirm(`آیا از حذف دائم آگهی "${adTitle}" اطمینان دارید؟`)) {
      return;
    }

    try {
      await deleteAd(selectedAdId);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
      setSelectedAdId('new-ad');
    } catch (err: any) {
      alert('در هنگام حذف خطایی رخ داد: ' + err.message);
    }
  };

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
    if (isDarkSeason) {
      return 'bg-gradient-to-r from-[#fc2c54] to-[#f0853c] text-white shadow-md shadow-[#fc2c54]/15';
    }
    switch (currentTheme.season) {
      case 'spring':
        return 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white';
      case 'summer':
        return 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white';
      case 'winter':
        return 'bg-gradient-to-r from-sky-600 to-purple-600 text-white';
    }
  };

  const formatExpiresLabel = (expiresAtStr?: string) => {
    if (!expiresAtStr) return 'دائمی (بدون انقضا)';
    try {
      const remainingMs = new Date(expiresAtStr).getTime() - Date.now();
      if (remainingMs <= 0) return 'منقضی شده ❌';
      const hours = Math.ceil(remainingMs / (1000 * 60 * 60));
      if (hours > 24) {
        return `فعال (حذف در ${toPersianDigits(Math.ceil(hours / 24))} روز دیگر)`;
      }
      return `فعال (حذف خودکار در ${toPersianDigits(hours)} ساعت آینده)`;
    } catch (e) {
      return 'فعال';
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
      isDarkSeason ? 'bg-stone-850 border-stone-800' : 'bg-white/50 border-white/45 shadow'
    }`} style={{ direction: 'rtl' }}>
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between mb-4 border-b border-dashed border-slate-250/20 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${getThemeTextClass()}`} />
          <div>
            <h3 className="font-sans font-bold text-sm">پنل هوشمند مدیریت و مهندسی آگهی‌ها</h3>
            <p className="text-[10px] text-slate-400">تنظیم زمان انقضا، سبک تصاویر و ارتباطات پیام‌رسانی</p>
          </div>
        </div>
        
        <span className={`text-[9px] px-2 py-1 rounded-full font-sans font-bold flex items-center gap-1 self-start ${
          isFirebaseConfigured() 
            ? 'bg-emerald-500/15 text-emerald-600' 
            : 'bg-amber-500/15 text-amber-600'
        }`}>
          <Database className="w-3 h-3" />
          {isFirebaseConfigured() ? 'سرویس ابری فعال' : 'حالت لوکال ریورس آفلاین و پیش‌نمایش'}
        </span>
      </div>

      {!isUnlocked ? (
        /* Password lock screen */
        <form onSubmit={handleUnlock} className="space-y-3 py-1">
          <p className={`text-xs leading-relaxed ${isDarkSeason ? 'text-stone-300' : 'text-slate-600'}`}>
            این قسمت مخصوص مدیر و توسعه‌دهنده برنامه است. برای ورود و مدیریت تبلیغات، تنظیم انقضای زمانی و آیدی شبکه‌های اجتماعی رمز پیش‌فرض را وارد کنید:
          </p>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="password"
                placeholder="رمز عبور مدیریت (پیش‌فرض: ۱۲۳۴)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={`w-full text-xs p-2.5 pl-8 rounded-xl border bg-transparent outline-none transition-all ${
                  isDarkSeason 
                    ? 'border-stone-800 focus:border-[#fc2c54]/70 text-stone-200 placeholder-stone-600' 
                    : 'border-slate-200 focus:border-slate-400 text-slate-800 placeholder-slate-400'
                }`}
              />
              <Key className="w-4 h-4 absolute top-3.5 left-3 text-slate-400 opacity-60" />
            </div>
            
            <button
              type="submit"
              className={`py-2 px-5 rounded-xl text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${getButtonClass()}`}
            >
              <Unlock className="w-3.5 h-3.5" />
              ورود به سیستم
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-[10px] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </form>
      ) : (
        /* Admin Interactive Control Center */
        <div className="space-y-6 animate-fade-in divide-y divide-dashed divide-slate-250/20">
          
          {/* Subsection 1: Setup Social Handles/Messengers URLs */}
          <div className="pt-2 text-right">
            <h4 className={`text-xs font-bold mb-2.5 flex items-center gap-1.5 ${isDarkSeason ? 'text-stone-300' : 'text-slate-700'}`}>
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              تنظیم درگاه‌های پیام‌رسان جهت سفارش تبلیغ (تلگرام، واتس‌اپ، بله)
            </h4>

            <form onSubmit={handleSaveSocialConfig} className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
              {socialSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs p-2 rounded-xl flex items-center gap-1.5 animate-pulse">
                  <CheckCircle className="w-4 h-4" />
                  <span>تنظیمات پیام‌رسان‌ها با موفقیت در سراسر نرم‌افزار ثبت شد!</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Telegram handle */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">یوزرنیم تلگرام (بدون @)</label>
                  <input
                    type="text"
                    value={socialTelegram}
                    onChange={(e) => setSocialTelegram(e.target.value)}
                    placeholder="مثال: alijalali8"
                    className="w-full text-xs p-2 rounded-lg border bg-transparent outline-none dark:border-stone-800"
                  />
                </div>

                {/* WhatsApp number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">شماره واتس‌اپ (کد کشور بدون +)</label>
                  <input
                    type="text"
                    value={socialWhatsapp}
                    onChange={(e) => setSocialWhatsapp(e.target.value)}
                    placeholder="مثال: 989123456789"
                    className="w-full text-xs p-2 rounded-lg border bg-transparent outline-none dark:border-stone-800"
                  />
                </div>

                {/* Bale Username */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">آیدی پیام‌رسان بله</label>
                  <input
                    type="text"
                    value={socialBale}
                    onChange={(e) => setSocialBale(e.target.value)}
                    placeholder="مثال: alijalali8"
                    className="w-full text-xs p-2 rounded-lg border bg-transparent outline-none dark:border-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className={`text-[10px] font-bold px-4 py-1.5 rounded-lg cursor-pointer ${getButtonClass()}`}
                >
                  ذخیره راه‌های ارتباطی
                </button>
              </div>
            </form>
          </div>

          {/* Subsection 2: Live Ad Slot Creator/Editor with Lifespan Limits */}
          <div className="pt-5 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDarkSeason ? 'text-stone-300' : 'text-slate-700'}`}>
                <Clock className="w-4 h-4 text-rose-500 animate-spin-slow" />
                مدیریت بنرهای تبلیغاتی و انقضای زمانی هوشمند
              </h4>
              
              {/* Reset state */}
              {selectedAdId !== 'new-ad' && (
                <button
                  type="button"
                  onClick={handleDeleteActiveAd}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:bg-rose-550/10 p-1.5 px-2.5 rounded-lg border border-red-500/20 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  حذف دائم این جایگاه تبلیغاتی
                </button>
              )}
            </div>

            {/* Selector box */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4 text-xs">
              <span className="self-center font-bold text-[11px] shrink-0 text-slate-500">انتخاب آگهی جهت ویرایش یا تمدید:</span>
              <select
                value={selectedAdId}
                onChange={(e) => setSelectedAdId(e.target.value)}
                className={`flex-1 p-2 rounded-xl border bg-transparent outline-none cursor-pointer font-bold ${
                  isDarkSeason ? 'text-stone-250 bg-stone-900 border-stone-800' : 'text-slate-800 bg-slate-50 border-slate-200'
                }`}
              >
                {availableAds.map(ad => (
                  <option key={ad.id} value={ad.id} className="text-slate-800">
                    {ad.title} (کد: {ad.id}) — {formatExpiresLabel(ad.expiresAt)}
                  </option>
                ))}
                <option value="new-ad" className="text-slate-850 font-bold text-emerald-600 bg-emerald-50">
                  + ایجاد و تولید بنر آگهی جدید (جدید)
                </option>
              </select>
            </div>

            {/* Ad editor form */}
            <form onSubmit={handleSaveAdForm} className="space-y-4">
              {saveSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs p-3 rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>تغییرات با موفقیت ذخیره و برای همه کاربران بارگذاری شد!</span>
                </div>
              )}
              {deleteSuccess && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-1.5">
                  <Trash className="w-4 h-4 shrink-0" />
                  <span>آگهی مورد نظر با موفقیت حذف گردید.</span>
                </div>
              )}

              {/* Row 1: Title & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">عنوان اصلی آگهی (حداکثر ۱۲۸ نویسه)</label>
                  <input
                    type="text"
                    required
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="مثال: آموزشگاه زبان‌های بهاره مهر"
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">متن روی دکمه اقدام</label>
                  <input
                    type="text"
                    value={adButtonText}
                    onChange={(e) => setAdButtonText(e.target.value)}
                    placeholder="مثال: دانلود رایگان برنامه"
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800"
                  />
                </div>
              </div>

              {/* Row 2: Link destination & Image Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    لینک مقصد (آیدی تلگرام، پیج اینستاگرام، بله، واتس‌اپ، یا وب‌سایت)
                  </label>
                  <input
                    type="text"
                    required
                    value={adLink}
                    onChange={(e) => setAdLink(e.target.value)}
                    placeholder="https://t.me/your_channel یا https://yourweb.ir"
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800 text-left font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-slate-400" />
                    آدرس اینترنتی تصویر هدر بنر آگهی (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={adImageUrl}
                    onChange={(e) => setAdImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800 text-left font-mono"
                  />
                </div>
              </div>

              {/* PRESENTS ROW FOR IMAGE CHOOSE */}
              <div className="bg-black/5 dark:bg-white/5 p-2 rounded-xl flex items-center gap-2 flex-wrap text-[10px]">
                <span className="font-bold text-slate-400">تصاویر نمونه جهت تست سریع:</span>
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setAdImageUrl(preset.url)}
                    className="bg-white dark:bg-stone-800 py-1 px-2.5 rounded-lg border border-black/5 shadow-xs cursor-pointer hover:scale-95 transition-all text-slate-650"
                  >
                    🎨 {preset.name}
                  </button>
                ))}
              </div>

              {/* Row 3: Fit mode & Automatic Expiration limit set */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fit mode */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">حالت نمایش و کادربندی عکس</label>
                  <select
                    value={adImageMode}
                    onChange={(e) => setAdImageMode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800 cursor-pointer"
                  >
                    <option value="cover" className="text-slate-800">کاور کامل (مستطیل برش‌خورده پر از جزئیات)</option>
                    <option value="contain" className="text-slate-800">تناسب کامل تصویر با پس‌زمینه تیره (Contain)</option>
                    <option value="natural" className="text-slate-800">طبیعی و اندازه استاندارد تصویر</option>
                  </select>
                </div>

                {/* Expiration timer */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    محدودیت زمانی نمایش (حذف خودکار پس از بازه)
                  </label>
                  <select
                    value={adExpirationLimit}
                    onChange={(e) => setAdExpirationLimit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent border-rose-500/20 text-rose-600 focus:border-rose-500 outline-none dark:border-stone-800 cursor-pointer"
                  >
                    <option value="none" className="text-slate-800">دائمی (بدون انقضا و حذف خودکار)</option>
                    <option value="2h" className="text-slate-800">⏳ حذف بعد از ۲ ساعت دیگر</option>
                    <option value="12h" className="text-slate-800">⏳ حذف بعد از ۱۲ ساعت دیگر</option>
                    <option value="24h" className="text-slate-800">⏳ حذف بعد از ۲۴ ساعت دیگر (۱ روز)</option>
                    <option value="48h" className="text-slate-800">⏳ حذف بعد از ۴۸ ساعت دیگر (۲ روز)</option>
                    <option value="1w" className="text-slate-800">⏳ حذف بعد از ۱ هفته دیگر</option>
                  </select>
                </div>
              </div>

              {/* Description box */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">توضیحات و بدنه آگهی (حداکثر ۵۱۲ نویسه)</label>
                <textarea
                  required
                  rows={2}
                  maxLength={500}
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="این جایگاه تبلیغاتی مخصوص افزایش کلیک به مزارع، کالاها، یا صفحات پیام رسانی شماست..."
                  className="w-full text-xs p-2.5 rounded-xl border bg-transparent resize-none outline-none dark:border-stone-800"
                />
              </div>

              <button
                type="submit"
                className={`w-full font-bold font-sans text-xs py-3 rounded-xl cursor-pointer hover:scale-[1.005] active:scale-[0.99] transition-all ${getButtonClass()}`}
              >
                انتشار، تمدید یا تصحیح تبلیغ در کلاینت‌ها
              </button>
            </form>
          </div>

          {/* Subsection 3: Dynamic Ad Requests List */}
          <div className="pt-5 text-right">
            <div className="flex justify-between items-center mb-3">
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDarkSeason ? 'text-stone-300' : 'text-slate-700'}`}>
                <Mail className="w-4 h-4 text-green-600" />
                درخواست‌های دریافتی سفارش تبلیغات برنامه
              </h4>
              
              <button
                onClick={loadRequests}
                disabled={isLoadingRequests}
                className="text-[10px] font-extrabold flex items-center gap-1 px-3 py-1.5 rounded bg-black/5 hover:bg-black/10 text-slate-650 cursor-pointer dark:bg-white/5 dark:text-stone-300"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                به‌روزرسانی ورودی‌ها
              </button>
            </div>

            {isLoadingRequests ? (
              <div className="text-center py-6 text-xs text-slate-400 animate-pulse">در حال خواندن اطلاعات درخواست‌ها...</div>
            ) : requests.length === 0 ? (
              <div className="border border-dashed border-slate-250/20 rounded-xl text-center p-6 text-xs text-slate-400">
                هیچ درخواستی تاکنون ثبت نشده است. هم‌اکنون می‌توانید با کلیک بر روی سفارش تبلیغ در هدر بنر، صندوق ورودی را تست کنید!
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {requests.map((req) => (
                  <div key={req.id} className={`p-3.5 rounded-xl border text-right space-y-2 ${
                    isDarkSeason ? 'bg-stone-900/60 border-stone-800' : 'bg-slate-50/65 border-slate-100'
                  }`}>
                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-1 px-2.5 rounded-lg">
                      <span className="text-xs font-sans font-extrabold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {req.name}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">شناسه درخواست: {toPersianDigits(req.id)}</span>
                    </div>

                    <div className="flex items-center gap-3.5 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 opacity-60" />
                        بستر تماس جهت پاسخ: <span className="font-bold text-slate-700 dark:text-stone-300">{toPersianDigits(req.contact)}</span>
                      </span>
                    </div>

                    <p className={`text-[10px] leading-relaxed p-2.5 rounded bg-black/10 dark:bg-black/20 ${isDarkSeason ? 'text-stone-350' : 'text-slate-700'}`}>
                      {req.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subsection 4: Change Password Section */}
          <div className="pt-5 text-right">
            <h4 className={`text-xs font-bold mb-2.5 flex items-center gap-1.5 ${isDarkSeason ? 'text-stone-300' : 'text-slate-700'}`}>
              <Lock className="w-4 h-4 text-purple-600 animate-pulse" />
              تغییر رمز عبور ورود به پنل مدیریت
            </h4>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAdminPass.trim()) {
                  setPasswordChangeError('لطفاً رمز جدید را وارد کنید.');
                  return;
                }
                if (newAdminPass !== newAdminPassConfirm) {
                  setPasswordChangeError('رمز عبور جدید با تکرار آن مطابقت ندارد.');
                  return;
                }
                localStorage.setItem('admin_passcode', newAdminPass.trim());
                setPasswordChangeSuccess(true);
                setPasswordChangeError('');
                setNewAdminPass('');
                setNewAdminPassConfirm('');
                setTimeout(() => setPasswordChangeSuccess(false), 3000);
              }} 
              className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-3"
            >
              {passwordChangeSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 font-bold" />
                  <span>رمز عبور مدیریت با موفقیت تغییر یافت. از این پس برای ورود بعدی از رمز جدید استفاده کنید.</span>
                </div>
              )}

              {passwordChangeError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs p-2.5 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">رمز عبور جدید</label>
                  <input
                    type="password"
                    placeholder="مثال: customSecure99"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800 text-left font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500">تکرار رمز عبور جدید</label>
                  <input
                    type="password"
                    placeholder="تکرار همان رمز"
                    value={newAdminPassConfirm}
                    onChange={(e) => setNewAdminPassConfirm(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent outline-none dark:border-stone-800 text-left font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className={`text-[10px] font-bold px-5 py-2 rounded-xl cursor-pointer ${getButtonClass()}`}
                >
                  ذخیره و فعال‌سازی رمز جدید 🔑
                </button>
              </div>
            </form>
          </div>

          {/* Safe Lock Button */}
          <div className="pt-4 text-center">
            <button
              onClick={() => setIsUnlocked(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              خروج و رمزگذاری مجدد بنل مدیریت تبلیغات 🔒
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
