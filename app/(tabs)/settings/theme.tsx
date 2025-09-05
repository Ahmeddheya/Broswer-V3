import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { useBrowserStore } from '@/shared/store/browser';

export default function ThemeSettings() {
  const { settings, updateSettings } = useBrowserStore();

  const themes = [
    {
      id: 'auto',
      name: 'Auto',
      description: 'Follow system theme',
      icon: 'phone-portrait-outline',
      colors: ['#0a0b1e', '#1a1b3a', '#2a2b4a'],
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Always use dark theme',
      icon: 'moon-outline',
      colors: ['#000000', '#1a1a1a', '#333333'],
    },
    {
      id: 'light',
      name: 'Light',
      description: 'Always use light theme',
      icon: 'sunny-outline',
      colors: ['#ffffff', '#f5f5f5', '#e0e0e0'],
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      description: 'Blue gradient theme',
      icon: 'water-outline',
      colors: ['#0066cc', '#0080ff', '#3399ff'],
    },
    {
      id: 'purple',
      name: 'Purple',
      description: 'Purple gradient theme',
      icon: 'diamond-outline',
      colors: ['#6a0dad', '#8a2be2', '#9370db'],
    },
  ];

  const currentTheme = themes.find(t => t.id === (settings.darkMode ? 'dark' : 'auto')) || themes[0];

  const handleThemeSelect = (themeId: string) => {
    switch (themeId) {
      case 'dark':
        updateSettings({ darkMode: true });
        break;
      case 'light':
        updateSettings({ darkMode: false });
        break;
      default:
        updateSettings({ darkMode: false });
        break;
    }
    router.back();
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Theme</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-white/70 text-base mb-6 leading-6">
          Choose your preferred theme. This affects the overall appearance of the browser.
        </Text>

        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            onPress={() => handleThemeSelect(theme.id)}
            className={`p-4 rounded-xl mb-4 border ${
              currentTheme.id === theme.id
                ? 'bg-primary-500/10 border-primary-500'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                currentTheme.id === theme.id ? 'bg-primary-500/20' : 'bg-white/10'
              }`}>
                <Ionicons 
                  name={theme.icon as any} 
                  size={24} 
                  color={currentTheme.id === theme.id ? '#4285f4' : '#ffffff'} 
                />
              </View>
              
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${
                  currentTheme.id === theme.id ? 'text-primary-400' : 'text-white'
                }`}>
                  {theme.name}
                </Text>
                <Text className="text-sm text-white/70">
                  {theme.description}
                </Text>
              </View>
              
              {currentTheme.id === theme.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4285f4" />
              )}
            </View>

            {/* Color Preview */}
            <View className="flex-row space-x-2">
              {theme.colors.map((color, index) => (
                <View
                  key={index}
                  className="w-8 h-8 rounded-full border border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Additional Options */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-white mb-4">Additional Options</Text>
          
          <View className="bg-white/5 rounded-xl border border-white/10 p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <Ionicons name="moon" size={20} color="#4285f4" className="mr-3" />
                <View>
                  <Text className="text-white font-medium">Night Mode</Text>
                  <Text className="text-white/70 text-sm">Apply night filter to web pages</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => updateSettings({ nightMode: !settings.nightMode })}
                className={`w-12 h-6 rounded-full ${
                  settings.nightMode ? 'bg-primary-500' : 'bg-white/20'
                }`}
              >
                <View className={`w-5 h-5 rounded-full bg-white mt-0.5 ${
                  settings.nightMode ? 'ml-6' : 'ml-0.5'
                }`} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}