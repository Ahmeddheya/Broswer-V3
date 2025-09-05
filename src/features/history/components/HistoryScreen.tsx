import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { useBrowserStore } from '@/shared/store/browser';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';
import { HistoryItem } from '@/shared/types';

export const HistoryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { history, removeFromHistory, clearHistory, searchHistory } = useBrowserStore();

  const handleItemPress = (url: string) => {
    router.replace(`/?url=${encodeURIComponent(url)}`);
  };

  const handleDeleteItem = (item: HistoryItem) => {
    Alert.alert(
      'Delete from History',
      `Are you sure you want to delete "${item.title}" from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
      style={styles.historyItem}
    >
      <View style={styles.historyContent}>
        <View style={styles.historyIcon}>
          <Ionicons name="globe-outline" size={20} color="#4285f4" />
        </View>
        
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.historyUrl} numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <View style={styles.historyMeta}>
            <Text style={styles.historyTime}>
              {formatTimeAgo(item.timestamp)}
            </Text>
            {item.visitCount > 1 && (
              <Text style={styles.historyVisits}>
                • {item.visitCount} visits
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History</Text>
          <TouchableOpacity onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search history..."
          style={styles.searchInput}
        />
      </View>

      <View style={styles.content}>
        {filteredHistory.length > 0 ? (
          <FlatList
            data={filteredHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No History</Text>
            <Text style={styles.emptySubtitle}>
              Your browsing history will appear here
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
  searchInput: {
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  historyUrl: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  historyVisits: {
    fontSize: 12,
    color: '#4285f4',
    marginLeft: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
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