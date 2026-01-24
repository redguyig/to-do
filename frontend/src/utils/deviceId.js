// Generate or retrieve a unique device ID
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    // Generate a unique ID (timestamp + random string)
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};
