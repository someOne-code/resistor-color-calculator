import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ResistorCalculator from './ResistorCalculator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ResistorCalculator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}