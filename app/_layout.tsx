import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { GeminiProvider } from '../src/ai/context/GeminiContext';
import { CycleProvider } from '../src/features/cycle/context/CycleContext';
import { DisclaimerModal } from '../src/components/DisclaimerModal';
import { storageGet, storageSet, STORAGE_KEYS } from '../src/lib/storage';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...Ionicons.font });
  const [disclaimerReady, setDisclaimerReady] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    storageGet<boolean>(STORAGE_KEYS.DISCLAIMER_ACCEPTED).then(accepted => {
      setDisclaimerAccepted(!!accepted);
      setDisclaimerReady(true);
    });
  }, []);

  const handleAccept = async () => {
    await storageSet(STORAGE_KEYS.DISCLAIMER_ACCEPTED, true);
    setDisclaimerAccepted(true);
  };

  if (!fontsLoaded && !fontError) return null;

  return (
    <CycleProvider>
      <GeminiProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
        {disclaimerReady && (
          <DisclaimerModal
            visible={!disclaimerAccepted}
            onAccept={handleAccept}
          />
        )}
      </GeminiProvider>
    </CycleProvider>
  );
}
