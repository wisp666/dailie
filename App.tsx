import { StatusBar } from 'expo-status-bar';
import { DailySkyScreen } from './src/screens/DailySkyScreen';

export default function App() {
  return (
    <>
      <DailySkyScreen />
      <StatusBar style="light" />
    </>
  );
}
