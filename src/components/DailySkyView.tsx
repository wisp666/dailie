import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DailySkySnapshot } from '../services/daily-sky/daily-sky.types';
import { KuralCard } from './KuralCard';
import { SkyEventGrid } from './SkyEventGrid';

export function DailySkyView({ day }: Readonly<{ day: DailySkySnapshot }>) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.day}>{day.dayLabel}</Text>
          <Text style={styles.date}>{day.dateLabel} · {day.tamilMonth}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.nakshatra}>✦ {day.nakshatra}</Text>
            <Text style={styles.visibility}>{day.visibility} skies</Text>
          </View>
        </View>
        <View style={styles.moon}>
          <Text style={styles.moonGlyph}>{day.moonEmoji}</Text>
          <Text style={styles.moonPhase}>{day.moonPhase}</Text>
          <Text style={styles.illumination}>{day.moonIllumination}% illuminated</Text>
        </View>
      </View>
      <View>
        <Text style={styles.sectionLabel}>CELESTIAL EVENTS</Text>
        <SkyEventGrid events={day.events} />
      </View>
      <KuralCard kural={day.kural} />
      <Text style={styles.note}>Seven-day preview · sample times for Toronto</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 38, gap: 20 },
  hero: { minHeight: 164, backgroundColor: '#ffffff0d', borderRadius: 28, borderWidth: 1, borderColor: '#ffffff16', padding: 20, flexDirection: 'row', alignItems: 'center' },
  heroCopy: { flex: 1 },
  day: { color: '#f8f5ff', fontSize: 28, fontWeight: '800' },
  date: { color: '#a9aec7', fontSize: 14, marginTop: 6 },
  metaRow: { marginTop: 20, gap: 5 },
  nakshatra: { color: '#dbb6f3', fontSize: 13, fontWeight: '700' },
  visibility: { color: '#77d6b0', fontSize: 11, fontWeight: '700' },
  moon: { alignItems: 'center', width: 112 },
  moonGlyph: { fontSize: 54 },
  moonPhase: { color: '#f3edfa', fontSize: 11, fontWeight: '800', marginTop: 5, textAlign: 'center' },
  illumination: { color: '#7f84a1', fontSize: 9, marginTop: 3 },
  sectionLabel: { color: '#777d9b', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  note: { color: '#686e8c', textAlign: 'center', fontSize: 10 },
});
