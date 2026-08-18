import type { DailyKural, DailySkySnapshot, WeeklySkySnapshot } from './daily-sky.types';

const kurals: readonly DailyKural[] = [
  {
    number: 1,
    tamil: 'அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.',
    english: 'As the letter A is first among letters, the eternal is first in the world.',
  },
  {
    number: 2,
    tamil: 'கற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்.',
    english: 'What use is learning if one does not honor perfect wisdom?',
  },
  {
    number: 10,
    tamil: 'பிறவிப் பெருங்கடல் நீந்துவர் நீந்தார்\nஇறைவன் அடிசேரா தார்.',
    english: 'Those who reach the divine feet cross the vast sea of birth.',
  },
  {
    number: 34,
    tamil: 'மனத்துக்கண் மாசிலன் ஆதல் அனைத்தறன்\nஆகுல நீர பிற.',
    english: 'Purity of mind is the whole of virtue; all else is empty display.',
  },
  {
    number: 72,
    tamil: 'அன்பிலார் எல்லாம் தமக்குரியர் அன்புடையார்\nஎன்பும் உரியர் பிறர்க்கு.',
    english: 'The loveless live for themselves; the loving give even their bones to others.',
  },
  {
    number: 100,
    tamil: 'இனிய உளவாக இன்னாத கூறல்\nகனியிருப்பக் காய்கவர்ந் தற்று.',
    english: 'Speaking harshly when kind words exist is choosing unripe fruit over ripe.',
  },
  {
    number: 391,
    tamil: 'கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.',
    english: 'Learn thoroughly what is worth learning, then live by what you learned.',
  },
];

const rawDays = [
  ['2026-08-16', 'Sunday', 'SUN', 'Aug 16', 'ஆவணி', 'ரோகிணி', 'Waxing Crescent', '🌒', 18, 'Good', '6:21 AM', '8:17 PM', '9:54 AM', '10:11 PM', '4:42 PM', '2:51 AM'],
  ['2026-08-17', 'Monday', 'MON', 'Aug 17', 'ஆவணி', 'மிருகசீரிடம்', 'Waxing Crescent', '🌒', 27, 'Good', '6:22 AM', '8:15 PM', '11:02 AM', '10:29 PM', '4:38 PM', '2:47 AM'],
  ['2026-08-18', 'Tuesday', 'TUE', 'Aug 18', 'ஆவணி', 'திருவாதிரை', 'Waxing Crescent', '🌒', 37, 'Excellent', '6:23 AM', '8:14 PM', '12:10 PM', '10:49 PM', '4:34 PM', '2:43 AM'],
  ['2026-08-19', 'Wednesday', 'WED', 'Aug 19', 'ஆவணி', 'புனர்பூசம்', 'First Quarter', '🌓', 48, 'Excellent', '6:24 AM', '8:12 PM', '1:19 PM', '11:13 PM', '4:30 PM', '2:39 AM'],
  ['2026-08-20', 'Thursday', 'THU', 'Aug 20', 'ஆவணி', 'பூசம்', 'First Quarter', '🌓', 58, 'Fair', '6:25 AM', '8:11 PM', '2:29 PM', '11:43 PM', '4:26 PM', '2:35 AM'],
  ['2026-08-21', 'Friday', 'FRI', 'Aug 21', 'ஆவணி', 'ஆயில்யம்', 'Waxing Gibbous', '🌔', 68, 'Good', '6:26 AM', '8:09 PM', '3:38 PM', '—', '4:22 PM', '2:31 AM'],
  ['2026-08-22', 'Saturday', 'SAT', 'Aug 22', 'ஆவணி', 'மகம்', 'Waxing Gibbous', '🌔', 77, 'Excellent', '6:27 AM', '8:07 PM', '4:44 PM', '12:21 AM', '4:18 PM', '2:27 AM'],
] as const;

function createEvents(values: (typeof rawDays)[number]) {
  return [
    { label: 'Sunrise', time: values[10], icon: '☀︎', accent: '#ffcb70' },
    { label: 'Sunset', time: values[11], icon: '☼', accent: '#ff8b6a' },
    { label: 'Moonrise', time: values[12], icon: '☾', accent: '#dfe3ff' },
    { label: 'Moonset', time: values[13], icon: '◑', accent: '#b2b7ed' },
    { label: 'Milky Way rise', time: values[14], icon: '✦', accent: '#dfb1ff' },
    { label: 'Milky Way set', time: values[15], icon: '✧', accent: '#aa91ff' },
  ] as const;
}

const days: readonly DailySkySnapshot[] = rawDays.map((values, index) => ({
  dateKey: values[0],
  dayLabel: values[1],
  shortDayLabel: values[2],
  dateLabel: values[3],
  tamilMonth: values[4],
  nakshatra: values[5],
  moonPhase: values[6],
  moonEmoji: values[7],
  moonIllumination: values[8],
  visibility: values[9],
  events: createEvents(values),
  kural: kurals[index],
}));

export const weeklySkyFixture: WeeklySkySnapshot = {
  generatedAt: '2026-08-16T08:00:00-04:00',
  locationLabel: 'Toronto, Ontario',
  isFallbackLocation: true,
  days,
};
