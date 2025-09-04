import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QUICK_ACCESS_SITES } from '@/shared/lib/constants';

interface QuickAccessGridProps {
  onSitePress: (url: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ onSitePress }) => {
  return (
    <View className="flex-1">
      <Text className="text-lg font-bold text-white mb-6">Quick Access</Text>
      
      <View className="flex-row flex-wrap justify-between">
        {QUICK_ACCESS_SITES.map((site, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSitePress(site.url)}
            className="w-[22%] items-center mb-6"
          >
            <View 
              className="w-14 h-14 rounded-2xl items-center justify-center mb-2 border border-white/10"
              style={{ backgroundColor: `${site.color}20` }}
            >
              <Ionicons 
                name={site.icon as keyof typeof Ionicons.glyphMap} 
                size={28} 
                color={site.color} 
              />
            </View>
            <Text className="text-xs text-white text-center font-medium" numberOfLines={1}>
              {site.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};