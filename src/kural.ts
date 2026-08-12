export type Kural = { number: number; tamil: string; english: string };

const SAMPLE_KURALS: Kural[] = [
  { number: 1, tamil: 'அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.', english: 'As the letter A is first among letters, the eternal God is first in the world.' },
  { number: 2, tamil: 'கற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்.', english: 'What use is learning, if one does not worship at the feet of perfect wisdom?' },
  { number: 10, tamil: 'பிறவிப் பெருங்கடல் நீந்துவர் நீந்தார்\nஇறைவன் அடிசேரா தார்.', english: 'Those who reach the divine feet cross the vast sea of birth; others do not.' },
];

export function getKuralOfTheDay(date: Date): Kural {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return SAMPLE_KURALS[day % SAMPLE_KURALS.length];
}
