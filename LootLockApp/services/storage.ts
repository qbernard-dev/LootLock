import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@lootlock_users';
const LOGS_KEY = '@lootlock_logs';

export const storage = {
  saveUsers: async (usersList: any[]) => {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(usersList));
      console.log("Utilisateurs sauvegardés avec succès !");
    } catch (e) {
      console.error("Erreur de sauvegarde des utilisateurs", e);
    }
  },

  loadUsers: async () => {
    try {
      const data = await AsyncStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : []; // Si le tiroir est vide, on renvoie une liste vide
    } catch (e) {
      console.error("Erreur de chargement des utilisateurs", e);
      return [];
    }
  },

  saveLogs: async (logsList: any[]) => {
    try {
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logsList));
      console.log("Logs sauvegardés avec succès !");
    } catch (e) {
      console.error("Erreur de sauvegarde des logs", e);
    }
  },

  loadLogs: async () => {
    try {
      const data = await AsyncStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erreur de chargement des logs", e);
      return [];
    }
  },
  

  clearAllMemory: async () => {
    try {
      await AsyncStorage.multiRemove([USERS_KEY, LOGS_KEY]);
      console.log("Mémoire totalement effacée !");
    } catch(e) {
      console.error("Erreur lors de l'effacement", e);
    }
  }
};