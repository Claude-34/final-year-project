import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

export const appConfig = {
  appName: 'Pothole Detection',
  /**
   * Set `EXPO_PUBLIC_API_BASE_URL` (see `app.config.js`) — e.g. `http://localhost:3000` for web,
   * or your machine LAN IP for a physical device. Android emulator: `http://10.0.2.2:3000`.
   */
  // apiBaseUrl: typeof extra?.apiBaseUrl === 'string' ? extra.apiBaseUrl.trim() : '',
  apiBaseUrl: 'http://192.168.1.146:5000',
};
