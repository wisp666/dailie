import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailySky, getDailySky } from './src/astronomy';
import { getKuralOfTheDay } from './src/kural';

const FALLBACK = { latitude: 43.6532, longitude: -79.3832 };
const clock = (date: Date | null) => date ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—';

export default function App() {
  const [sky, setSky] = useState<DailySky>();
  const [place, setPlace] = useState('Finding your location…');
  const [loading, setLoading] = useState(true);
  const kural = getKuralOfTheDay(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    let coords = FALLBACK;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === 'granted') {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = position.coords;
        const [address] = await Location.reverseGeocodeAsync(coords);
        setPlace([address?.city, address?.region].filter(Boolean).join(', ') || 'Current location');
      } else setPlace('Toronto · location permission needed');
    } catch { setPlace('Toronto · location unavailable'); }
    setSky(getDailySky(new Date(), coords.latitude, coords.longitude));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <LinearGradient colors={['#0a1025', '#171535', '#321d44']} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View><Text style={styles.eyebrow}>DAILIE SKY</Text><Text style={styles.location}>⌖ {place}</Text></View>
            <Pressable accessibilityRole="button" onPress={refresh} style={styles.refresh}><Text style={styles.refreshText}>↻</Text></Pressable>
          </View>
          {loading || !sky ? <ActivityIndicator size="large" color="#ffc477" style={styles.loader} /> : <>
            <View style={styles.hero}>
              <View><Text style={styles.date}>{sky.dateLabel}</Text><Text style={styles.tamil}>{sky.tamilMonth} · {sky.nakshatra}</Text></View>
              <View style={styles.moon}><Text style={styles.moonGlyph}>{sky.moonEmoji}</Text><Text style={styles.phase}>{sky.moonPhase}</Text><Text style={styles.percent}>{sky.moonIllumination}%</Text></View>
            </View>
            <View style={styles.grid}>
              <Metric icon="☀︎" label="SUNRISE" value={clock(sky.sunrise)} accent="#ffcc73" />
              <Metric icon="☼" label="SUNSET" value={clock(sky.sunset)} accent="#ff8a68" />
              <Metric icon="☾" label="MOONRISE" value={clock(sky.moonrise)} accent="#d9ddff" />
              <Metric icon="◑" label="MOONSET" value={clock(sky.moonset)} accent="#aaaee8" />
              <Metric icon="✦" label="MILKY WAY RISE" value={clock(sky.milkyWayRise)} accent="#dcaaff" />
              <Metric icon="✧" label="MILKY WAY SET" value={clock(sky.milkyWaySet)} accent="#a88cff" />
            </View>
            <View style={styles.kuralCard}>
              <Text style={styles.kuralLabel}>திருக்குறள் · {kural.number}</Text>
              <Text style={styles.kuralTamil}>{kural.tamil}</Text>
              <Text style={styles.kuralEnglish}>{kural.english}</Text>
            </View>
            <Text style={styles.note}>Preview of the large iPhone widget · calculations refresh when you open the app</Text>
          </>}
        </ScrollView>
        <StatusBar style="light" />
      </SafeAreaView>
    </LinearGradient>
  );
}

function Metric({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return <View style={styles.metric}><Text style={[styles.metricIcon, { color: accent }]}>{icon}</Text><View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, safe: { flex: 1 }, content: { padding: 22, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, eyebrow: { color: '#ffc477', fontSize: 13, fontWeight: '800', letterSpacing: 2.4 },
  location: { color: '#a8abc3', marginTop: 5, fontSize: 13 }, refresh: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff12', alignItems: 'center', justifyContent: 'center' }, refreshText: { color: 'white', fontSize: 24 },
  loader: { marginTop: 100 }, hero: { backgroundColor: '#ffffff0d', borderColor: '#ffffff18', borderWidth: 1, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: 'white', fontSize: 27, fontWeight: '700' }, tamil: { color: '#d7b9f2', fontSize: 15, marginTop: 7 }, moon: { alignItems: 'center' }, moonGlyph: { fontSize: 45 }, phase: { color: '#f2eafa', fontSize: 11, fontWeight: '700', marginTop: 3 }, percent: { color: '#999bb3', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, metric: { width: '48%', minHeight: 82, backgroundColor: '#0c1026aa', borderRadius: 18, padding: 13, flexDirection: 'row', gap: 11, alignItems: 'center' }, metricIcon: { fontSize: 27, width: 31, textAlign: 'center' }, metricLabel: { color: '#8f92ae', fontSize: 9, fontWeight: '700', letterSpacing: 1 }, metricValue: { color: 'white', fontSize: 20, fontWeight: '700', marginTop: 4 },
  kuralCard: { borderLeftColor: '#ffc477', borderLeftWidth: 3, backgroundColor: '#ffffff0b', borderRadius: 16, padding: 17 }, kuralLabel: { color: '#ffc477', fontWeight: '700', fontSize: 12, letterSpacing: 1 }, kuralTamil: { color: 'white', fontSize: 17, lineHeight: 26, marginTop: 11 }, kuralEnglish: { color: '#afb1c9', lineHeight: 20, marginTop: 8, fontStyle: 'italic' }, note: { color: '#737791', textAlign: 'center', fontSize: 11, paddingBottom: 16 },
});
