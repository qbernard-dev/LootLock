import { Tabs } from 'expo-router';
import { LogProvider } from '../context/LogContext';

export default function Layout() {
  return (
    <LogProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
        <Tabs.Screen name="history" options={{ title: 'Historique' }} />
        <Tabs.Screen name="users" options={{ title: 'Utilisateurs' }} />
      </Tabs>
    </LogProvider>
  );
}