import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { DailySkyView } from '../components/DailySkyView';
import { WeekStrip } from '../components/WeekStrip';
import { loadWeeklySky } from '../services/daily-sky/daily-sky.service';
import type { WeeklySkySnapshot } from '../services/daily-sky/daily-sky.types';

type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; week: WeeklySkySnapshot; selectedDateKey: string }
  | { status: 'error'; message: string };

export function DailySkyScreen() {
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const week = await loadWeeklySky();
      setState({ status: 'ready', week, selectedDateKey: week.days[0]?.dateKey ?? '' });
    } catch {
      setState({ status: 'error', message: 'The weekly sky could not be prepared.' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectDay = (selectedDateKey: string) => {
    setState((current) => current.status === 'ready' ? { ...current, selectedDateKey } : current);
  };

  return (
    <LinearGradient colors={['#070c20', '#17122e', '#2c1838']} locations={[0, 0.58, 1]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>DAILIE SKY</Text>
            <Text style={styles.location}>⌖ {state.status === 'ready' ? state.week.locationLabel : 'Toronto, Ontario'}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Refresh weekly sky" onPress={() => void load()} style={styles.refresh}>
            <Text style={styles.refreshIcon}>↻</Text>
          </Pressable>
        </View>

        {state.status === 'loading' ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#f7b761" /></View>
        ) : state.status === 'error' ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>The sky is hidden</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
            <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={styles.weekStrip}>
              <WeekStrip days={state.week.days} selectedDateKey={state.selectedDateKey} onDaySelected={selectDay} />
            </View>
            {state.week.isFallbackLocation ? <Text style={styles.fallback}>SAMPLE WEEK · FALLBACK LOCATION</Text> : null}
            <SelectedDay week={state.week} selectedDateKey={state.selectedDateKey} />
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function SelectedDay({ week, selectedDateKey }: Readonly<{ week: WeeklySkySnapshot; selectedDateKey: string }>) {
  const selectedDay = week.days.find((day) => day.dateKey === selectedDateKey);
  return selectedDay ? <DailySkyView day={selectedDay} /> : null;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#f7b761', fontSize: 13, fontWeight: '900', letterSpacing: 2.5 },
  location: { color: '#9ba0bc', fontSize: 13, marginTop: 5 },
  refresh: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff10', borderWidth: 1, borderColor: '#ffffff12', alignItems: 'center', justifyContent: 'center' },
  refreshIcon: { color: '#f7f3ff', fontSize: 23 },
  weekStrip: { paddingLeft: 22 },
  fallback: { color: '#8a739a', fontSize: 8, fontWeight: '800', letterSpacing: 1.2, paddingHorizontal: 22, marginTop: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { color: '#f8f5ff', fontSize: 22, fontWeight: '800' },
  errorMessage: { color: '#9ba0bc', textAlign: 'center', marginTop: 8 },
  retry: { backgroundColor: '#f7b761', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, marginTop: 20 },
  retryText: { color: '#171329', fontWeight: '800' },
});
