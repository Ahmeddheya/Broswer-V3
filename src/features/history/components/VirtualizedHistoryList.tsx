import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, VirtualizedList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '@/shared/types';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';

interface VirtualizedHistoryListProps {
  history: HistoryItem[];
  onItemPress: (url: string) => void;
  onDeleteItem: (item: HistoryItem) => void;
  searchQuery?: string;
}

const ITEM_HEIGHT = 80;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const VirtualizedHistoryList: React.FC<VirtualizedHistoryListProps> = ({
  history,
  onItemPress,
  onDeleteItem,
  searchQuery = '',
}) => {
  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    
    const query = searchQuery.toLowerCase();
    return history.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => (
    <TouchableOpacity
      onPress={() => onItemPress(item.url)}
      className="bg-white/5 rounded-xl p-4 mx-5 mb-3 border border-white/10"
      style={{ height: ITEM_HEIGHT - 12 }} // Account for margin
    >
      <View className="flex-row items-center h-full">
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
                • {item.visitCount} visits
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => onDeleteItem(item)}
          className="w-9 h-9 rounded-full bg-red-500/20 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getItem = (data: HistoryItem[], index: number) => data[index];
  const getItemCount = (data: HistoryItem[]) => data.length;

  return (
    <VirtualizedList
      data={filteredHistory}
      initialNumToRender={Math.ceil(SCREEN_HEIGHT / ITEM_HEIGHT)}
      renderItem={renderItem}
      keyExtractor={(item: HistoryItem) => item.id}
      getItemCount={getItemCount}
      getItem={getItem}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
    />
  );
};