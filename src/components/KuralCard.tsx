import { StyleSheet, Text, View } from 'react-native';
import type { DailyKural } from '../services/daily-sky/daily-sky.types';

export function KuralCard({ kural }: Readonly<{ kural: DailyKural }>) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>திருக்குறள்</Text>
        <Text style={styles.number}>KURAL {kural.number}</Text>
      </View>
      <Text style={styles.tamil}>{kural.tamil}</Text>
      <View style={styles.rule} />
      <Text style={styles.english}>{kural.english}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff0b', borderRadius: 22, borderLeftWidth: 3, borderLeftColor: '#f7b761', padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#f7b761', fontSize: 13, fontWeight: '800' },
  number: { color: '#777d9b', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  tamil: { color: '#f8f5ff', fontSize: 17, lineHeight: 28, marginTop: 14 },
  rule: { width: 32, height: 1, backgroundColor: '#f7b76166', marginVertical: 12 },
  english: { color: '#a9aec7', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
});
