import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { 
  Tab, 
  ClosedTab, 
  HistoryItem, 
  BookmarkItem, 
  DownloadItem, 
  BrowserSettings 
} from '@/shared/types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/shared/lib/constants';
import { generateId, resolveSearchUrl, generateTabTitle } from '@/shared/lib/utils';

// Initialize MMKV storage
const storage = new MMKV();

// Custom storage adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

interface BrowserState {
  // Settings
  settings: BrowserSettings;
  updateSettings: (updates: Partial<BrowserSettings>) => void;
  
  // Tabs Management
  activeTabs: Tab[];
  closedTabs: ClosedTab[];
  currentTabId?: string;
  
  createNewTab: (url?: string) => string;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  restoreTab: (tabId: string) => void;
  clearClosedTabs: () => void;
  updateTabUrl: (tabId: string, url: string) => void;
  setActiveTab: (tabId: string) => void;
  
  // History Management
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  searchHistory: (query: string) => HistoryItem[];
  
  // Bookmarks Management
  bookmarks: BookmarkItem[];
  addBookmark: (item: Omit<BookmarkItem, 'id' | 'dateAdded'>) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<BookmarkItem>) => void;
  searchBookmarks: (query: string) => BookmarkItem[];
  
  // Downloads Management
  downloads: DownloadItem[];
  addDownload: (item: Omit<DownloadItem, 'id' | 'dateStarted'>) => string;
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  clearDownloads: () => void;
  
  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Initialization
  initialize: () => Promise<void>;
}

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      activeTabs: [],
      closedTabs: [],
      currentTabId: undefined,
      history: [],
      bookmarks: [],
      downloads: [],
      isLoading: false,
      
      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },
      
      // Tabs actions
      createNewTab: (url) => {
        const resolvedUrl = url ? resolveSearchUrl(url) : 'https://www.google.com';
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
          
          set((state) => ({
            activeTabs: state.activeTabs.filter(tab => tab.id !== tabId),
            closedTabs: [closedTab, ...state.closedTabs].slice(0, 50), // Keep last 50
            currentTabId: state.currentTabId === tabId 
              ? state.activeTabs.find(t => t.id !== tabId)?.id 
              : state.currentTabId,
          }));
        }
      },
      
      closeAllTabs: () => {
        const state = get();
        const closedTabs: ClosedTab[] = state.activeTabs.map(tab => ({
          ...tab,
          closedAt: Date.now(),
        }));
        
        set({
          activeTabs: [],
          closedTabs: [...closedTabs, ...state.closedTabs].slice(0, 50),
          currentTabId: undefined,
        });
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
      
      clearClosedTabs: () => {
        set({ closedTabs: [] });
      },
      
      updateTabUrl: (tabId, url) => {
        const resolvedUrl = resolveSearchUrl(url);
        const title = generateTabTitle(resolvedUrl);
        
        set((state) => ({
          activeTabs: state.activeTabs.map(tab =>
            tab.id === tabId ? { ...tab, url: resolvedUrl, title } : tab
          ),
        }));
      },
      
      setActiveTab: (tabId) => {
        set({ currentTabId: tabId });
      },
      
      // History actions
      addToHistory: (item) => {
        const state = get();
        if (!state.settings.autoSaveHistory || state.settings.incognitoMode) {
          return;
        }
        
        const existingIndex = state.history.findIndex(h => h.url === item.url);
        
        if (existingIndex >= 0) {
          // Update existing item
          set((state) => ({
            history: state.history.map((h, index) =>
              index === existingIndex
                ? { ...h, title: item.title, timestamp: Date.now(), visitCount: h.visitCount + 1 }
                : h
            ),
          }));
        } else {
          // Add new item
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
      
      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter(item => item.id !== id),
        }));
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      searchHistory: (query) => {
        const state = get();
        const lowercaseQuery = query.toLowerCase();
        
        return state.history.filter(item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.url.toLowerCase().includes(lowercaseQuery)
        );
      },
      
      // Bookmarks actions
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
      
      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },
      
      searchBookmarks: (query) => {
        const state = get();
        const lowercaseQuery = query.toLowerCase();
        
        return state.bookmarks.filter(item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.url.toLowerCase().includes(lowercaseQuery) ||
          item.folder.toLowerCase().includes(lowercaseQuery) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
        );
      },
      
      // Downloads actions
      addDownload: (item) => {
        const newDownload: DownloadItem = {
          ...item,
          id: generateId(),
          dateStarted: Date.now(),
        };
        
        set((state) => ({
          downloads: [newDownload, ...state.downloads],
        }));
        
        return newDownload.id;
      },
      
      updateDownload: (id, updates) => {
        set((state) => ({
          downloads: state.downloads.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },
      
      removeDownload: (id) => {
        set((state) => ({
          downloads: state.downloads.filter(item => item.id !== id),
        }));
      },
      
      clearDownloads: () => {
        set({ downloads: [] });
      },
      
      // UI actions
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      // Initialization
      initialize: async () => {
        set({ isLoading: true });
        
        try {
          // Initialize with default tab if no tabs exist
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
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        settings: state.settings,
        activeTabs: state.activeTabs,
        closedTabs: state.closedTabs,
        currentTabId: state.currentTabId,
        history: state.history,
        bookmarks: state.bookmarks,
        downloads: state.downloads,
      }),
    }
  )
);