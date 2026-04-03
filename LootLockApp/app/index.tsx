import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogs } from '../context/LogContext';

export default function HomeScreen() {
  const router = useRouter();
  const { logs } = useLogs();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        
        <Text style={styles.title}>LootLock</Text>
        <Text style={styles.subtitle}>Bienvenue dans votre interface sécurisée</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/acces')}>
          <Text style={styles.buttonText}>Voir l'historique</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/users')}>
          <Text style={styles.buttonText}>Ajouter une personne</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
          <Text style={styles.historyTitle}>Derniers accès :</Text>
          
          <FlatList
            data={(logs || []).slice(0, 5)}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isGranted = item.status === "Autorisé" || item.accessGranted === true;
              const nameToDisplay = item.name || item.userName || "Inconnu";
              const timeToDisplay = item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
  hour: '2-digit', 
  minute: '2-digit' 
}) : "");
              const dateToDisplay = item.date || (item.timestamp ? new Date(item.timestamp).toLocaleDateString('fr-FR', { 
  hour: '2-digit', 
  minute: '2-digit' 
}) : "");

              return (
                <View style={[styles.logCard, !isGranted && styles.logCardRefused]}>
                  <View>
                    <Text style={styles.logName}>{nameToDisplay}</Text>
                    <Text style={styles.logDate}>{dateToDisplay}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.logTime}>{timeToDisplay}</Text>
                    <Text style={[styles.logStatus, !isGranted && styles.statusRefused]}>
                      {isGranted ? "Accès Autorisé" : "Accès Refusé"}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  main: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listContainer: {
    marginTop: 40,
    flex: 1,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 15,
    color: '#1D1D1F',
  },
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