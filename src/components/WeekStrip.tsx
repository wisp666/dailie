import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DailySkySnapshot } from '../services/daily-sky/daily-sky.types';

type WeekStripProps = Readonly<{
  days: readonly DailySkySnapshot[];
  selectedDateKey: string;
  onDaySelected: (dateKey: string) => void;
}>;

export function WeekStrip({ days, selectedDateKey, onDaySelected }: WeekStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {days.map((day) => {
        const selected = day.dateKey === selectedDateKey;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${day.dayLabel}, ${day.dateLabel}`}
            accessibilityState={{ selected }}
            key={day.dateKey}
            onPress={() => onDaySelected(day.dateKey)}
            style={[styles.day, selected && styles.selectedDay]}
          >
            <Text style={[styles.weekday, selected && styles.selectedText]}>{day.shortDayLabel}</Text>
            <Text style={[styles.date, selected && styles.selectedText]}>{day.dateLabel.split(' ')[1]}</Text>
            {selected ? <View style={styles.selectedDot} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8, paddingRight: 22 },
  day: { width: 58, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff0a', borderWidth: 1, borderColor: '#ffffff10' },
  selectedDay: { backgroundColor: '#f8b965', borderColor: '#ffd79e' },
  weekday: { color: '#8489a7', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  date: { color: '#d9dbea', fontSize: 20, fontWeight: '700', marginTop: 4 },
  selectedText: { color: '#171329' },
  selectedDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#171329', marginTop: 4 },
});
