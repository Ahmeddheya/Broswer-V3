import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { useBrowserStore } from '@/shared/store/browser';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';
import { BookmarkItem } from '@/shared/types';

export const BookmarksScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  
  const { bookmarks, removeBookmark, searchBookmarks } = useBrowserStore();

  const handleItemPress = (url: string) => {
    router.replace(`/?url=${encodeURIComponent(url)}`);
  };

  const handleDeleteBookmark = (item: BookmarkItem) => {
    Alert.alert(
      'Delete Bookmark',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeBookmark(item.id),
        },
      ]
    );
  };

  const filteredBookmarks = searchQuery 
    ? searchBookmarks(searchQuery)
    : selectedFolder === 'All' 
      ? bookmarks 
      : bookmarks.filter(bookmark => bookmark.folder === selectedFolder);

  const folders = ['All', ...new Set(bookmarks.map(b => b.folder))];

  const renderBookmarkItem = ({ item }: { item: BookmarkItem }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item.url)}
      style={styles.bookmarkItem}
    >
      <View style={styles.bookmarkContent}>
        <View style={styles.bookmarkIcon}>
          <Ionicons name="bookmark" size={20} color="#4285f4" />
        </View>
        
        <View style={styles.bookmarkInfo}>
          <Text style={styles.bookmarkTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.bookmarkUrl} numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <View style={styles.bookmarkMeta}>
            <Text style={styles.bookmarkFolder}>
              {item.folder}
            </Text>
            <Text style={styles.bookmarkTime}>
              • {formatTimeAgo(item.dateAdded)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteBookmark(item)}
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
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={24} color="#4285f4" />
          </TouchableOpacity>
        </View>
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bookmarks..."
          style={styles.searchInput}
        />
      </View>

      <View style={styles.content}>
        {filteredBookmarks.length > 0 ? (
          <FlatList
            data={filteredBookmarks}
            renderItem={renderBookmarkItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No Bookmarks</Text>
            <Text style={styles.emptySubtitle}>
              Start saving your favorite websites
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
  bookmarkItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookmarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  bookmarkUrl: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  bookmarkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkFolder: {
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '500',
  },
  bookmarkTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
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