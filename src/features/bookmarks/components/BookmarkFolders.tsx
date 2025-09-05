import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookmarkItem } from '@/shared/types';

interface BookmarkFoldersProps {
  folders: string[];
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  bookmarks: BookmarkItem[];
}

export const BookmarkFolders: React.FC<BookmarkFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  bookmarks,
}) => {
  const getFolderCount = (folder: string) => {
    if (folder === 'All') return bookmarks.length;
    return bookmarks.filter(b => b.folder === folder).length;
  };

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'All': return 'library-outline';
      case 'Work': return 'briefcase-outline';
      case 'Personal': return 'person-outline';
      case 'Entertainment': return 'play-outline';
      case 'News': return 'newspaper-outline';
      case 'Shopping': return 'bag-outline';
      default: return 'folder-outline';
    }
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-white mb-3">Folders</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-3">
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder}
              onPress={() => onFolderSelect(folder)}
              className={`px-4 py-3 rounded-xl border ${
                selectedFolder === folder
                  ? 'bg-primary-500/20 border-primary-500'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={getFolderIcon(folder) as any}
                  size={18}
                  color={selectedFolder === folder ? '#4285f4' : '#ffffff'}
                />
                <Text
                  className={`ml-2 font-medium ${
                    selectedFolder === folder ? 'text-primary-400' : 'text-white'
                  }`}
                >
                  {folder}
                </Text>
                <View
                  className={`ml-2 px-2 py-1 rounded-full ${
                    selectedFolder === folder ? 'bg-primary-500/30' : 'bg-white/10'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selectedFolder === folder ? 'text-primary-300' : 'text-white/70'
                    }`}
                  >
                    {getFolderCount(folder)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};