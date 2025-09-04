import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { Button } from '@/shared/ui/buttons/Button';
import { useBrowserStore } from '@/shared/store';
import { resolveSearchUrl, generateTabTitle } from '@/shared/lib/utils';
import { BrowserHeader } from './BrowserHeader';
import { BrowserNavigation } from './BrowserNavigation';
import { QuickAccessGrid } from './QuickAccessGrid';

export const BrowserScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  
  const { 
    settings,
    currentTabId,
    activeTabs,
    createNewTab,
    updateTabUrl,
    addToHistory,
    updateSettings,
  } = useBrowserStore();

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
    if (!url.trim()) return;
    
    const resolvedUrl = resolveSearchUrl(url, settings.searchEngine);
    setCurrentUrl(resolvedUrl);
    setIsHomePage(false);
    
    // Update current tab URL
    if (currentTabId) {
      updateTabUrl(currentTabId, resolvedUrl);
    }
    
    // Add to history if not in incognito mode
    if (!settings.incognitoMode) {
      addToHistory({
        title: generateTabTitle(resolvedUrl),
        url: resolvedUrl,
        favicon: 'globe-outline',
      });
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    if (!navState) return;
    
    setCurrentUrl(navState.url);
    setUrl(navState.url);
    setIsLoading(navState.loading);
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    
    // Add to history when page loads successfully
    if (!navState.loading && navState.url && navState.title && !settings.incognitoMode) {
      addToHistory({
        title: navState.title || generateTabTitle(navState.url),
        url: navState.url,
        favicon: 'globe-outline',
      });
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
    webViewRef.current?.goBack();
  };

  const goForward = () => {
    webViewRef.current?.goForward();
  };

  const reload = () => {
    webViewRef.current?.reload();
  };

  const openTabs = () => {
    router.push('/(tabs)/tabs');
  };

  const openMenu = () => {
    // Will implement menu modal in next part
    Alert.alert('Menu', 'Menu functionality will be implemented');
  };

  if (isHomePage) {
    return (
      <ScreenLayout>
        <BrowserHeader
          title="Aura Browser"
          onNewTab={handleNewTab}
          onReload={reload}
          incognitoMode={settings.incognitoMode}
        />
        
        <View className="flex-1 px-5">
          {/* Search Bar */}
          <View className="mt-6 mb-8">
            <SearchInput
              value={url}
              onChangeText={setUrl}
              onSubmit={handleSearch}
              placeholder="Search Google or type a URL"
              autoFocus={false}
            />
          </View>

          {/* Quick Access Grid */}
          <QuickAccessGrid
            onSitePress={(siteUrl) => {
              setCurrentUrl(siteUrl);
              setUrl(siteUrl);
              setIsHomePage(false);
            }}
          />
        </View>

        <BrowserNavigation
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={goBack}
          onForward={goForward}
          onHome={goHome}
          onTabs={openTabs}
          onMenu={openMenu}
          isHomePage={isHomePage}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
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
        incognitoMode={settings.incognitoMode}
      />
      
      <View className="flex-1">
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          className="flex-1"
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          userAgent={settings.desktopMode 
            ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            : undefined
          }
        />
      </View>

      <BrowserNavigation
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={goBack}
        onForward={goForward}
        onHome={goHome}
        onTabs={openTabs}
        onMenu={openMenu}
        isHomePage={isHomePage}
      />
    </ScreenLayout>
  );
};