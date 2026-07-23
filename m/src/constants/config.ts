export const config = {
  apiUrl: 'http://192.168.8.79:3040/api/v1',
  socketUrl: 'http://192.168.8.79:3040',
  appName: 'SUTMS',
  appVersion: '1.0.0',
  pagination: { defaultLimit: 10, maxLimit: 100 },
  debounceDelay: 500,
  retryAttempts: 3,
  cacheTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 2,
  locationUpdateInterval: 10000,
};

export const storageKeys = {
  token: 'sutms_token',
  refreshToken: 'sutms_refresh_token',
  user: 'sutms_user',
  theme: 'sutms_theme',
  language: 'sutms_language',
  offlineQueue: 'sutms_offline_queue',
};
