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
} from '../types';
import { DEFAULT_SETTINGS } from '../lib/constants';
import { generateId, resolveSearchUrl, generateTabTitle } from '../lib/utils';
import { cacheManager } from '../lib/cache';

const storage = new MMKV();

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
  updateTabUrl: (tabId: string, url: string, title?: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  updateTabFavicon: (tabId: string, faviconUrl: string) => void;
  setActiveTab: (tabId: string) => void;
  getCurrentTab: () => Tab | undefined;
  
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
  isBookmarked: (url: string) => boolean;
  
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
      
      updateTabUrl: (tabId, url, title) => {
        const resolvedUrl = resolveSearchUrl(url, get().settings.searchEngine);
        const tabTitle = title || generateTabTitle(resolvedUrl);
        
        set((state) => ({
          activeTabs: state.activeTabs.map(tab =>
            tab.id === tabId ? { ...tab, url: resolvedUrl, title: tabTitle } : tab
          ),
        }));
      },
      
      updateTabTitle: (tabId, title) => {
        set((state) => ({
          activeTabs: state.activeTabs.map(tab =>
            tab.id === tabId ? { ...tab, title } : tab
          ),
        }));
      },
      
      updateTabFavicon: (tabId, faviconUrl) => {
        set((state) => ({
          activeTabs: state.activeTabs.map(tab =>
            tab.id === tabId ? { ...tab, faviconUrl } : tab
          ),
        }));
      },
      
      setActiveTab: (tabId) => {
        set({ currentTabId: tabId });
      },
      
      getCurrentTab: () => {
        const state = get();
        return state.activeTabs.find(tab => tab.id === state.currentTabId);
      },
      
      // History actions
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

        // Cache frequently visited sites
        if (item.url && !state.settings.incognitoMode) {
          cacheManager.set(`site_${item.url}`, {
            title: item.title,
            favicon: item.favicon,
            lastVisit: Date.now(),
          }, 7 * 24 * 60 * 60 * 1000); // 7 days
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
        
        // Cache search results for better performance
        const cacheKey = `history_search_${query.toLowerCase()}`;
        const cached = cacheManager.get<HistoryItem[]>(cacheKey);
        
        if (cached) {
          return cached;
        }
        
        const lowercaseQuery = query.toLowerCase();
        
        const results = state.history.filter(item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.url.toLowerCase().includes(lowercaseQuery)
        );
        
        // Cache results for 5 minutes
        cacheManager.set(cacheKey, results, 5 * 60 * 1000);
        
        return results;
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
        
        // Cache search results
        const cacheKey = `bookmarks_search_${query.toLowerCase()}`;
        const cached = cacheManager.get<BookmarkItem[]>(cacheKey);
        
        if (cached) {
          return cached;
        }
        
        const lowercaseQuery = query.toLowerCase();
        
        const results = state.bookmarks.filter(item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.url.toLowerCase().includes(lowercaseQuery) ||
          item.folder.toLowerCase().includes(lowercaseQuery) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
        );
        
        // Cache results for 5 minutes
        cacheManager.set(cacheKey, results, 5 * 60 * 1000);
        
        return results;
      },
      
      isBookmarked: (url) => {
        const state = get();
        return state.bookmarks.some(bookmark => bookmark.url === url);
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