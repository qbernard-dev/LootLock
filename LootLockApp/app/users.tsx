import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { storage } from '../services/storage';

export default function UsersScreen() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const loadedUsers = await storage.loadUsers();
      setUsers(loadedUsers);
    };
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!name.trim()) return;

    const newBadgeId = `NFC_${id}`;
    const newUser = { id: newBadgeId, name: name.trim() };
    
    const updatedUsers = [...users, newUser];
    
    setUsers(updatedUsers);
    await storage.saveUsers(updatedUsers);
    setName('');
    setId('');
    storage.loadLogs();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter une personne</Text>
      
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        placeholder="Nom de l'utilisateur"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        placeholder="ID du badge (ex: 12345)"
        value={id}
        onChangeText={setId}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddUser}>
        <Text style={styles.buttonText}>Enregistrer et lier un badge</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Utilisateurs autorisés :</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardId}>{item.id}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 15, backgroundColor: '#F5F5F7', borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1D1D1F' },
  cardId: { color: '#86868B', fontSize: 12 }
});