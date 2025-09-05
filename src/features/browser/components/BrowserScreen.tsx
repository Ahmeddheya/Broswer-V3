import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, BackHandler } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { Button } from '@/shared/ui/buttons/Button';
import { useBrowserStore } from '@/shared/store/browser';
import { resolveSearchUrl, generateTabTitle } from '@/shared/lib/utils';

const QUICK_ACCESS_SITES = [
  { name: 'Google', url: 'https://google.com', icon: 'search', color: '#4285f4' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', color: '#ff0000' },
  { name: 'GitHub', url: 'https://github.com', icon: 'logo-github', color: '#333333' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'logo-twitter', color: '#1da1f2' },
  { name: 'Facebook', url: 'https://facebook.com', icon: 'logo-facebook', color: '#1877f2' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'logo-instagram', color: '#e4405f' },
  { name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: 'logo-whatsapp', color: '#25d366' },
  { name: 'Telegram', url: 'https://web.telegram.org', icon: 'paper-plane', color: '#0088cc' },
];

export const BrowserScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [showFindModal, setShowFindModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [findText, setFindText] = useState('');
  
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
        favicon: undefined,
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
        Alert.alert('Bookmark Removed', 'Bookmark has been removed');
      }
    } else {
      addBookmark({
        title: currentTab.title,
        url: currentUrl,
        folder: 'Default',
        favicon: currentTab.faviconUrl,
      });
      Alert.alert('Bookmark Added', 'Bookmark has been added');
    }
  };

  const handleSitePress = (siteUrl: string) => {
    setCurrentUrl(siteUrl);
    setUrl(siteUrl);
    setIsHomePage(false);
  };

  const handleFindInPageSearch = () => {
    if (findText.trim() && webViewRef.current) {
      const script = `
        if (window.find) {
          window.find('${findText}', false, false, true, false, true, false);
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handleClearFind = () => {
    if (webViewRef.current) {
      const script = `
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
    setFindText('');
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={reload} style={styles.headerButton}>
              <Ionicons name="refresh-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.headerTitle}>
              <Text style={[styles.title, settings.incognitoMode && styles.incognitoTitle]}>
                Aura Browser
              </Text>
              {settings.incognitoMode && (
                <Text style={styles.incognitoLabel}>Incognito</Text>
              )}
            </View>
            
            <TouchableOpacity onPress={handleNewTab} style={styles.headerButton}>
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchInput
              value={url}
              onChangeText={setUrl}
              onSubmit={handleSearch}
              placeholder="Search Google or type a URL"
              autoFocus={false}
            />
          </View>

          {/* Quick Access Grid */}
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {QUICK_ACCESS_SITES.map((site, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSitePress(site.url)}
                style={styles.quickAccessItem}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${site.color}20` }]}>
                  <Ionicons 
                    name={site.icon as keyof typeof Ionicons.glyphMap} 
                    size={28} 
                    color={site.color} 
                  />
                </View>
                <Text style={styles.quickAccessText} numberOfLines={1}>
                  {site.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={goBack}
            disabled={!canGoBack && !isHomePage}
            style={[styles.navButton, (!canGoBack && !isHomePage) && styles.navButtonDisabled]}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={canGoBack || isHomePage ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goForward}
            disabled={!canGoForward}
            style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={canGoForward ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goHome}
            style={[styles.navButton, isHomePage && styles.navButtonActive]}
          >
            <Ionicons 
              name="home" 
              size={24} 
              color={isHomePage ? '#4285f4' : '#ffffff'} 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={openTabs} style={styles.navButton}>
            <Ionicons name="copy-outline" size={24} color="#ffffff" />
            {activeTabs.length > 0 && (
              <View style={styles.tabsBadge}>
                <Text style={styles.tabsBadgeText}>
                  {activeTabs.length > 99 ? '99+' : activeTabs.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={openMenu} style={styles.navButton}>
            <Ionicons name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Browser Header with URL Bar */}
      <View style={styles.browserHeader}>
        <View style={styles.browserHeaderContent}>
          {/* Navigation Buttons */}
          <TouchableOpacity
            onPress={goBack}
            disabled={!canGoBack}
            style={[styles.browserNavButton, !canGoBack && styles.navButtonDisabled]}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={canGoBack ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={goForward}
            disabled={!canGoForward}
            style={[styles.browserNavButton, !canGoForward && styles.navButtonDisabled]}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={canGoForward ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={reload} style={styles.browserNavButton}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* URL Bar */}
          <View style={styles.urlBarContainer}>
            <SearchInput
              value={url}
              onChangeText={setUrl}
              onSubmit={handleSearch}
              placeholder="Search Google or type a URL"
              leftIcon={url.startsWith('https') ? 'lock-closed' : 'globe-outline'}
              style={styles.urlBar}
            />
          </View>
          
          <TouchableOpacity onPress={handleBookmarkToggle} style={styles.browserNavButton}>
            <Ionicons 
              name={isBookmarked(currentUrl) ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={isBookmarked(currentUrl) ? "#4CAF50" : "#ffffff"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleNewTab} style={styles.browserNavButton}>
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.webViewContainer}>
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <View style={styles.loadingBar} />
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(error) => console.warn('WebView error:', error)}
          javaScriptEnabled={true}
          domStorageEnabled={!settings.incognitoMode}
          thirdPartyCookiesEnabled={!settings.incognitoMode}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          cacheEnabled={!settings.incognitoMode}
          incognito={settings.incognitoMode}
          userAgent={settings.desktopMode ? 
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' : 
            undefined
          }
          injectedJavaScript={`
            // Night mode CSS injection
            ${settings.nightMode ? `
              (function() {
                const style = document.createElement('style');
                style.textContent = \`
                  * {
                    filter: invert(1) hue-rotate(180deg) !important;
                  }
                  img, video {
                    filter: invert(1) hue-rotate(180deg) !important;
                  }
                \`;
                document.head.appendChild(style);
              })();
            ` : ''}
            
            // Ad blocking (basic)
            ${settings.adBlockEnabled ? `
              (function() {
                const adSelectors = [
                  '[class*="ad"]',
                  '[id*="ad"]',
                  '.advertisement',
                  '.banner',
                  '.popup'
                ];
                
                adSelectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(el => el.style.display = 'none');
                });
              })();
            ` : ''}
            
            true;
          `}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={goBack}
          disabled={!canGoBack}
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={canGoBack ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goForward}
          disabled={!canGoForward}
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={canGoForward ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goHome}
          style={[styles.navButton, isHomePage && styles.navButtonActive]}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={isHomePage ? '#4285f4' : '#ffffff'} 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openTabs} style={styles.navButton}>
          <Ionicons name="copy-outline" size={24} color="#ffffff" />
          {activeTabs.length > 0 && (
            <View style={styles.tabsBadge}>
              <Text style={styles.tabsBadgeText}>
                {activeTabs.length > 99 ? '99+' : activeTabs.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={openMenu} style={styles.navButton}>
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Find in Page Modal */}
      {showFindModal && (
        <View style={styles.findModal}>
          <View style={styles.findModalContent}>
            <Text style={styles.findModalTitle}>Find in Page</Text>
            <SearchInput
              value={findText}
              onChangeText={setFindText}
              placeholder="Search in page..."
              autoFocus
              style={styles.findInput}
            />
            <View style={styles.findButtons}>
              <Button
                title="Search"
                onPress={handleFindInPageSearch}
                disabled={!findText.trim()}
                style={styles.findButton}
              />
              <Button
                title="Clear"
                onPress={handleClearFind}
                variant="outline"
                style={styles.findButton}
              />
              <Button
                title="Close"
                onPress={() => setShowFindModal(false)}
                variant="ghost"
                style={styles.findButton}
              />
            </View>
          </View>
        </View>
      )}

      {/* Menu Modal */}
      {showMenuModal && (
        <View style={styles.menuModal}>
          <View style={styles.menuModalContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Browser Menu</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={handleBookmarkToggle}
              style={styles.menuItem}
            >
              <Ionicons 
                name={isBookmarked(currentUrl) ? 'bookmark' : 'bookmark-outline'} 
                size={20} 
                color={isBookmarked(currentUrl) ? '#4CAF50' : '#ffffff'} 
              />
              <Text style={styles.menuItemText}>
                {isBookmarked(currentUrl) ? 'Remove Bookmark' : 'Add Bookmark'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowMenuModal(false);
                handleFindInPage();
              }}
              style={styles.menuItem}
            >
              <Ionicons name="search" size={20} color="#ffffff" />
              <Text style={styles.menuItemText}>Find in Page</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                updateSettings({ desktopMode: !settings.desktopMode });
                setShowMenuModal(false);
              }}
              style={styles.menuItem}
            >
              <Ionicons 
                name={settings.desktopMode ? 'phone-portrait' : 'desktop'} 
                size={20} 
                color="#ffffff" 
              />
              <Text style={styles.menuItemText}>
                {settings.desktopMode ? 'Mobile Site' : 'Desktop Site'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                updateSettings({ nightMode: !settings.nightMode });
                setShowMenuModal(false);
              }}
              style={styles.menuItem}
            >
              <Ionicons 
                name={settings.nightMode ? 'sunny' : 'moon'} 
                size={20} 
                color="#ffffff" 
              />
              <Text style={styles.menuItemText}>
                {settings.nightMode ? 'Day Mode' : 'Night Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowMenuModal(false);
                router.push('/(tabs)/settings');
              }}
              style={styles.menuItem}
            >
              <Ionicons name="settings-outline" size={20} color="#ffffff" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(26, 27, 58, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  incognitoTitle: {
    color: '#ff6b6b',
  },
  incognitoLabel: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 24,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  browserHeader: {
    backgroundColor: 'rgba(26, 27, 58, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  browserHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  browserNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  urlBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  urlBar: {
    minHeight: 40,
  },
  webViewContainer: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loadingBar: {
    height: 4,
    backgroundColor: '#4285f4',
    opacity: 0.8,
  },
  webView: {
    flex: 1,
  },
  navigation: {
    backgroundColor: 'rgba(26, 27, 58, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonActive: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
  },
  tabsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  findModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  findModalContent: {
    backgroundColor: '#1a1b3a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  findModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  findInput: {
    marginBottom: 16,
  },
  findButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  findButton: {
    flex: 1,
  },
  menuModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuModalContent: {
    backgroundColor: '#1a1b3a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
});