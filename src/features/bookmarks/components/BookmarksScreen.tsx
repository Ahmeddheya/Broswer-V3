import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';
import { useBrowserStore } from '@/shared/store/browser';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';
import { BookmarkItem } from '@/shared/types';
import { BookmarkFolders } from './BookmarkFolders';
import { AddBookmarkModal } from './AddBookmarkModal';

export const BookmarksScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { bookmarks, removeBookmark, searchBookmarks, addBookmark } = useBrowserStore();

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
      className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
          <Ionicons name="bookmark" size={20} color="#4285f4" />
        </View>
        
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-sm text-white/70" numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-primary-400 font-medium">
              {item.folder}
            </Text>
            <Text className="text-xs text-white/50 ml-2">
              • {formatTimeAgo(item.dateAdded)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteBookmark(item)}
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
          <Text className="text-xl font-bold text-white">Bookmarks</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#4285f4" />
          </TouchableOpacity>
        </View>
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bookmarks..."
        />
      </View>

      <View className="flex-1 px-5 pt-4">
        {/* Folders */}
        <BookmarkFolders
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          bookmarks={bookmarks}
        />
        
        {filteredBookmarks.length > 0 ? (
          <FlatList
            data={filteredBookmarks}
            renderItem={renderBookmarkItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-10">
            <Ionicons name="bookmark-outline" size={64} color="#666" />
            <Text className="text-xl font-bold text-white mt-4 mb-2 text-center">
              No Bookmarks
            </Text>
            <Text className="text-base text-white/60 text-center leading-6">
              Start saving your favorite websites
            </Text>
          </View>
        )}
      </View>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(bookmark) => {
          addBookmark(bookmark);
          setShowAddModal(false);
        }}
        existingFolders={folders.filter(f => f !== 'All')}
      />
    </ScreenLayout>
  );
};