// lib/config.ts
import { Platform } from 'react-native';

export const BASE_URL = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://192.168.43.217:5000/api',
  default: 'http://localhost:5000/api'
});