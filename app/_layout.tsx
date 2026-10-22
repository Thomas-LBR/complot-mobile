import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { CormorantGaramond_600SemiBold_Italic } from '@expo-google-fonts/cormorant-garamond/600SemiBold_Italic';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EngineProvider } from '../game/EngineContext';
import { ActivityIndicator, View } from 'react-native';
import { C } from '../game/theme';
export default function RootLayout() {
  const [loaded, error] = useFonts({ CormorantGaramond_600SemiBold, CormorantGaramond_600SemiBold_Italic, Manrope_400Regular, Manrope_700Bold });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.gold}/></View>;
  return <SafeAreaProvider><EngineProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }} /></EngineProvider></SafeAreaProvider>;
}


