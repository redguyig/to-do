import { getDeviceId } from './utils/deviceId';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/tasks";
export const DEVICE_ID = getDeviceId();
