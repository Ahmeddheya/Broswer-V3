export interface Tab {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  screenshotUrl?: string;
  createdAt: number;
  isActive: boolean;
}

export interface ClosedTab extends Omit<Tab, 'isActive'> {
  closedAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  favicon?: string;
  visitCount: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  folder: string;
  dateAdded: number;
  tags?: string[];
}

export interface DownloadItem {
  id: string;
  name: string;
  url: string;
  localPath?: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  dateStarted: number;
  dateCompleted?: number;
  error?: string;
}

export interface BrowserSettings {
  darkMode: boolean;
  nightMode: boolean;
  incognitoMode: boolean;
  desktopMode: boolean;
  adBlockEnabled: boolean;
  searchEngine: string;
  homepage: string;
  autoSaveHistory: boolean;
  maxHistoryItems: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}