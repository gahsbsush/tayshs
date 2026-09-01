/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Astronomical Shari'a Prayer Times Calculator
// Optimized for Iran coordinates (with University of Tehran angles)
// TimeZone is locked at +3.5 UTC standard index (Iran Standard Time without DST changes since 2023)

export interface PrayerTimes {
  imsak: string;      // امساک
  fajr: string;       // اذان صبح
  sunrise: string;    // طلوع آفتاب
  dhuhr: string;      // اذان ظهر
  sunset: string;     // غروب آفتاب
  maghrib: string;    // اذان مغرب
  midnight: string;   // نیمه‌شب شرعی
}

export interface CityCoords {
  name: string;
  lat: number;
  lng: number;
}

export const IRAN_CITIES: CityCoords[] = [
  { name: 'تهران', lat: 35.6892, lng: 51.3890 },
  { name: 'مشهد', lat: 36.2972, lng: 59.6067 },
  { name: 'اصفهان', lat: 32.6546, lng: 51.6680 },
  { name: 'شیراز', lat: 29.5918, lng: 52.5837 },
  { name: 'تبریز', lat: 38.0962, lng: 46.2743 },
  { name: 'اهواز', lat: 31.3183, lng: 48.6706 },
  { name: 'کرمان', lat: 30.2839, lng: 57.0781 },
  { name: 'رشت', lat: 37.2809, lng: 49.5924 },
  { name: 'قم', lat: 34.6416, lng: 50.8746 },
  { name: 'ساری', lat: 36.5659, lng: 53.0592 },
  { name: 'زاهدان', lat: 29.4963, lng: 60.8629 },
  { name: 'بندرعباس', lat: 27.1833, lng: 56.2667 },
  { name: 'کرمانشاه', lat: 34.3167, lng: 47.0667 },
  { name: 'یزد', lat: 31.8972, lng: 54.3675 }
];

// Helper: Convert degree to radian
const d2r = (deg: number): number => (deg * Math.PI) / 180;
// Helper: Convert radian to degree
const r2d = (rad: number): number => (rad * 180) / Math.PI;

// Helper: Convert fractional hours to HH:MM format
function formatHours(h: number): string {
  if (isNaN(h)) return '--:--';
  let hours = Math.floor(h) % 24;
  let minutes = Math.round((h - Math.floor(h)) * 60);
  if (minutes === 60) {
    minutes = 0;
    hours = (hours + 1) % 24;
  }
  const hrsStr = String(hours).padStart(2, '0');
  const minsStr = String(minutes).padStart(2, '0');
  return `${hrsStr}:${minsStr}`;
}

export function calculatePrayerTimes(
  gy: number,
  gm: number,
  gd: number,
  cityLat: number,
  cityLng: number
): PrayerTimes {
  // 1. Find Julian Day or Day of Year
  const yearStart = new Date(gy, 0, 1).getTime();
  const currentDate = new Date(gy, gm - 1, gd).getTime();
  const dayOfYear = Math.floor((currentDate - yearStart) / (24 * 60 * 60 * 1000)) + 1;

  // 2. Solar geometry calculation
  const totalDays = 365.25;
  const fractionalYear = (2 * Math.PI / totalDays) * (dayOfYear - 1);

  // Equation of Time in minutes
  const eqt = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(fractionalYear) -
    0.032077 * Math.sin(fractionalYear) -
    0.014615 * Math.cos(2 * fractionalYear) -
    0.040849 * Math.sin(2 * fractionalYear)
  );

  // Solar declination in radians
  const dec = 0.006918 -
    0.399912 * Math.cos(fractionalYear) +
    0.070257 * Math.sin(fractionalYear) -
    0.006758 * Math.cos(2 * fractionalYear) +
    0.000907 * Math.sin(2 * fractionalYear) -
    0.002697 * Math.cos(3 * fractionalYear) +
    0.00148 * Math.sin(3 * fractionalYear);

  // Latitude in radians
  const latR = d2r(cityLat);

  // 3. Midday (Dhuhr) Transit
  // Longitude standard in Iran is based on UTC+3.5. Standard meridian is 3.5 * 15 = 52.5° East
  const timezone = 3.5;
  const standardMeridian = timezone * 15; // 52.5
  // Transit time in hours local
  const dhuhrTime = 12 + (standardMeridian - cityLng) / 15 - eqt / 60;

  // Helper function to calculate Hour Angle (H) for a given Sun Altitude (a in degrees)
  const calculateHourAngle = (altitudeDeg: number): number => {
    const aR = d2r(altitudeDeg);
    const cosH = (Math.sin(aR) - Math.sin(latR) * Math.sin(dec)) / (Math.cos(latR) * Math.cos(dec));
    if (cosH > 1 || cosH < -1) return NaN;
    return r2d(Math.acos(cosH)) / 15; // Hours
  };

  // 4. Calculate Event Times
  // Sunrise & Sunset Angle: -0.833 degrees
  const hSunriseSunset = calculateHourAngle(-0.833);
  const sunriseTime = dhuhrTime - hSunriseSunset;
  const sunsetTime = dhuhrTime + hSunriseSunset;

  // Fajr Angle (Institute of Geophysics, Univ. of Tehran): -17.7 degrees
  const hFajr = calculateHourAngle(-17.7);
  const fajrTime = dhuhrTime - hFajr;

  // Maghrib Angle (Institute of Geophysics, Univ. of Tehran): -4.5 degrees
  const hMaghrib = calculateHourAngle(-4.5);
  const maghribTime = dhuhrTime + hMaghrib;

  // Imsak: Typically 10 minutes before Fajr
  const imsakTime = fajrTime - (10 / 60);

  // Midnight: Midpoint between sunset and fajr (of next day, approx same sunset + half of duration till next fajr)
  // Let's find duration from Sunset to Fajr: (24 - Sunset) + Fajr
  const nightDuration = (24 - sunsetTime) + fajrTime;
  const midnightTime = (sunsetTime + nightDuration / 2) % 24;

  return {
    imsak: formatHours(imsakTime),
    fajr: formatHours(fajrTime),
    sunrise: formatHours(sunriseTime),
    dhuhr: formatHours(dhuhrTime),
    sunset: formatHours(sunsetTime),
    maghrib: formatHours(maghribTime),
    midnight: formatHours(midnightTime),
  };
}
