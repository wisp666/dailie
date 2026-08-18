export type SkyEvent = Readonly<{
  label: string;
  time: string;
  icon: string;
  accent: string;
}>;

export type DailyKural = Readonly<{
  number: number;
  tamil: string;
  english: string;
}>;

export type DailySkySnapshot = Readonly<{
  dateKey: string;
  dayLabel: string;
  shortDayLabel: string;
  dateLabel: string;
  tamilMonth: string;
  nakshatra: string;
  moonPhase: string;
  moonEmoji: string;
  moonIllumination: number;
  visibility: 'Fair' | 'Good' | 'Excellent';
  events: readonly SkyEvent[];
  kural: DailyKural;
}>;

export type WeeklySkySnapshot = Readonly<{
  generatedAt: string;
  locationLabel: string;
  isFallbackLocation: boolean;
  days: readonly DailySkySnapshot[];
}>;
