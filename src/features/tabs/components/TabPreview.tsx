import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tab } from '@/shared/types';
import { extractDomain, formatTimeAgo } from '@/shared/lib/utils';
import { Card } from '@/shared/ui/cards/Card';
import { FadeIn } from '@/shared/ui/animations/FadeIn';

interface TabPreviewProps {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
}

export const TabPreview: React.FC<TabPreviewProps> = ({
  tab,
  isActive,
  onPress,
  onClose,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 60) / 2; // 60 = padding + gap

  return (
    <FadeIn>
      <TouchableOpacity
        onPress={onPress}
        style={{ width: cardWidth }}
        className="mb-3 active:scale-95"
      >
        <Card 
          variant={isActive ? "gradient" : "elevated"}
          className={isActive ? 'border-green-500/30' : ''}
        >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className={`w-3 h-3 rounded-full mr-2 ${
            isActive ? 'bg-green-500' : 'bg-white/30'
          }`} />
          <Text 
            className={`text-xs font-medium ${
              isActive ? 'text-green-400' : 'text-white/70'
            }`}
            numberOfLines={1}
          >
            {extractDomain(tab.url)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="w-6 h-6 rounded-full bg-red-500/20 items-center justify-center"
        >
          <Ionicons name="close" size={12} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {/* Preview Area */}
      <View className="bg-white/10 rounded-lg h-24 mb-3 items-center justify-center">
        {tab.screenshotUrl ? (
          // TODO: Add screenshot support
          <Ionicons name="image-outline" size={32} color="#666" />
        ) : (
          <Ionicons 
            name={tab.faviconUrl ? "globe" : "globe-outline"} 
            size={32} 
            color={isActive ? '#4CAF50' : '#4285f4'} 
          />
        )}
      </View>

      {/* Title */}
      <Text 
        className={`text-sm font-semibold mb-1 ${
          isActive ? 'text-green-400' : 'text-white'
        }`}
        numberOfLines={2}
      >
        {tab.title}
      </Text>

      {/* Time */}
      <Text className="text-xs text-white/50">
        {formatTimeAgo(tab.createdAt)}
      </Text>

      {/* Active Badge */}
      {isActive && (
        <View className="absolute top-2 right-2 bg-green-500/30 px-2 py-1 rounded-lg border border-green-500/50">
          <Text className="text-xs text-green-400 font-semibold">Active</Text>
        </View>
      )}
        </Card>
      </TouchableOpacity>
    </FadeIn>
  );
};