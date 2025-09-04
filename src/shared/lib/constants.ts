export const APP_CONFIG = {
  name: 'Aura Browser',
  version: '1.0.0',
  description: 'Advanced mobile browser with privacy focus',
  author: 'Aura Team',
  website: 'https://aura-browser.com',
  support: 'support@aura-browser.com',
} as const;

export const API_CONFIG = {
  baseUrl: __DEV__ ? 'http://localhost:3000' : 'https://api.aura-browser.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  
  // Browser Data
  TABS: 'browser_tabs',
  CLOSED_TABS: 'browser_closed_tabs',
  HISTORY: 'browser_history',
  BOOKMARKS: 'browser_bookmarks',
  DOWNLOADS: 'browser_downloads',
  SETTINGS: 'browser_settings',
  
  // App State
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_APP_VERSION: 'last_app_version',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
} as const;

export const SEARCH_ENGINES = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    suggestUrl: 'https://suggestqueries.google.com/complete/search?client=firefox&q=',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    suggestUrl: 'https://api.bing.com/osjson.aspx?query=',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    suggestUrl: 'https://duckduckgo.com/ac/?q=',
  },
  yahoo: {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    suggestUrl: 'https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=sd1&command=',
  },
} as const;

export const DEFAULT_SETTINGS: BrowserSettings = {
  darkMode: false,
  nightMode: false,
  incognitoMode: false,
  desktopMode: false,
  adBlockEnabled: true,
  searchEngine: 'google',
  homepage: 'https://www.google.com',
  autoSaveHistory: true,
  maxHistoryItems: 1000,
};

export const QUICK_ACCESS_SITES = [
  { name: 'Google', url: 'https://google.com', icon: 'search', color: '#4285f4' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', color: '#ff0000' },
  { name: 'GitHub', url: 'https://github.com', icon: 'logo-github', color: '#333333' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'logo-twitter', color: '#1da1f2' },
  { name: 'Facebook', url: 'https://facebook.com', icon: 'logo-facebook', color: '#1877f2' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'logo-instagram', color: '#e4405f' },
  { name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: 'logo-whatsapp', color: '#25d366' },
  { name: 'Telegram', url: 'https://web.telegram.org', icon: 'paper-plane', color: '#0088cc' },
] as const;

export const MIME_TYPES = {
  // Images
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  
  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  
  // Archives
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  
  // Videos
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  
  // Audio
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
} as const;