import type { WeeklySkySnapshot } from '../services/daily-sky/daily-sky.types';

export const WIDGET_SCHEMA_VERSION = 1 as const;
export const WIDGET_STORAGE_KEY = 'dailie.widget.snapshot';

export type WidgetDaySnapshot = Readonly<{
  dateKey: string;
  dayLabel: string;
  dateLabel: string;
  tamilMonth: string;
  nakshatra: string;
  moonPhase: string;
  moonEmoji: string;
  moonIllumination: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  milkyWayRise: string;
  milkyWaySet: string;
  kuralNumber: number;
  kuralTamil: string;
  kuralEnglish: string;
}>;

export type WidgetSnapshotV1 = Readonly<{
  schemaVersion: typeof WIDGET_SCHEMA_VERSION;
  generatedAt: string;
  locationLabel: string;
  days: readonly WidgetDaySnapshot[];
}>;

export function createWidgetSnapshot(week: WeeklySkySnapshot): WidgetSnapshotV1 {
  return {
    schemaVersion: WIDGET_SCHEMA_VERSION,
    generatedAt: week.generatedAt,
    locationLabel: week.locationLabel,
    days: week.days.map((day) => ({
      dateKey: day.dateKey,
      dayLabel: day.dayLabel,
      dateLabel: day.dateLabel,
      tamilMonth: day.tamilMonth,
      nakshatra: day.nakshatra,
      moonPhase: day.moonPhase,
      moonEmoji: day.moonEmoji,
      moonIllumination: day.moonIllumination,
      sunrise: day.events[0]?.time ?? '—',
      sunset: day.events[1]?.time ?? '—',
      moonrise: day.events[2]?.time ?? '—',
      moonset: day.events[3]?.time ?? '—',
      milkyWayRise: day.events[4]?.time ?? '—',
      milkyWaySet: day.events[5]?.time ?? '—',
      kuralNumber: day.kural.number,
      kuralTamil: day.kural.tamil,
      kuralEnglish: day.kural.english,
    })),
  };
}
