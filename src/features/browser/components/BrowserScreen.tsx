import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { Button } from '@/shared/ui/buttons/Button';
import { useBrowserStore } from '@/shared/store/browser';
import { resolveSearchUrl, generateTabTitle } from '@/shared/lib/utils';
import { RTLView } from '@/shared/components/RTLView';
import { RTLText } from '@/shared/components/RTLText';
import { BrowserHeader } from './BrowserHeader';
import { BrowserNavigation } from './BrowserNavigation';
import { QuickAccessGrid } from './QuickAccessGrid';
import { WebViewContainer, WebViewContainerRef } from './WebViewContainer';
import { FindInPageModal } from './FindInPageModal';
import { MenuModal } from './MenuModal';
import { FadeIn } from '@/shared/ui/animations/FadeIn';
import { SlideIn } from '@/shared/ui/animations/SlideIn';
import { LoadingSpinner } from '@/shared/ui/feedback/LoadingSpinner';
import { Toast } from '@/shared/ui/feedback/Toast';
import { FloatingActionButton } from '@/shared/ui/buttons/FloatingActionButton';
import { usePerformanceMonitor } from '@/shared/hooks/usePerformanceMonitor';
import { useMemoryWarning } from '@/shared/hooks/useMemoryWarning';
import { useDebounce } from '@/shared/hooks/useDebounce';

export const BrowserScreen: React.FC = () => {
  const { t } = useTranslation();
  const { measureAsync } = usePerformanceMonitor('BrowserScreen');
  const memoryWarning = useMemoryWarning();
  const webViewRef = useRef<WebViewContainerRef>(null);
  const [url, setUrl] = useState('');
  const debouncedUrl = useDebounce(url, 300);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [showFindModal, setShowFindModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });
  
  const { 
    settings,
    currentTabId,
    activeTabs,
    getCurrentTab,
    createNewTab,
    updateTabUrl,
    updateTabTitle,
    addToHistory,
    addBookmark,
    isBookmarked,
    removeBookmark,
    updateSettings,
  } = useBrowserStore();

  // Memory cleanup on warning
  useEffect(() => {
    if (memoryWarning) {
      // Clear closed tabs to free memory
      if (closedTabs.length > 10) {
        const { clearClosedTabs } = useBrowserStore.getState();
        clearClosedTabs();
      }
    }
  }, [memoryWarning, closedTabs.length]);

  // Handle URL parameter from navigation
  useEffect(() => {
    const handleUrlParam = () => {
      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const paramUrl = params.get('url');
          if (paramUrl) {
            const decodedUrl = decodeURIComponent(paramUrl);
            setUrl(decodedUrl);
            setCurrentUrl(decodedUrl);
            setIsHomePage(false);
          }
        }
      } catch (error) {
        console.warn('Error handling URL parameter:', error);
      }
    };
    
    handleUrlParam();
  }, []);

  const handleSearch = () => {
    if (!debouncedUrl.trim()) return;
    
    measureAsync(async () => {
      const resolvedUrl = resolveSearchUrl(debouncedUrl, settings.searchEngine);
    setCurrentUrl(resolvedUrl);
    setIsHomePage(false);
    
    // Update current tab URL
    if (currentTabId) {
      updateTabUrl(currentTabId, resolvedUrl);
    }
    }, 'handleSearch');
    
    // Add to history if not in incognito mode
    if (!settings.incognitoMode) {
      addToHistory({
        title: generateTabTitle(resolvedUrl),
        url: resolvedUrl,
        favicon: 'globe-outline',
      });
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (!navState) return;
    
    setCurrentUrl(navState.url);
    setUrl(navState.url);
    setIsLoading(navState.loading);
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    
    // Update tab title when page loads
    if (!navState.loading && navState.title && currentTabId) {
      updateTabTitle(currentTabId, navState.title);
    }
  };

  const handleNewTab = () => {
    const tabId = createNewTab('https://www.google.com');
    setCurrentUrl('https://www.google.com');
    setUrl('https://www.google.com');
    setIsHomePage(false);
  };

  const goHome = () => {
    setIsHomePage(true);
    setCurrentUrl('');
    setUrl('');
  };

  const goBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    }
  };

  const goForward = () => {
    if (canGoForward) {
      webViewRef.current?.goForward();
    }
  };

  const reload = () => {
    webViewRef.current?.reload();
  };

  const openTabs = () => {
    router.push('/(tabs)/tabs');
  };

  const openMenu = () => {
  const openMenu = () => {
    setShowMenuModal(true);
  };

  const handleFindInPage = () => {
    setShowFindModal(true);
  };

  const handleBookmarkToggle = () => {
    if (!currentUrl) return;
    
    const currentTab = getCurrentTab();
    if (!currentTab) return;
    
    if (isBookmarked(currentUrl)) {
      const bookmark = useBrowserStore.getState().bookmarks.find(b => b.url === currentUrl);
      if (bookmark) {
        removeBookmark(bookmark.id);
        setToast({
          visible: true,
          message: t('browser.bookmarkRemoved'),
          type: 'info',
        });
      }
    } else {
      addBookmark({
        title: currentTab.title,
        url: currentUrl,
        folder: 'Default',
        favicon: currentTab.faviconUrl,
      });
      setToast({
        visible: true,
        message: t('browser.bookmarkAdded'),
        type: 'success',
      });
    }
  };

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && !isHomePage) {
          goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [canGoBack, isHomePage])
  );

  if (isHomePage) {
    return (
      <ScreenLayout>
        <FadeIn>
        <BrowserHeader
          title={t('common.title', 'Aura Browser')}
          onNewTab={handleNewTab}
          onReload={reload}
          incognitoMode={settings.incognitoMode}
          onFindInPage={handleFindInPage}
          onBookmark={handleBookmarkToggle}
          isBookmarked={isBookmarked(currentUrl)}
        />
        </FadeIn>
        
        <View className="flex-1 px-5">
          {/* Search Bar */}
          <SlideIn from="top" delay={100}>
            <View className="mt-6 mb-8">
            <SearchInput
              value={url}
              onChangeText={setUrl}
              onSubmit={handleSearch}
              placeholder={t('browser.searchOrTypeUrl')}
              autoFocus={false}
            />
            </View>
          </SlideIn>

          {/* Quick Access Grid */}
          <SlideIn from="bottom" delay={200}>
            <RTLText className="text-lg font-bold text-white mb-6">
              {t('browser.quickAccess')}
            </RTLText>
            <QuickAccessGrid
              onSitePress={(siteUrl) => {
                setCurrentUrl(siteUrl);
                setUrl(siteUrl);
                setIsHomePage(false);
              }}
            />
          </SlideIn>
        </View>

        <SlideIn from="bottom" delay={300}>
          <BrowserNavigation
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onBack={goBack}
            onForward={goForward}
            onHome={goHome}
            onTabs={openTabs}
            onMenu={openMenu}
            isHomePage={isHomePage}
            tabsCount={activeTabs.length}
          />
        </SlideIn>

        {/* Floating Action Button for New Tab */}
        <FloatingActionButton
          icon="add"
          onPress={handleNewTab}
          position="bottom-right"
        />

        {/* Toast */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <FadeIn>
      <BrowserHeader
        showUrlBar
        url={url}
        onUrlChange={setUrl}
        onUrlSubmit={handleSearch}
        isLoading={isLoading}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={goBack}
        onForward={goForward}
        onReload={reload}
        onNewTab={handleNewTab}
        onFindInPage={handleFindInPage}
        onBookmark={handleBookmarkToggle}
        isBookmarked={isBookmarked(currentUrl)}
        incognitoMode={settings.incognitoMode}
      />
      </FadeIn>
      
      <View className="flex-1">
        {/* Loading Indicator */}
        {isLoading && (
          <View className="absolute top-0 left-0 right-0 z-10">
            <View className="h-1 bg-primary-500/20">
              <View className="h-full bg-primary-500 animate-pulse" />
            </View>
          </View>
        )}

        <WebViewContainer
          ref={webViewRef}
          url={currentUrl}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(error) => console.warn('WebView error:', error)}
          incognitoMode={settings.incognitoMode}
          desktopMode={settings.desktopMode}
          nightMode={settings.nightMode}
        />
      </View>

      <SlideIn from="bottom">
        <BrowserNavigation
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={goBack}
          onForward={goForward}
          onHome={goHome}
          onTabs={openTabs}
          onMenu={openMenu}
          isHomePage={isHomePage}
          tabsCount={activeTabs.length}
        />
      </SlideIn>

      {/* Find in Page Modal */}
      <FindInPageModal
        visible={showFindModal}
        onClose={() => setShowFindModal(false)}
        onSearch={(text) => webViewRef.current?.findInPage(text)}
        onClear={() => webViewRef.current?.clearFindInPage()}
      />

      {/* Menu Modal */}
      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        currentUrl={currentUrl}
        isBookmarked={isBookmarked(currentUrl)}
        onBookmarkToggle={handleBookmarkToggle}
        onFindInPage={handleFindInPage}
        onShare={() => {
          // TODO: Implement share functionality
          Alert.alert('Share', 'Share functionality will be implemented');
        }}
        onSettings={() => {
          setShowMenuModal(false);
          router.push('/(tabs)/settings');
        }}
      />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </ScreenLayout>
  );
};