import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../services/storage';

const LogContext = createContext<any>(null);

// to create default data for testing
const InitialData = async () => {
    const defaultUsers = [
        { id: 'NFC_12345', name: 'Alice' },
        { id: 'NFC_67890', name: 'Bob' },
    ];
    const defaultLogs = [
        {
            id: '1',
            uid: 'NFC_12345',
            name: 'Alice',
            time: '14:30',
            date: '2024-06-01',
            status: 'Autorisé'
        }, 
        {
            id: '2',
            uid: 'NFC_67890',
            name: 'Bob',
            time: '15:45',
            date: '2024-06-01',
            status: 'Autorisé'
        }
    ];
    await storage.saveUsers(defaultUsers);
    await storage.saveLogs(defaultLogs);
};

export const LogProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    InitialData(); 
    const loadAllData = async () => {
      setUsers(await storage.loadUsers());
      setLogs(await storage.loadLogs());
    };
    loadAllData();
  }, []);

  const addUser = async (name: string, id: string) => {
    const updatedUsers = [...users, { id, name }];
    setUsers(updatedUsers);
    await storage.saveUsers(updatedUsers);
  };

  const processScan = async (scannedUid: string) => {
    const knownUser = users.find(u => u.id === scannedUid);
    const displayName = knownUser ? knownUser.name : "Inconnu";
    
    const newLog = {
      id: Date.now().toString(),
      uid: scannedUid,
      name: displayName,
      time: new Date().toLocaleTimeString('fr-FR', { 
  hour: '2-digit', 
  minute: '2-digit' 
}),
      date: new Date().toLocaleDateString('fr-FR', { 
  hour: '2-digit', 
  minute: '2-digit' 
}),
      status: knownUser ? "Autorisé" : "Refusé"
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    await storage.saveLogs(updatedLogs);
  };

  return (
    <LogContext.Provider value={{ users, logs, addUser, processScan }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => useContext(LogContext);