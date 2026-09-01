/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, AlertCircle, Play, Pause } from 'lucide-react';
import { CustomTheme } from '../types';

interface SeasonalNatureAudioProps {
  currentTheme: CustomTheme;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export default function SeasonalNatureAudio({ currentTheme, season }: SeasonalNatureAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const generatorTimerRef = useRef<any>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const isDarkSeason = currentTheme.season === 'autumn';

  // Get localized titles/descriptions per season
  const soundMeta = {
    spring: {
      emoji: '🌸',
      title: 'آوای شکوفه‌زار بهاری (چهچهه پرندگان و نسیم)',
      desc: 'شبیه‌سازی سنتز صوتی موج باد ملایم و آواز ملودیک صبحگاهی چکاوک‌ها.',
    },
    summer: {
      emoji: '☀️',
      title: 'امواج آرام‌بخش سواحل تابستانی بهارنارنج',
      desc: 'فرکانس‌های شبه‌سفید شبیه‌سازی جزر و مد منظم دریا با ریتم تنفس انسان.',
    },
    autumn: {
      emoji: '🍂',
      title: 'ریزش نرم باران پاییزی و خش‌خش برگ‌ها',
      desc: 'تپش‌های ریز باران روی شیروانی و وزش باد خزان بر بوم طبیعت.',
    },
    winter: {
      emoji: '❄️',
      title: 'ترک صمیمانهٔ چوب درختان سرد زاگرس (شومینه دنج)',
      desc: 'صدای دلنشین ترق‌وتروق هیزم در بخاری سنگی کلبه‌های جنگلی گیلان.',
    },
  }[season];

  // Stop sound safely
  const stopAmbient = () => {
    if (generatorTimerRef.current) {
      clearInterval(generatorTimerRef.current);
      generatorTimerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    masterGainRef.current = null;
    setIsPlaying(false);
  };

  // Play and Synthesize using Web Audio API (Fully Client-Side, No external dependencies!)
  const startAmbient = () => {
    try {
      setError(null);
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('سیستم مرورگر شما از وب‌آدیو پشتیبانی نمی‌کند.');
      }

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master volume node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime); // keep it soft
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      if (season === 'spring') {
        // --- SPRING CHIRPING & WIND ---
        // Basic wind noise simulation (highly filtered low frequency oscillator)
        const runSpringSynth = () => {
          if (!ctx || ctx.state === 'closed') return;
          
          // periodic bird tweet simulation
          const oscInfo = [
            { freq: 1100, delay: 0 },
            { freq: 1300, delay: 0.15 },
            { freq: 1150, delay: 0.3 }
          ];

          oscInfo.forEach((item) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(item.freq, ctx.currentTime + item.delay);
            // Sweet modulation
            osc.frequency.exponentialRampToValueAtTime(item.freq * 1.5, ctx.currentTime + item.delay + 0.08);
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + item.delay + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + item.delay + 0.12);

            osc.connect(gainNode);
            gainNode.connect(masterGain);
            osc.start(ctx.currentTime + item.delay);
            osc.stop(ctx.currentTime + item.delay + 0.13);
          });
        };

        runSpringSynth();
        // repeat tweets periodically
        generatorTimerRef.current = setInterval(runSpringSynth, 1700);

      } else if (season === 'summer') {
        // --- SUMMER OCEAN WAVES ---
        // Simulating white/pink noise modulated via filter sweep with long periods (breath-like)
        const waveOsc = ctx.createOscillator();
        const waveGain = ctx.createGain();
        waveOsc.type = 'triangle';
        waveOsc.frequency.setValueAtTime(100, ctx.currentTime);
        
        // Continuous swell
        const intervalTime = 6000; // 6 seconds per wave swell
        const runSummerSummerWave = () => {
          if (!ctx || ctx.state === 'closed') return;
          const now = ctx.currentTime;
          waveGain.gain.setValueAtTime(0.005, now);
          waveGain.gain.linearRampToValueAtTime(0.06, now + 3);
          waveGain.gain.linearRampToValueAtTime(0.005, now + 6);
        };
        
        // Connect modulated feedback
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 350;
        filter.Q.value = 1.0;

        waveOsc.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(masterGain);
        waveOsc.start();

        const triggerModulation = () => {
          if (!ctx || ctx.state === 'closed') return;
          const now = ctx.currentTime;
          filter.frequency.setValueAtTime(320, now);
          filter.frequency.exponentialRampToValueAtTime(750, now + 3);
          filter.frequency.exponentialRampToValueAtTime(320, now + 6);
        };

        runSummerSummerWave();
        triggerModulation();
        generatorTimerRef.current = setInterval(() => {
          runSummerSummerWave();
          triggerModulation();
        }, intervalTime);

      } else if (season === 'autumn') {
        // --- AUTUMN RAIN TAP & WIND ---
        const playAutumnRaindrop = () => {
          if (!ctx || ctx.state === 'closed') return;
          
          // play 10 micro-clicks at random tiny offsets to simulate rainfall
          for (let i = 0; i < 12; i++) {
            const offset = Math.random() * 0.4;
            const clickOsc = ctx.createOscillator();
            const clickGain = ctx.createGain();
            
            clickOsc.type = 'sine';
            clickOsc.frequency.setValueAtTime(150 + Math.random() * 50, ctx.currentTime + offset);
            
            clickGain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
            clickGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + offset + 0.005);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.015);
            
            clickOsc.connect(clickGain);
            clickGain.connect(masterGain);
            
            clickOsc.start(ctx.currentTime + offset);
            clickOsc.stop(ctx.currentTime + offset + 0.02);
          }
        };

        playAutumnRaindrop();
        generatorTimerRef.current = setInterval(playAutumnRaindrop, 400);

      } else {
        // --- WINTER FIREPLACE CRACKLES ---
        const playWinterFireCrack = () => {
          if (!ctx || ctx.state === 'closed') return;
          
          // simulate random pops
          const burstCount = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < burstCount; i++) {
            const offset = Math.random() * 0.35;
            const popOsc = ctx.createOscillator();
            const popGain = ctx.createGain();
            
            // sharp narrow pulse frequencies
            popOsc.type = 'triangle';
            popOsc.frequency.setValueAtTime(3000 + Math.random() * 4000, ctx.currentTime + offset);
            
            popGain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
            popGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + offset + 0.001);
            popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.008);
            
            popOsc.connect(popGain);
            popGain.connect(masterGain);
            
            popOsc.start(ctx.currentTime + offset);
            popOsc.stop(ctx.currentTime + offset + 0.01);
          }
        };

        playWinterFireCrack();
        generatorTimerRef.current = setInterval(playWinterFireCrack, 600);
      }

      setIsPlaying(true);
    } catch (e: any) {
      console.error("Nature sound web audio synthesis crashed: ", e);
      setError(e.message || 'مشکلی در پخش صوت رخ داد.');
      setIsPlaying(false);
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  };

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      if (generatorTimerRef.current) clearInterval(generatorTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className={`p-4 rounded-3xl border text-right space-y-3 shadow-inner ${
      isDarkSeason 
        ? 'bg-[#1b1022]/75 border-purple-500/10 text-stone-100 shadow-purple-500/5' 
        : 'bg-gradient-to-br from-slate-50 to-white/95 border-slate-200/50 text-slate-800'
    }`} style={{ direction: 'rtl' }}>
      
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-black">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>اصوات و ملودی فصول بهارنارنج</span>
        </div>
        <span className="text-sm shrink-0 select-none">{soundMeta.emoji}</span>
      </div>

      {/* Main Desc body */}
      <p className="text-[10px] text-slate-500 dark:text-purple-300 leading-relaxed font-sans">
        {soundMeta.desc} (سنتز صوتی ریاضی زنده وب بدون مصرف اینترنت)
      </p>

      {/* Controller Area */}
      <div className="flex items-center justify-between gap-2.5 pt-1">
        <button
          onClick={handleToggle}
          className={`flex-1 py-2 font-sans font-black text-[10px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-white ${
            isPlaying 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20' 
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>قطع صدای طبیعت</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>پخش نوای اختصاصی {soundMeta.emoji}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/20 text-rose-600 text-[9px] p-2 rounded-lg flex items-center gap-1.5 mt-1 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
