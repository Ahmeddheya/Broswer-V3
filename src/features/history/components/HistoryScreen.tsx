import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { useBrowserStore } from '@/shared/store/browser';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';
import { HistoryItem } from '@/shared/types';
import { HistoryGroupedList } from './HistoryGroupedList';
import { HistoryStats } from './HistoryStats';

export const HistoryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
  
  const { history, removeFromHistory, clearHistory, searchHistory } = useBrowserStore();

  const handleItemPress = (url: string) => {
    router.replace(`/?url=${encodeURIComponent(url)}`);
  };

  const handleDeleteItem = (item: HistoryItem) => {
    Alert.alert(
      'حذف من التاريخ',
      `هل تريد حذف "${item.title}" من التاريخ؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => removeFromHistory(item.id),
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all browsing history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const filteredHistory = searchQuery 
    ? searchHistory(searchQuery)
    : history;

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item.url)}
      className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
          <Ionicons name="globe-outline" size={20} color="#4285f4" />
        </View>
        
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-sm text-white/70" numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-white/50">
              {formatTimeAgo(item.timestamp)}
            </Text>
            {item.visitCount > 1 && (
              <Text className="text-xs text-primary-400 ml-2">
                • {item.visitCount} زيارة
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          className="w-9 h-9 rounded-full bg-red-500/20 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">History</Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity 
              onPress={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              <Ionicons 
                name={viewMode === 'list' ? 'list' : 'grid'} 
                size={20} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleClearHistory}
              className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
          </TouchableOpacity>
        </View>
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search history..."
        />
      </View>

      <View className="flex-1 px-5 pt-4">
        {/* Stats */}
        {!searchQuery && (
          <HistoryStats history={history} />
        )}
        
        {filteredHistory.length > 0 ? (
          viewMode === 'grouped' ? (
            <HistoryGroupedList 
              history={filteredHistory}
              onItemPress={handleItemPress}
              onDeleteItem={handleDeleteItem}
            />
          ) : (
            <FlatList
              data={filteredHistory}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )
        ) : (
          <View className="flex-1 items-center justify-center px-10">
            <Ionicons name="time-outline" size={64} color="#666" />
            <Text className="text-xl font-bold text-white mt-4 mb-2 text-center">
              No History
            </Text>
            <Text className="text-base text-white/60 text-center leading-6">
              Your browsing history will appear here
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};