import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { Button } from '@/shared/ui/buttons/Button';
import { useBrowserStore } from '@/shared/store/browser';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';
import { Tab, ClosedTab } from '@/shared/types';

export const TabsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    activeTabs,
    closedTabs,
    currentTabId,
    createNewTab,
    closeTab,
    closeAllTabs,
    restoreTab,
    clearClosedTabs,
    setActiveTab,
  } = useBrowserStore();

  const handleCreateNewTab = () => {
    const tabId = createNewTab('https://www.google.com');
    router.replace('/?url=https://www.google.com');
  };

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab.id);
    router.replace(`/?url=${encodeURIComponent(tab.url)}`);
  };

  const handleCloseTab = (tabId: string) => {
    closeTab(tabId);
  };

  const handleRestoreTab = (tabId: string) => {
    restoreTab(tabId);
  };

  const handleCloseAllTabs = () => {
    Alert.alert(
      'Close All Tabs',
      'Are you sure you want to close all active tabs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Close All', style: 'destructive', onPress: closeAllTabs }
      ]
    );
  };

  const filteredActiveTabs = activeTabs.filter(tab =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClosedTabs = closedTabs.filter(tab =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderActiveTab = ({ item }: { item: Tab }) => (
    <TouchableOpacity
      onPress={() => handleTabPress(item)}
      style={[
        styles.tabItem,
        currentTabId === item.id && styles.activeTabItem
      ]}
    >
      <View style={styles.tabContent}>
        <View style={styles.tabIcon}>
          <Ionicons 
            name={currentTabId === item.id ? 'globe' : 'globe-outline'} 
            size={20} 
            color={currentTabId === item.id ? '#4CAF50' : '#4285f4'} 
          />
        </View>
        
        <View style={styles.tabInfo}>
          <Text style={[
            styles.tabTitle,
            currentTabId === item.id && styles.activeTabTitle
          ]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.tabUrl} numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <Text style={styles.tabTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.tabActions}>
          {currentTabId === item.id && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleCloseTab(item.id)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderClosedTab = ({ item }: { item: ClosedTab }) => (
    <View style={styles.closedTabItem}>
      <View style={styles.tabContent}>
        <View style={styles.closedTabIcon}>
          <Ionicons name="time-outline" size={20} color="#ff9800" />
        </View>
        
        <View style={styles.tabInfo}>
          <Text style={styles.tabTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.tabUrl} numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <Text style={styles.closedTabTime}>
            Closed {formatTimeAgo(item.closedAt)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => handleRestoreTab(item.id)}
          style={styles.restoreButton}
        >
          <Ionicons name="refresh" size={18} color="#4285f4" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tabs</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tabs..."
          style={styles.searchInput}
        />
      </View>

      <View style={styles.content}>
        {/* Create New Tab Button */}
        <Button
          title="Create New Tab"
          onPress={handleCreateNewTab}
          gradient
          icon={<Ionicons name="add-circle-outline" size={24} color="#ffffff" />}
          style={styles.newTabButton}
        />

        {/* Active Tabs Section */}
        {filteredActiveTabs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Active Tabs ({filteredActiveTabs.length})
              </Text>
              <TouchableOpacity
                onPress={handleCloseAllTabs}
                style={styles.closeAllButton}
              >
                <Text style={styles.closeAllText}>Close All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filteredActiveTabs}
              renderItem={renderActiveTab}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Recently Closed Section */}
        {filteredClosedTabs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Recently Closed ({filteredClosedTabs.length})
              </Text>
              <TouchableOpacity
                onPress={clearClosedTabs}
                style={styles.closeAllButton}
              >
                <Text style={styles.closeAllText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filteredClosedTabs}
              renderItem={renderClosedTab}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty State */}
        {filteredActiveTabs.length === 0 && filteredClosedTabs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={64} color="#4285f4" />
            <Text style={styles.emptyTitle}>No Tabs</Text>
            <Text style={styles.emptySubtitle}>
              Create your first tab to start browsing
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 24,
  },
  searchInput: {
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  newTabButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeAllButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  closeAllText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  tabItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTabItem: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  closedTabItem: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closedTabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tabInfo: {
    flex: 1,
    marginRight: 12,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  activeTabTitle: {
    color: '#4CAF50',
  },
  tabUrl: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  tabTime: {
    fontSize: 12,
    color: '#ff9800',
  },
  closedTabTime: {
    fontSize: 12,
    color: '#ff9800',
  },
  tabActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
});