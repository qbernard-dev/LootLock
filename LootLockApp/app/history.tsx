import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { useLogs } from '../context/LogContext'; 

let manager: any = null;
try {
  manager = new BleManager();
} catch (e) {
  console.log("Mode Simulation détecté.");
}

export default function LootLockScreen() {
  const { logs, users, processScan } = useLogs();
  const [isBTAvailable, setIsBTAvailable] = useState(false);

  useEffect(() => {
    if (manager) setIsBTAvailable(true);
  }, []);

  const simulateNFCScan = () => {
    let uidToTest = "BADGE_INCONNU";
    
    if (users && users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      uidToTest = randomUser.id;
    }

    processScan(uidToTest);
  };

  const rejetUser = () => {
    processScan("00000")
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LootLock 🔒</Text>
        <Text style={styles.status}>
          Statut : {isBTAvailable ? "✅ Bluetooth Actif" : "⚠️ Mode Simulation"}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={simulateNFCScan}>
        <Text style={styles.buttonText}>SIMULER UN SCAN NFC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF3B30' }]} onPress={rejetUser}> 
        <Text style={styles.buttonText}>SIMULER UN SCAN REFUSÉ</Text>
      </TouchableOpacity>

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
  status: { fontSize: 14, color: '#86868B', marginTop: 5 },
  button: {
    backgroundColor: '#007AFF', margin: 20, padding: 18, borderRadius: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  historyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#1D1D1F' },
  
  // Amélioration du design des cartes selon le statut
  logCard: {
    backgroundColor: '#FFF', padding: 15, borderRadius: 10, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
    borderLeftWidth: 5, borderLeftColor: '#34C759', // Ligne verte par défaut
  },
  logCardRefused: { borderLeftColor: '#FF3B30' }, // Ligne rouge si refusé
  logName: { fontSize: 16, fontWeight: '600', color: '#1D1D1F' },
  logDate: { fontSize: 12, color: '#86868B', marginTop: 2 },
  logTime: { fontSize: 16, fontWeight: '700', color: '#1D1D1F' },
  logStatus: { fontSize: 12, fontWeight: 'bold', color: '#34C759', marginTop: 2 },
  statusRefused: { color: '#FF3B30' },
  emptyText: { textAlign: 'center', color: '#86868B', marginTop: 50 },
});