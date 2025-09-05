import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBrowserStore } from '@/shared/store/browser';
import { BottomSheet } from '@/shared/ui/modals/BottomSheet';
import { Card } from '@/shared/ui/cards/Card';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  currentUrl: string;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onFindInPage: () => void;
  onShare: () => void;
  onSettings: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  visible,
  onClose,
  currentUrl,
  isBookmarked,
  onBookmarkToggle,
  onFindInPage,
  onShare,
  onSettings,
}) => {
  const { settings, updateSettings } = useBrowserStore();

  const menuItems = [
    {
      icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
      title: isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
      onPress: () => {
        onBookmarkToggle();
        onClose();
      },
      color: isBookmarked ? '#4CAF50' : '#ffffff',
    },
    {
      icon: 'search',
      title: 'Find in Page',
      onPress: () => {
        onClose();
        onFindInPage();
      },
    },
    {
      icon: 'share-outline',
      title: 'Share',
      onPress: () => {
        onClose();
        onShare();
      },
    },
    {
      icon: settings.desktopMode ? 'phone-portrait' : 'desktop',
      title: settings.desktopMode ? 'Mobile Site' : 'Desktop Site',
      onPress: () => {
        updateSettings({ desktopMode: !settings.desktopMode });
        onClose();
      },
    },
    {
      icon: settings.nightMode ? 'sunny' : 'moon',
      title: settings.nightMode ? 'Day Mode' : 'Night Mode',
      onPress: () => {
        updateSettings({ nightMode: !settings.nightMode });
        onClose();
      },
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => {
        onClose();
        onSettings();
      },
    },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[0.6, 0.9]}
    >
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-white">Browser Menu</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Current URL */}
        {currentUrl && (
          <Card className="mb-6">
            <Text className="text-white/70 text-sm" numberOfLines={1}>
              {currentUrl}
            </Text>
          </Card>
        )}

        {/* Menu Items */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className="flex-row items-center py-4 px-2 active:bg-white/5 rounded-lg"
              >
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.color || '#ffffff'} 
                  />
                </View>
                <Text className="text-white text-base font-medium flex-1">
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </Card>
        </ScrollView>
      </View>
    </BottomSheet>
  );
};