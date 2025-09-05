import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { Button } from '@/shared/ui/buttons/Button';
import { useBrowserStore } from '@/shared/store/browser';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';
import { Tab, ClosedTab } from '@/shared/types';
import { RTLView } from '@/shared/components/RTLView';
import { RTLText } from '@/shared/components/RTLText';
import { TabPreview } from './TabPreview';
import { useOptimizedFlatList } from '@/shared/hooks/useOptimizedFlatList';
import { usePerformanceMonitor } from '@/shared/hooks/usePerformanceMonitor';

export const TabsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { measureAsync } = usePerformanceMonitor('TabsScreen');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
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
      t('browser.closeAllTabs'),
      t('tabs.closeAllTabsConfirm', 'Are you sure you want to close all active tabs?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('browser.closeAllTabs'), style: 'destructive', onPress: closeAllTabs }
      ]
    );
  };

  const handleClearClosedTabs = () => {
    Alert.alert(
      t('tabs.clearRecentlyClosed', 'Clear Recently Closed'),
      t('tabs.clearRecentlyClosedConfirm', 'Are you sure you want to clear all recently closed tabs?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.clear'), style: 'destructive', onPress: clearClosedTabs }
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

  // Optimized FlatList props
  const activeTabsListProps = useOptimizedFlatList({
    itemHeight: 80,
    data: filteredActiveTabs,
    numColumns: viewMode === 'grid' ? 2 : 1,
  });

  const closedTabsListProps = useOptimizedFlatList({
    itemHeight: 80,
    data: filteredClosedTabs,
  });

  const renderActiveTab = ({ item }: { item: Tab }) => (
    <TouchableOpacity
      onPress={() => handleTabPress(item)}
      className={`bg-white/5 rounded-xl p-4 mb-3 border border-white/10 ${
        currentTabId === item.id ? 'border-green-500 bg-green-500/10' : ''
      }`}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
          <Ionicons 
            name={currentTabId === item.id ? 'globe' : 'globe-outline'} 
            size={20} 
            color={currentTabId === item.id ? '#4CAF50' : '#4285f4'} 
          />
        </View>
        
        <View className="flex-1 mr-3">
          <Text className={`text-base font-semibold ${
            currentTabId === item.id ? 'text-green-400' : 'text-white'
          }`} numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-sm text-white/70" numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <Text className="text-xs text-orange-400 mt-1">
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          {currentTabId === item.id && (
            <View className="bg-green-500/20 px-2 py-1 rounded-lg mr-2">
              <Text className="text-xs text-green-400 font-semibold">نشط</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleCloseTab(item.id)}
            className="w-9 h-9 rounded-full bg-red-500/20 items-center justify-center"
          >
            <Ionicons name="close" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderClosedTab = ({ item }: { item: ClosedTab }) => (
    <View className="bg-orange-500/5 rounded-xl p-4 mb-3 border border-orange-500/20">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center mr-3">
          <Ionicons name="time-outline" size={20} color="#ff9800" />
        </View>
        
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-sm text-white/70" numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <Text className="text-xs text-orange-400 mt-1">
            أُغلق {formatTimeAgo(item.closedAt)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => handleRestoreTab(item.id)}
          className="w-9 h-9 rounded-full bg-primary-500/20 items-center justify-center"
        >
          <Ionicons name="refresh" size={18} color="#4285f4" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <RTLView className="items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <RTLText className="text-xl font-bold text-white">{t('tabs.title')}</RTLText>
          <TouchableOpacity 
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons 
              name={viewMode === 'list' ? 'grid' : 'list'} 
              size={20} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </RTLView>
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('tabs.searchTabs')}
          className="mb-4"
        />
      </View>

      <View className="flex-1 px-5">
        {/* Create New Tab Button */}
        <Button
          title={t('browser.newTab')}
          onPress={handleCreateNewTab}
          gradient
          icon={<Ionicons name="add-circle-outline" size={24} color="#ffffff" />}
          className="mt-6 mb-6"
        />

        {/* Active Tabs Section */}
        {filteredActiveTabs.length > 0 && (
          <View className="mb-6">
            <RTLView className="items-center justify-between mb-4">
              <RTLText className="text-lg font-bold text-white">
                {t('tabs.activeTabs')} ({filteredActiveTabs.length})
              </RTLText>
              <TouchableOpacity
                onPress={handleCloseAllTabs}
                className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30"
              >
                <RTLText className="text-red-400 text-sm font-semibold">
                  {t('browser.closeAllTabs')}
                </RTLText>
              </TouchableOpacity>
            </RTLView>
            
            {viewMode === 'grid' ? (
              <FlatList
                data={filteredActiveTabs}
                {...activeTabsListProps}
                renderItem={({ item }) => (
                  <TabPreview
                    tab={item}
                    isActive={currentTabId === item.id}
                    onPress={() => handleTabPress(item)}
                    onClose={() => handleCloseTab(item.id)}
                  />
                )}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlatList
                data={filteredActiveTabs}
                {...activeTabsListProps}
                renderItem={renderActiveTab}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {/* Recently Closed Section */}
        {filteredClosedTabs.length > 0 && (
          <View className="mb-6">
            <RTLView className="items-center justify-between mb-4">
              <RTLText className="text-lg font-bold text-white">
                {t('tabs.recentlyClosed')} ({filteredClosedTabs.length})
              </RTLText>
              <TouchableOpacity
                onPress={handleClearClosedTabs}
                className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30"
              >
                <RTLText className="text-red-400 text-sm font-semibold">
                  {t('common.clear')}
                </RTLText>
              </TouchableOpacity>
            </RTLView>
            
            <FlatList
              data={filteredClosedTabs}
              {...closedTabsListProps}
              renderItem={renderClosedTab}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty State */}
        {filteredActiveTabs.length === 0 && filteredClosedTabs.length === 0 && (
          <View className="flex-1 items-center justify-center px-10">
            <Ionicons name="layers-outline" size={64} color="#4285f4" />
            <RTLText className="text-xl font-bold text-white mt-4 mb-2 text-center">
              {t('browser.noTabs')}
            </RTLText>
            <RTLText className="text-base text-white/60 text-center leading-6">
              {t('browser.createFirstTab')}
            </RTLText>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};