import React, { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Text from './Text';
import { sansBold } from '../game/theme';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type InstallWindow = Window & { tableInstallPrompt?: InstallPrompt | null };
export default function InstallApp() {
  const [installed, setInstalled] = useState(false), [ready, setReady] = useState(false), [ios, setIos] = useState(false), [help, setHelp] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const media = window.matchMedia('(display-mode: standalone)');
    const sync = () => { setInstalled(media.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone); setReady(!!(window as InstallWindow).tableInstallPrompt); };
    const done = () => setInstalled(true);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    sync(); window.addEventListener('table-install-ready', sync); window.addEventListener('appinstalled', done); media.addEventListener('change', sync);
    return () => { window.removeEventListener('table-install-ready', sync); window.removeEventListener('appinstalled', done); media.removeEventListener('change', sync); };
  }, []);
  if (Platform.OS !== 'web' || installed) return null;
  const install = async () => {
    const event = (window as InstallWindow).tableInstallPrompt;
    if (!event) { setHelp(v => !v); return; }
    setBusy(true);
    try { await event.prompt(); const result = await event.userChoice; if (result.outcome === 'accepted') setInstalled(true); }
    catch { setHelp(true); }
    finally { (window as InstallWindow).tableInstallPrompt = null; setReady(false); setBusy(false); }
  };
  return <View style={{ borderWidth: 1, borderColor: '#60716A', backgroundColor: '#223B3B', borderRadius: 18, padding: 20, gap: 12 }}>
    <Text style={{ color: '#F4DEAD', fontFamily: sansBold, fontSize: 16 }}>Vos trois jeux, une icône.</Text>
    <Text style={{ color: '#E3E7DE', fontSize: 13, lineHeight: 21 }}>Ajoutez La Table des Amis à votre écran d’accueil. Gratuit, sans passer par un store. Internet reste nécessaire pour jouer.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Installer l’application" disabled={busy} onPress={install} style={({ pressed }) => ({ alignSelf: 'flex-start', backgroundColor: '#E4C784', borderRadius: 12, padding: 14, opacity: pressed || busy ? .65 : 1 })}>
      <Text style={{ color: '#203031', fontFamily: sansBold, fontSize: 13 }}>{busy ? 'Installation…' : ready ? 'Installer l’application' : 'Ajouter à mon écran d’accueil'}</Text>
    </Pressable>
    {help && <Text accessibilityLiveRegion="polite" style={{ color: '#F4DEAD', fontSize: 13, lineHeight: 23 }}>{ios ? 'Sur iPhone ou iPad : ouvrez ce site dans Safari, touchez Partager, puis « Sur l’écran d’accueil » et « Ajouter ». Si proposé, activez « Ouvrir comme app web ».' : 'Sur Android : ouvrez ce site dans Chrome, puis le menu ⋮ → « Ajouter à l’écran d’accueil » ou « Installer l’application ». Sur ordinateur, utilisez l’icône d’installation dans la barre d’adresse si elle est proposée.'}</Text>}
  </View>;
}
