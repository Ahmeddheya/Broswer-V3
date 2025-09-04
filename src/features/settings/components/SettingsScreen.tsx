import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { useBrowserStore } from '@/shared/store';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useBrowserStore();

  const settingsGroups = [
    {
      title: 'الأساسيات',
      items: [
        {
          icon: 'search-outline',
          title: 'محرك البحث',
          subtitle: settings.searchEngine === 'google' ? 'Google' : 
                   settings.searchEngine === 'bing' ? 'Bing' :
                   settings.searchEngine === 'duckduckgo' ? 'DuckDuckGo' : 'Google',
          type: 'navigate',
          onPress: () => console.log('Navigate to search engine settings'),
        },
        {
          icon: 'home-outline',
          title: 'الصفحة الرئيسية',
          subtitle: settings.homepage,
          type: 'navigate',
          onPress: () => console.log('Navigate to homepage settings'),
        },
      ],
    },
    {
      title: 'الخصوصية والأمان',
      items: [
        {
          icon: 'shield-outline',
          title: 'حظر الإعلانات',
          subtitle: 'منع الإعلانات والمتتبعات',
          type: 'switch',
          value: settings.adBlockEnabled,
          onToggle: (value: boolean) => updateSettings({ adBlockEnabled: value }),
        },
        {
          icon: 'eye-off-outline',
          title: 'وضع التصفح الخفي',
          subtitle: 'تصفح بدون حفظ البيانات',
          type: 'switch',
          value: settings.incognitoMode,
          onToggle: (value: boolean) => updateSettings({ incognitoMode: value }),
        },
      ],
    },
    {
      title: 'المظهر والتجربة',
      items: [
        {
          icon: 'moon-outline',
          title: 'الوضع المظلم',
          subtitle: 'استخدام المظهر المظلم دائماً',
          type: 'switch',
          value: settings.darkMode,
          onToggle: (value: boolean) => updateSettings({ darkMode: value }),
        },
        {
          icon: 'moon',
          title: 'وضع الليل',
          subtitle: 'تطبيق فلتر ليلي على الصفحات',
          type: 'switch',
          value: settings.nightMode,
          onToggle: (value: boolean) => updateSettings({ nightMode: value }),
        },
        {
          icon: 'desktop-outline',
          title: 'وضع سطح المكتب',
          subtitle: 'طلب نسخة سطح المكتب',
          type: 'switch',
          value: settings.desktopMode,
          onToggle: (value: boolean) => updateSettings({ desktopMode: value }),
        },
      ],
    },
    {
      title: 'البيانات',
      items: [
        {
          icon: 'save-outline',
          title: 'حفظ التاريخ تلقائياً',
          subtitle: 'حفظ سجل التصفح',
          type: 'switch',
          value: settings.autoSaveHistory,
          onToggle: (value: boolean) => updateSettings({ autoSaveHistory: value }),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      onPress={item.onPress}
      className={`flex-row items-center bg-white/5 rounded-xl p-4 mb-3 border border-white/10 ${
        item.value ? 'border-green-500/30 bg-green-500/5' : ''
      }`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
        item.value ? 'bg-green-500/20' : 'bg-primary-500/20'
      }`}>
        <Ionicons 
          name={item.icon} 
          size={22} 
          color={item.value ? '#4CAF50' : '#4285f4'} 
        />
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-semibold text-white mb-1">
          {item.title}
        </Text>
        <Text className="text-sm text-white/70">
          {item.subtitle}
        </Text>
      </View>

      {item.type === 'switch' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#333', true: '#4CAF50' }}
          thumbColor={item.value ? '#ffffff' : '#666'}
          ios_backgroundColor="#333"
        />
      )}

      {item.type === 'navigate' && (
        <Ionicons name="chevron-forward" size={18} color="#aaaaaa" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">الإعدادات</Text>
          <TouchableOpacity>
            <Ionicons name="help-circle-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-8">
            <Text className="text-sm font-bold text-green-400 uppercase tracking-wide mb-4 px-2">
              {group.title}
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {renderSettingItem(item)}
                  {itemIndex < group.items.length - 1 && (
                    <View className="h-px bg-white/5 mx-4" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 items-center">
          <View className="w-16 h-16 rounded-full bg-primary-500/20 items-center justify-center mb-4">
            <Ionicons name="globe" size={32} color="#4285f4" />
          </View>
          <Text className="text-xl font-bold text-white mb-2">Aura Browser</Text>
          <Text className="text-sm text-white/60 mb-4">الإصدار 1.0.0</Text>
          <Text className="text-sm text-white/70 text-center leading-5">
            متصفح سريع وآمن مع ميزات خصوصية متقدمة وتجربة تصفح سلسة
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};