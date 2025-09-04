import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  TextInput,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBrowserStore } from '@/store/browserStore';
import { router } from 'expo-router';
import {
  responsiveSpacing,
  responsiveFontSize,
  responsiveIconSize,
  responsiveWidth,
  responsiveHeight,
  responsiveBorderRadius,
  isSmallScreen,
} from '../../utils/responsive';

const TabsScreen = React.memo(() => {
  const {
    activeTabs,
    closedTabs,
    createNewTab,
    closeTab,
    closeAllActive,
    restoreClosedTab,
    clearAllClosed,
    loadTabs,
    setActiveTab,
    currentTabId,
  } = useBrowserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'domain'>('recent');
  const [showSearch, setShowSearch] = useState(false);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Animate search bar
  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showSearch]);

  // Animate content fade in
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  useEffect(() => {
    const initializeTabs = async () => {
      setIsLoading(true);
      try {
        await loadTabs();
      } catch (error) {
        console.error('Failed to load tabs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTabs();
  }, [loadTabs]);

  const handleCreateNewTab = useCallback(() => {
    const tabId = createNewTab();
    // Navigate to browser with Google search page
    router.replace('/?url=https://www.google.com');
  }, [createNewTab]);

  const handleCloseTab = useCallback((tabId: string) => {
    closeTab(tabId);
  }, [closeTab]);

  const handleRestoreTab = useCallback((tabId: string) => {
    restoreClosedTab(tabId);
  }, [restoreClosedTab]);

  const handleClearAllClosed = () => {
    Alert.alert(
      'Clear All Recently Closed',
      'Are you sure you want to clear all recently closed tabs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllClosed }
      ]
    );
  };

  const handleCloseAllActive = () => {
    Alert.alert(
      'Close All Active Tabs',
      'Are you sure you want to close all active tabs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Close All', style: 'destructive', onPress: closeAllActive }
      ]
    );
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const handleTabPress = useCallback((tabId: string) => {
    setActiveTab(tabId);
    // Get the tab URL and navigate to it
    const tab = activeTabs.find(t => t.id === tabId);
    const tabUrl = tab?.url || 'https://www.google.com';
    router.replace(`/?url=${encodeURIComponent(tabUrl)}`);
  }, [setActiveTab]);

  const handleSortChange = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const sortOptions: Array<'recent' | 'alphabetical' | 'domain'> = ['recent', 'alphabetical', 'domain'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  }, [sortBy]);

  const toggleSearch = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
    }
  }, [showSearch]);

  // Filter and sort tabs
  const filteredActiveTabs = useMemo(() => {
    let filtered = activeTabs.filter(tab => 
      tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'domain':
        return filtered.sort((a, b) => getDomainFromUrl(a.url).localeCompare(getDomainFromUrl(b.url)));
      case 'recent':
      default:
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [activeTabs, searchQuery, sortBy]);

  const filteredClosedTabs = useMemo(() => {
    let filtered = closedTabs.filter(tab => 
      tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));
  }, [closedTabs, searchQuery]);

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#0a0b1e', '#1a1b3a', '#2a2b4a']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285f4" />
            <Text style={styles.loadingText}>Loading tabs...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0b1e', '#1a1b3a', '#2a2b4a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView 
          style={[styles.content, { opacity: fadeAnimation }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Create New Tab Button */}
          <TouchableOpacity style={styles.createNewTabButton} onPress={handleCreateNewTab}>
            <LinearGradient
              colors={['#4285f4', '#5a95f5']}
              style={styles.createNewTabGradient}
            >
              <Ionicons name="add-circle-outline" size={responsiveIconSize(24)} color="#ffffff" />
              <Text style={styles.createNewTabText}>Create New Tab</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Search and Filter Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={[styles.controlButton, showSearch && styles.activeControlButton]} 
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={20} color={showSearch ? '#4CAF50' : '#ffffff'} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleSortChange}>
              <Ionicons name="funnel" size={20} color="#ffffff" />
              <Text style={styles.controlButtonText}>
                {sortBy === 'recent' ? 'حديث' : sortBy === 'alphabetical' ? 'أبجدي' : 'نطاق'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.tabsCount}>
              <Text style={styles.tabsCountText}>
                {filteredActiveTabs.length} نشط • {filteredClosedTabs.length} مغلق
              </Text>
            </View>
          </View>

          {/* Search Input */}
          {showSearch && (
            <Animated.View 
              style={[
                styles.searchContainer,
                {
                  opacity: searchAnimation,
                  transform: [{
                    translateY: searchAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })
                  }]
                }
              ]}
            >
              <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="البحث في التبويبات..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              )}
            </Animated.View>
             )}

          {/* Active Tabs Section */}
          {filteredActiveTabs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Tabs ({filteredActiveTabs.length})</Text>
                <TouchableOpacity style={styles.clearAllButton} onPress={handleCloseAllActive}>
                  <Text style={styles.clearAllButtonText}>Close All</Text>
                </TouchableOpacity>
              </View>
              
              {filteredActiveTabs.map((tab) => (
                <TouchableOpacity 
                  key={tab.id} 
                  style={[styles.tabItem, currentTabId === tab.id && styles.activeTabItem]}
                  onPress={() => handleTabPress(tab.id)}
                >
                  <View style={styles.tabIcon}>
                    <Ionicons 
                      name={currentTabId === tab.id ? "globe" : "globe-outline"} 
                      size={responsiveIconSize(20)} 
                      color={currentTabId === tab.id ? "#4CAF50" : "#4285f4"} 
                    />
                  </View>
                  <View style={styles.tabInfo}>
                    <Text style={[styles.tabTitle, currentTabId === tab.id && styles.activeTabTitle]} numberOfLines={1}>
                      {tab.title}
                    </Text>
                    <Text style={styles.tabUrl} numberOfLines={1}>
                      {getDomainFromUrl(tab.url)}
                    </Text>
                    <Text style={styles.timeAgo}>{formatTimeAgo(tab.createdAt)}</Text>
                  </View>
                  <View style={styles.tabActions}>
                    {currentTabId === tab.id && (
                      <View style={styles.activeIndicator}>
                        <Text style={styles.activeIndicatorText}>نشط</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.tabActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.id);
                      }}
                    >
                      <Ionicons name="close" size={responsiveIconSize(18)} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recent Closed Section */}
          {filteredClosedTabs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Closed ({filteredClosedTabs.length})</Text>
                <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAllClosed}>
                  <Text style={styles.clearAllButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              {filteredClosedTabs.map((tab) => (
                <View key={tab.id} style={styles.closedTabItem}>
                  <View style={styles.tabIcon}>
                    <Ionicons name="time-outline" size={responsiveIconSize(20)} color="#ff9800" />
                  </View>
                  <View style={styles.tabInfo}>
                    <Text style={styles.tabTitle} numberOfLines={1}>
                      {tab.title}
                    </Text>
                    <Text style={styles.tabUrl} numberOfLines={1}>
                      {getDomainFromUrl(tab.url)}
                    </Text>
                    <Text style={styles.timeAgo}>
                      أُغلق {getTimeAgo(tab.closedAt)}
                    </Text>
                  </View>
                  <View style={styles.tabActions}>
                    <TouchableOpacity
                      style={[styles.tabActionButton, styles.restoreButton]}
                      onPress={() => handleRestoreTab(tab.id)}
                    >
                      <MaterialIcons name="restore" size={responsiveIconSize(18)} color="#4285f4" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabActionButton, styles.deleteButton]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Tab',
                          'Are you sure you want to permanently delete this tab?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => {
                              // For now, just remove from closed tabs
                              // In a real implementation, you might want a separate delete function
                            }}
                          ]
                        );
                      }}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={responsiveIconSize(18)} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {filteredActiveTabs.length === 0 && filteredClosedTabs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={responsiveIconSize(64)} color="#4285f4" />
              <Text style={styles.emptyTitle}>No Tabs Yet</Text>
              <Text style={styles.emptySubtitle}>Create your first tab to start browsing</Text>
            </View>
          )}
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
});

export default TabsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: responsiveFontSize(16),
    marginTop: responsiveSpacing(16),
  },
  content: {
    flex: 1,
    padding: responsiveSpacing(20),
  },
  createNewTabButton: {
    borderRadius: responsiveBorderRadius(16),
    marginBottom: responsiveSpacing(24),
    elevation: 4,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createNewTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    borderRadius: responsiveBorderRadius(16),
  },
  createNewTabText: {
    color: '#ffffff',
    fontSize: responsiveFontSize(18),
    fontWeight: '700',
    marginLeft: responsiveSpacing(12),
  },
  section: {
    marginBottom: responsiveSpacing(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '700',
    color: '#ffffff',
  },
  clearAllButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: responsiveBorderRadius(8),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  clearAllButtonText: {
    color: '#ff6b6b',
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: responsiveBorderRadius(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closedTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: responsiveBorderRadius(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  tabIcon: {
    width: responsiveWidth(40),
    height: responsiveHeight(40),
    borderRadius: responsiveBorderRadius(20),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  tabInfo: {
    flex: 1,
    marginRight: responsiveSpacing(12),
  },
  tabTitle: {
    color: '#ffffff',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    marginBottom: responsiveSpacing(4),
  },
  tabUrl: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: responsiveFontSize(14),
  },
  timeAgo: {
    color: '#ff9800',
    fontSize: responsiveFontSize(12),
    marginTop: responsiveSpacing(4),
  },
  tabActions: {
    flexDirection: 'row',
  },
  tabActionButton: {
    width: responsiveWidth(36),
    height: responsiveHeight(36),
    borderRadius: responsiveBorderRadius(18),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveSpacing(8),
  },
  restoreButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing(60),
    paddingHorizontal: responsiveSpacing(40),
  },
  emptyTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: '700',
    color: '#ffffff',
    marginTop: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(16),
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: responsiveFontSize(22),
  },
  activeTabItem: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  activeTabTitle: {
    color: '#4CAF50',
  },
  activeIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: responsiveBorderRadius(8),
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    marginRight: responsiveSpacing(8),
  },
  activeIndicatorText: {
    color: '#4CAF50',
    fontSize: responsiveFontSize(10),
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
    gap: responsiveSpacing(12),
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: responsiveBorderRadius(8),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    gap: responsiveSpacing(6),
  },
  activeControlButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  tabsCount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tabsCountText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: responsiveFontSize(12),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: responsiveBorderRadius(12),
    paddingHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
  },
  searchIcon: {
    marginRight: responsiveSpacing(8),
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: responsiveFontSize(16),
    paddingVertical: responsiveSpacing(12),
  },
  clearSearchButton: {
    padding: responsiveSpacing(4),
  },
});