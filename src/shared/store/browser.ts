import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Tab {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
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

const DEFAULT_SETTINGS: BrowserSettings = {
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

interface BrowserState {
  settings: BrowserSettings;
  activeTabs: Tab[];
  closedTabs: ClosedTab[];
  currentTabId?: string;
  history: HistoryItem[];
  bookmarks: BookmarkItem[];
  isLoading: boolean;

  // Actions
  updateSettings: (updates: Partial<BrowserSettings>) => void;
  createNewTab: (url?: string) => string;
  closeTab: (tabId: string) => void;
  restoreTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabUrl: (tabId: string, url: string, title?: string) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>) => void;
  addBookmark: (item: Omit<BookmarkItem, 'id' | 'dateAdded'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (url: string) => boolean;
  clearHistory: () => void;
  initialize: () => Promise<void>;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const resolveSearchUrl = (input: string, searchEngine: string = 'google'): string => {
  const trimmed = input.trim();
  if (!trimmed) return 'https://www.google.com';
  
  const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([:\/\?#].*)?$/i;
  
  if (urlPattern.test(trimmed)) {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }
  
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
};

const generateTabTitle = (url: string): string => {
  if (!url || url === 'about:blank') return 'New Tab';
  if (url.includes('google.com/search')) return 'Google Search';
  
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    const siteName = domain.split('.')[0];
    return siteName.charAt(0).toUpperCase() + siteName.slice(1);
  } catch {
    return 'New Tab';
  }
};

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      activeTabs: [],
      closedTabs: [],
      currentTabId: undefined,
      history: [],
      bookmarks: [],
      isLoading: false,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      createNewTab: (url) => {
        const resolvedUrl = url ? resolveSearchUrl(url, get().settings.searchEngine) : 'https://www.google.com';
        const newTab: Tab = {
          id: generateId(),
          title: generateTabTitle(resolvedUrl),
          url: resolvedUrl,
          createdAt: Date.now(),
          isActive: true,
        };
        
        set((state) => ({
          activeTabs: [...state.activeTabs, newTab],
          currentTabId: newTab.id,
        }));
        
        return newTab.id;
      },

      closeTab: (tabId) => {
        const state = get();
        const tabToClose = state.activeTabs.find(tab => tab.id === tabId);
        
        if (tabToClose) {
          const closedTab: ClosedTab = {
            ...tabToClose,
            closedAt: Date.now(),
          };
          delete (closedTab as any).isActive;
          
          const remainingTabs = state.activeTabs.filter(tab => tab.id !== tabId);
          const newCurrentTabId = state.currentTabId === tabId 
            ? remainingTabs[remainingTabs.length - 1]?.id 
            : state.currentTabId;
          
          set({
            activeTabs: remainingTabs,
            closedTabs: [closedTab, ...state.closedTabs].slice(0, 50),
            currentTabId: newCurrentTabId,
          });
        }
      },

      restoreTab: (tabId) => {
        const state = get();
        const tabToRestore = state.closedTabs.find(tab => tab.id === tabId);
        
        if (tabToRestore) {
          const { closedAt, ...restoredTab } = tabToRestore;
          const activeTab: Tab = {
            ...restoredTab,
            isActive: true,
          };
          
          set((state) => ({
            closedTabs: state.closedTabs.filter(tab => tab.id !== tabId),
            activeTabs: [...state.activeTabs, activeTab],
            currentTabId: activeTab.id,
          }));
        }
      },

      setActiveTab: (tabId) => {
        set({ currentTabId: tabId });
      },

      updateTabUrl: (tabId, url, title) => {
        const resolvedUrl = resolveSearchUrl(url, get().settings.searchEngine);
        const tabTitle = title || generateTabTitle(resolvedUrl);
        
        set((state) => ({
          activeTabs: state.activeTabs.map(tab =>
            tab.id === tabId ? { ...tab, url: resolvedUrl, title: tabTitle } : tab
          ),
        }));
      },

      addToHistory: (item) => {
        const state = get();
        if (!state.settings.autoSaveHistory || state.settings.incognitoMode) {
          return;
        }
        
        const existingIndex = state.history.findIndex(h => h.url === item.url);
        
        if (existingIndex >= 0) {
          set((state) => ({
            history: state.history.map((h, index) =>
              index === existingIndex
                ? { ...h, title: item.title, timestamp: Date.now(), visitCount: h.visitCount + 1 }
                : h
            ),
          }));
        } else {
          const newItem: HistoryItem = {
            ...item,
            id: generateId(),
            timestamp: Date.now(),
            visitCount: 1,
          };
          
          set((state) => ({
            history: [newItem, ...state.history].slice(0, state.settings.maxHistoryItems),
          }));
        }
      },

      addBookmark: (item) => {
        const newBookmark: BookmarkItem = {
          ...item,
          id: generateId(),
          dateAdded: Date.now(),
        };
        
        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(item => item.id !== id),
        }));
      },

      isBookmarked: (url) => {
        const state = get();
        return state.bookmarks.some(bookmark => bookmark.url === url);
      },

      clearHistory: () => {
        set({ history: [] });
      },

      initialize: async () => {
        set({ isLoading: true });
        
        try {
          const state = get();
          if (state.activeTabs.length === 0) {
            state.createNewTab();
          }
        } catch (error) {
          console.error('Failed to initialize browser store:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'browser-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        activeTabs: state.activeTabs,
        closedTabs: state.closedTabs,
        currentTabId: state.currentTabId,
        history: state.history,
        bookmarks: state.bookmarks,
      }),
    }
  )
);