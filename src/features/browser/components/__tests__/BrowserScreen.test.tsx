import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BrowserScreen } from '../BrowserScreen';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}));

jest.mock('@/shared/store/browser', () => ({
  useBrowserStore: () => ({
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
    activeTabs: [],
    currentTabId: undefined,
    createNewTab: jest.fn(() => 'tab-1'),
    updateTabUrl: jest.fn(),
    updateTabTitle: jest.fn(),
    addToHistory: jest.fn(),
    addBookmark: jest.fn(),
    isBookmarked: jest.fn(() => false),
    removeBookmark: jest.fn(),
    updateSettings: jest.fn(),
    getCurrentTab: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: { language: 'en' },
  }),
}));

describe('BrowserScreen', () => {
  it('renders homepage correctly', () => {
    const { getByText, getByPlaceholderText } = render(<BrowserScreen />);
    
    expect(getByText('Aura Browser')).toBeTruthy();
    expect(getByPlaceholderText('browser.searchOrTypeUrl')).toBeTruthy();
  });

  it('handles search input correctly', async () => {
    const { getByPlaceholderText } = render(<BrowserScreen />);
    
    const searchInput = getByPlaceholderText('browser.searchOrTypeUrl');
    
    fireEvent.changeText(searchInput, 'test search');
    expect(searchInput.props.value).toBe('test search');
  });

  it('creates new tab when button is pressed', () => {
    const { getByText } = render(<BrowserScreen />);
    
    // This would need to be adjusted based on actual implementation
    // as the new tab button might be in different locations
  });

  it('shows quick access grid on homepage', () => {
    const { getByText } = render(<BrowserScreen />);
    
    expect(getByText('browser.quickAccess')).toBeTruthy();
  });
});