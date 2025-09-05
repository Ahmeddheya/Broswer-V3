import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { useBrowserStore } from '@/shared/store/browser';
import { SEARCH_ENGINES } from '@/shared/lib/constants';

export default function SearchEngineSettings() {
  const { settings, updateSettings } = useBrowserStore();
  const [selectedEngine, setSelectedEngine] = useState(settings.searchEngine);

  const handleSave = () => {
    updateSettings({ searchEngine: selectedEngine });
    router.back();
  };

  const searchEngines = Object.entries(SEARCH_ENGINES).map(([key, engine]) => ({
    id: key,
    name: engine.name,
    description: `Search with ${engine.name}`,
    icon: key === 'google' ? 'logo-google' : 
          key === 'bing' ? 'logo-microsoft' :
          key === 'duckduckgo' ? 'shield-outline' : 'search-outline',
  }));

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Search Engine</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-primary-400 font-semibold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-white/70 text-base mb-6 leading-6">
          Choose your default search engine. This will be used when you search from the address bar.
        </Text>

        {searchEngines.map((engine) => (
          <TouchableOpacity
            key={engine.id}
            onPress={() => setSelectedEngine(engine.id)}
            className={`flex-row items-center p-4 rounded-xl mb-3 border ${
              selectedEngine === engine.id
                ? 'bg-primary-500/10 border-primary-500'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
              selectedEngine === engine.id ? 'bg-primary-500/20' : 'bg-white/10'
            }`}>
              <Ionicons 
                name={engine.icon as any} 
                size={24} 
                color={selectedEngine === engine.id ? '#4285f4' : '#ffffff'} 
              />
            </View>
            
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${
                selectedEngine === engine.id ? 'text-primary-400' : 'text-white'
              }`}>
                {engine.name}
              </Text>
              <Text className="text-sm text-white/70">
                {engine.description}
              </Text>
            </View>
            
            {selectedEngine === engine.id && (
              <Ionicons name="checkmark-circle" size={24} color="#4285f4" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}