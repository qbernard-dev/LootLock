import RNBluetoothClassic from 'react-native-bluetooth-classic';

export const bluetoothService = {
  connectToHC05: async (macAddress: string) => {
    try {
      const available = await RNBluetoothClassic.isBluetoothAvailable();
      if (!available) return null;

      const device = await RNBluetoothClassic.connectToDevice(macAddress);
      return device;
    } catch (e) {
      return null;
    }
  },

  startListening: (device: any, onDataReceived: (data: string) => void) => {
    try {
      device.onDataReceived((event: any) => {
        const cleanData = event.data.trim();
        if (cleanData) onDataReceived(cleanData);
      });
    } catch (e) {}
  },

  disconnect: async (device: any) => {
    try {
      await device.disconnect();
    } catch (e) {}
  },

  sendData: async (device: any, data: string) => {
    try {
      await device.write(data);
    } catch (e) {}
}
};