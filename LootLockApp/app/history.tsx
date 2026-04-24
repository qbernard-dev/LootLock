import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useLogs } from '../context/LogContext'; 
import { bluetoothService } from '../services/bluetooth';

const HC05_MAC_ADDRESS = "98D3:31:F6132F"; 

export default function LootLockScreen() {
  const { logs, users, processScan } = useLogs();
  const [btStatus, setBtStatus] = useState("Déconnecté");
  const [device, setDevice] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (device) bluetoothService.disconnect(device);
    };
  }, [device]);

  const connectToHC05 = async () => {
    setBtStatus("Connexion en cours...");
    const connectedDevice = await bluetoothService.connectToHC05(HC05_MAC_ADDRESS);
    
    if (connectedDevice) {
      setDevice(connectedDevice);
      setBtStatus("✅ Connecté au HC-05");
      
      bluetoothService.startListening(connectedDevice, (data) => {
        processScan(data);
      });
    } else {
      setBtStatus("❌ Échec de connexion");
    }
  };

  const simulateNFCScan = () => {
    let uidToTest = "BADGE_INCONNU";
    if (users && users.length > 0) {
      uidToTest = users[Math.floor(Math.random() * users.length)].id;
    }
    processScan(uidToTest);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LootLock 🔒</Text>
        <Text style={styles.status}>Statut BT : {btStatus}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.btButton]} onPress={connectToHC05}>
          <Text style={styles.buttonText}>CONNECTER LE HC-05</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={simulateNFCScan}>
          <Text style={styles.buttonText}>SIMULER UN SCAN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.historyTitle}>Historique des accès</Text>
        
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun passage détecté pour le moment.</Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.logCard, item.status === "Refusé" && styles.logCardRefused]}>
              <View>
                <Text style={styles.logName}>{item.name}</Text>
                <Text style={styles.logDate}>{item.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.logTime}>{item.time}</Text>
                <Text style={[styles.logStatus, item.status === "Refusé" && styles.statusRefused]}>
                  {item.status}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#FFF', elevation: 2 },
  title: { fontSize: 28, fontWeight: '800', color: '#1D1D1F' },
  status: { fontSize: 14, color: '#86868B', marginTop: 5, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  button: { flex: 1, backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  btButton: { backgroundColor: '#34C759' },
  buttonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  listContainer: { flex: 1, paddingHorizontal: 20, marginTop: 20 },
  historyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#1D1D1F' },
  logCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#34C759' },
  logCardRefused: { borderLeftColor: '#FF3B30' },
  logName: { fontSize: 16, fontWeight: '600', color: '#1D1D1F' },
  logDate: { fontSize: 12, color: '#86868B', marginTop: 2 },
  logTime: { fontSize: 16, fontWeight: '700', color: '#1D1D1F' },
  logStatus: { fontSize: 12, fontWeight: 'bold', color: '#34C759', marginTop: 2 },
  statusRefused: { color: '#FF3B30' },
  emptyText: { textAlign: 'center', color: '#86868B', marginTop: 50 },
});