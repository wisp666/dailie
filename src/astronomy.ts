import * as SunCalc from 'suncalc';
import { EclipticGeoMoon, Horizon, Observer } from 'astronomy-engine';
import { format } from 'date-fns';

export type DailySky = {
  dateLabel: string; sunrise: Date | null; sunset: Date | null; moonrise: Date | null; moonset: Date | null;
  milkyWayRise: Date | null; milkyWaySet: Date | null; moonPhase: string; moonEmoji: string;
  moonIllumination: number; nakshatra: string; tamilMonth: string;
};

const NAKSHATRAS = ['அசுவினி','பரணி','கார்த்திகை','ரோகிணி','மிருகசீரிடம்','திருவாதிரை','புனர்பூசம்','பூசம்','ஆயில்யம்','மகம்','பூரம்','உத்திரம்','அஸ்தம்','சித்திரை','சுவாதி','விசாகம்','அனுஷம்','கேட்டை','மூலம்','பூராடம்','உத்திராடம்','திருவோணம்','அவிட்டம்','சதயம்','பூரட்டாதி','உத்திரட்டாதி','ரேவதி'];
const TAMIL_MONTHS = ['தை','மாசி','பங்குனி','சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி','ஐப்பசி','கார்த்திகை','மார்கழி'];

export function getDailySky(date: Date, latitude: number, longitude: number): DailySky {
  const sun = SunCalc.getTimes(date, latitude, longitude);
  const moon = SunCalc.getMoonTimes(date, latitude, longitude);
  const illumination = SunCalc.getMoonIllumination(date);
  const phase = phaseDetails(illumination.phase);
  const eclipticMoon = EclipticGeoMoon(date);
  const galactic = galacticCoreCrossings(date, latitude, longitude);
  return {
    dateLabel: format(date, 'EEEE, MMM d'), sunrise: sun.sunrise, sunset: sun.sunset,
    moonrise: moon.rise ?? null, moonset: moon.set ?? null,
    milkyWayRise: galactic.rise, milkyWaySet: galactic.set,
    moonPhase: phase.name, moonEmoji: phase.emoji, moonIllumination: Math.round(illumination.fraction * 100),
    nakshatra: NAKSHATRAS[Math.floor(((eclipticMoon.lon + 360) % 360) / (360 / 27))],
    tamilMonth: approximateTamilMonth(date),
  };
}

function phaseDetails(value: number) {
  const phases = [
    { at: 0.0625, name: 'New Moon', emoji: '🌑' }, { at: 0.1875, name: 'Waxing Crescent', emoji: '🌒' },
    { at: 0.3125, name: 'First Quarter', emoji: '🌓' }, { at: 0.4375, name: 'Waxing Gibbous', emoji: '🌔' },
    { at: 0.5625, name: 'Full Moon', emoji: '🌕' }, { at: 0.6875, name: 'Waning Gibbous', emoji: '🌖' },
    { at: 0.8125, name: 'Last Quarter', emoji: '🌗' }, { at: 0.9375, name: 'Waning Crescent', emoji: '🌘' },
  ];
  return phases.find(p => value < p.at) ?? phases[0];
}

// Tamil months begin near the Sun's sidereal sign ingress (usually the 14th/15th).
// This is a display approximation; a later Panchangam service can provide authoritative local boundaries.
function approximateTamilMonth(date: Date) {
  const month = date.getMonth();
  return TAMIL_MONTHS[(month + (date.getDate() >= 14 ? 0 : 11)) % 12];
}

// The bright Galactic Centre is treated as a fixed J2000 target: RA 17h45m40s, Dec −29°00′28″.
// Ten-minute sampling is sufficient for a daily widget; interpolation gives a cleaner displayed time.
function galacticCoreCrossings(date: Date, latitude: number, longitude: number) {
  const observer = new Observer(latitude, longitude, 0);
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  let previous = Horizon(start, observer, 17.7611, -29.0078, 'normal').altitude;
  let rise: Date | null = null; let set: Date | null = null;
  for (let minutes = 10; minutes <= 24 * 60; minutes += 10) {
    const currentDate = new Date(start.getTime() + minutes * 60_000);
    const current = Horizon(currentDate, observer, 17.7611, -29.0078, 'normal').altitude;
    if (previous <= 0 && current > 0 && !rise) rise = interpolate(currentDate, previous, current);
    if (previous > 0 && current <= 0 && !set) set = interpolate(currentDate, previous, current);
    previous = current;
  }
  return { rise, set };
}

function interpolate(end: Date, before: number, after: number) {
  const fraction = Math.abs(before) / (Math.abs(before) + Math.abs(after));
  return new Date(end.getTime() - (1 - fraction) * 10 * 60_000);
}
