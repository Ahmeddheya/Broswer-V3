import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QUICK_ACCESS_SITES } from '@/shared/lib/constants';
import { FadeIn } from '@/shared/ui/animations/FadeIn';
import { Card } from '@/shared/ui/cards/Card';

interface QuickAccessGridProps {
  onSitePress: (url: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ onSitePress }) => {
  return (
    <View className="flex-1">
      <Text className="text-lg font-bold text-white mb-6">Quick Access</Text>
      
      <View className="flex-row flex-wrap justify-between">
        {QUICK_ACCESS_SITES.map((site, index) => (
          <FadeIn key={index} delay={index * 50}>
            <TouchableOpacity
            onPress={() => onSitePress(site.url)}
            className="w-[22%] items-center mb-6 active:scale-95"
          >
            <Card variant="elevated" padding="none" className="w-14 h-14 items-center justify-center mb-2">
              <View 
                className="w-full h-full rounded-xl items-center justify-center"
                style={{ backgroundColor: `${site.color}20` }}
              >
                <Ionicons 
                  name={site.icon as keyof typeof Ionicons.glyphMap} 
                  size={28} 
                  color={site.color} 
                />
              </View>
            </Card>
            <Text className="text-xs text-white text-center font-medium" numberOfLines={1}>
              {site.name}
            </Text>
          </TouchableOpacity>
          </FadeIn>
        ))}
      </View>
    </View>
  );
};