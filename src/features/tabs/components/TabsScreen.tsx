import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { useBrowserStore } from '@/shared/store/browser';

export const TabsScreen: React.FC = () => {
  const {
    activeTabs,
    closedTabs,
    currentTabId,
    createNewTab,
    closeTab,
    restoreTab,
    setActiveTab,
  } = useBrowserStore();

  const handleCreateNewTab = () => {
    const tabId = createNewTab('https://www.google.com');
    router.replace('/(tabs)/');
  };

  const handleTabPress = (tabId: string, url: string) => {
    setActiveTab(tabId);
    router.replace('/(tabs)/');
  };

  const handleCloseTab = (tabId: string) => {
    closeTab(tabId);
  };

  const handleRestoreTab = (tabId: string) => {
    restoreTab(tabId);
  };

  const renderActiveTab = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleTabPress(item.id, item.url)}
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
            {item.url}
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

  const renderClosedTab = ({ item }: { item: any }) => (
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
            {item.url}
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
      </View>

      <View style={styles.content}>
        {/* Create New Tab Button */}
        <TouchableOpacity onPress={handleCreateNewTab} style={styles.newTabButton}>
          <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
          <Text style={styles.newTabButtonText}>Create New Tab</Text>
        </TouchableOpacity>

        {/* Active Tabs Section */}
        {activeTabs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Active Tabs ({activeTabs.length})
            </Text>
            
            <FlatList
              data={activeTabs}
              renderItem={renderActiveTab}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Recently Closed Section */}
        {closedTabs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Recently Closed ({closedTabs.length})
            </Text>
            
            <FlatList
              data={closedTabs}
              renderItem={renderClosedTab}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty State */}
        {activeTabs.length === 0 && closedTabs.length === 0 && (
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  newTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285f4',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  newTabButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
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