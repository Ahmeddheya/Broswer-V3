import { renderHook, act } from '@testing-library/react-native';
import { useBrowserStore } from '../browser';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

describe('useBrowserStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBrowserStore.setState({
      activeTabs: [],
      closedTabs: [],
      currentTabId: undefined,
      history: [],
      bookmarks: [],
      downloads: [],
      settings: {
        darkMode: false,
        nightMode: false,
        incognitoMode: false,
        desktopMode: false,
        adBlockEnabled: true,
        searchEngine: 'google',
        homepage: 'https://www.google.com',
        autoSaveHistory: true,
        maxHistoryItems: 1000,
      },
    });
  });

  describe('Tab Management', () => {
    it('should create a new tab', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        const tabId = result.current.createNewTab('https://example.com');
        expect(tabId).toBeDefined();
      });

      expect(result.current.activeTabs).toHaveLength(1);
      expect(result.current.activeTabs[0].url).toBe('https://example.com');
      expect(result.current.currentTabId).toBe(result.current.activeTabs[0].id);
    });

    it('should close a tab and move it to closed tabs', () => {
      const { result } = renderHook(() => useBrowserStore());

      let tabId: string;
      act(() => {
        tabId = result.current.createNewTab('https://example.com');
      });

      act(() => {
        result.current.closeTab(tabId);
      });

      expect(result.current.activeTabs).toHaveLength(0);
      expect(result.current.closedTabs).toHaveLength(1);
      expect(result.current.closedTabs[0].url).toBe('https://example.com');
    });

    it('should restore a closed tab', () => {
      const { result } = renderHook(() => useBrowserStore());

      let tabId: string;
      act(() => {
        tabId = result.current.createNewTab('https://example.com');
        result.current.closeTab(tabId);
      });

      act(() => {
        result.current.restoreTab(tabId);
      });

      expect(result.current.activeTabs).toHaveLength(1);
      expect(result.current.closedTabs).toHaveLength(0);
      expect(result.current.activeTabs[0].url).toBe('https://example.com');
    });

    it('should update tab URL and title', () => {
      const { result } = renderHook(() => useBrowserStore());

      let tabId: string;
      act(() => {
        tabId = result.current.createNewTab();
      });

      act(() => {
        result.current.updateTabUrl(tabId, 'https://github.com', 'GitHub');
      });

      const updatedTab = result.current.activeTabs.find(tab => tab.id === tabId);
      expect(updatedTab?.url).toBe('https://github.com');
      expect(updatedTab?.title).toBe('GitHub');
    });
  });

  describe('History Management', () => {
    it('should add items to history', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.addToHistory({
          title: 'Example Site',
          url: 'https://example.com',
        });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].title).toBe('Example Site');
      expect(result.current.history[0].visitCount).toBe(1);
    });

    it('should increment visit count for existing URLs', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.addToHistory({
          title: 'Example Site',
          url: 'https://example.com',
        });
        result.current.addToHistory({
          title: 'Example Site Updated',
          url: 'https://example.com',
        });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].visitCount).toBe(2);
      expect(result.current.history[0].title).toBe('Example Site Updated');
    });

    it('should not save history in incognito mode', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.updateSettings({ incognitoMode: true });
        result.current.addToHistory({
          title: 'Example Site',
          url: 'https://example.com',
        });
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should search history correctly', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.addToHistory({
          title: 'GitHub',
          url: 'https://github.com',
        });
        result.current.addToHistory({
          title: 'Google',
          url: 'https://google.com',
        });
      });

      const searchResults = result.current.searchHistory('git');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('GitHub');
    });
  });

  describe('Bookmarks Management', () => {
    it('should add bookmarks', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.addBookmark({
          title: 'GitHub',
          url: 'https://github.com',
          folder: 'Work',
        });
      });

      expect(result.current.bookmarks).toHaveLength(1);
      expect(result.current.bookmarks[0].title).toBe('GitHub');
      expect(result.current.bookmarks[0].folder).toBe('Work');
    });

    it('should check if URL is bookmarked', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.addBookmark({
          title: 'GitHub',
          url: 'https://github.com',
          folder: 'Work',
        });
      });

      expect(result.current.isBookmarked('https://github.com')).toBe(true);
      expect(result.current.isBookmarked('https://example.com')).toBe(false);
    });

    it('should search bookmarks correctly', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.addBookmark({
          title: 'GitHub',
          url: 'https://github.com',
          folder: 'Work',
          tags: ['development', 'code'],
        });
        result.current.addBookmark({
          title: 'Google',
          url: 'https://google.com',
          folder: 'Search',
        });
      });

      const searchResults = result.current.searchBookmarks('development');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('GitHub');
    });
  });

  describe('Settings Management', () => {
    it('should update settings', () => {
      const { result } = renderHook(() => useBrowserStore());

      act(() => {
        result.current.updateSettings({
          darkMode: true,
          searchEngine: 'duckduckgo',
        });
      });

      expect(result.current.settings.darkMode).toBe(true);
      expect(result.current.settings.searchEngine).toBe('duckduckgo');
    });
  });
});