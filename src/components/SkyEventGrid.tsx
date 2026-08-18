import { StyleSheet, Text, View } from 'react-native';
import type { SkyEvent } from '../services/daily-sky/daily-sky.types';

export function SkyEventGrid({ events }: Readonly<{ events: readonly SkyEvent[] }>) {
  return (
    <View style={styles.grid}>
      {events.map((event) => (
        <View key={event.label} style={styles.card}>
          <Text style={[styles.icon, { color: event.accent }]}>{event.icon}</Text>
          <View style={styles.copy}>
            <Text style={styles.label}>{event.label.toUpperCase()}</Text>
            <Text style={styles.time}>{event.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48.4%', minHeight: 88, backgroundColor: '#0b1028b8', borderRadius: 20, borderWidth: 1, borderColor: '#ffffff0d', padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' },
  icon: { fontSize: 28, width: 31, textAlign: 'center' },
  copy: { flex: 1 },
  label: { color: '#7e84a3', fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  time: { color: '#f7f4ff', fontSize: 18, fontWeight: '700', marginTop: 5 },
});
