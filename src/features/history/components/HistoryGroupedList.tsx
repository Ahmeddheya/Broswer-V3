import React from 'react';
import { View, Text, TouchableOpacity, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '@/shared/types';
import { formatTimeAgo, extractDomain } from '@/shared/lib/utils';

interface HistoryGroupedListProps {
  history: HistoryItem[];
  onItemPress: (url: string) => void;
  onDeleteItem: (item: HistoryItem) => void;
}

interface HistorySection {
  title: string;
  data: HistoryItem[];
}

export const HistoryGroupedList: React.FC<HistoryGroupedListProps> = ({
  history,
  onItemPress,
  onDeleteItem,
}) => {
  const groupHistoryByDate = (items: HistoryItem[]): HistorySection[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: HistoryItem[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'This Month': [],
      'Older': [],
    };

    items.forEach(item => {
      const itemDate = new Date(item.timestamp);
      
      if (itemDate >= today) {
        groups['Today'].push(item);
      } else if (itemDate >= yesterday) {
        groups['Yesterday'].push(item);
      } else if (itemDate >= thisWeek) {
        groups['This Week'].push(item);
      } else if (itemDate >= thisMonth) {
        groups['This Month'].push(item);
      } else {
        groups['Older'].push(item);
      }
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([title, data]) => ({ title, data }));
  };

  const sections = groupHistoryByDate(history);

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      onPress={() => onItemPress(item.url)}
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

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <View className="flex-row items-center justify-between py-3 px-2 mb-2">
      <Text className="text-lg font-bold text-white">{section.title}</Text>
      <Text className="text-sm text-white/60">{section.data.length} items</Text>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderHistoryItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      stickySectionHeadersEnabled={false}
    />
  );
};