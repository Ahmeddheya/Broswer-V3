import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { TextInput } from '@/shared/ui/inputs/TextInput';
import { Button } from '@/shared/ui/buttons/Button';
import { useBrowserStore } from '@/shared/store/browser';

const homepageSchema = z.object({
  homepage: z.string().url('Please enter a valid URL'),
});

type HomepageForm = z.infer<typeof homepageSchema>;

export default function HomepageSettings() {
  const { settings, updateSettings } = useBrowserStore();
  const [selectedOption, setSelectedOption] = useState<'default' | 'custom'>(
    settings.homepage === 'https://www.google.com' ? 'default' : 'custom'
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HomepageForm>({
    resolver: zodResolver(homepageSchema),
    defaultValues: {
      homepage: settings.homepage,
    },
  });

  const onSubmit = (data: HomepageForm) => {
    updateSettings({ homepage: data.homepage });
    router.back();
  };

  const handleDefaultOption = (option: 'default' | 'custom') => {
    setSelectedOption(option);
    if (option === 'default') {
      updateSettings({ homepage: 'https://www.google.com' });
      router.back();
    }
  };

  const predefinedOptions = [
    { id: 'google', name: 'Google', url: 'https://www.google.com', icon: 'logo-google' },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com', icon: 'logo-microsoft' },
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'shield-outline' },
  ];

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Homepage</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-white/70 text-base mb-6 leading-6">
          Choose what page opens when you start the browser or tap the home button.
        </Text>

        {/* Predefined Options */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-white mb-4">Quick Options</Text>
          {predefinedOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                updateSettings({ homepage: option.url });
                router.back();
              }}
              className={`flex-row items-center p-4 rounded-xl mb-3 border ${
                settings.homepage === option.url
                  ? 'bg-primary-500/10 border-primary-500'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                settings.homepage === option.url ? 'bg-primary-500/20' : 'bg-white/10'
              }`}>
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={settings.homepage === option.url ? '#4285f4' : '#ffffff'} 
                />
              </View>
              
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${
                  settings.homepage === option.url ? 'text-primary-400' : 'text-white'
                }`}>
                  {option.name}
                </Text>
                <Text className="text-sm text-white/70">
                  {option.url}
                </Text>
              </View>
              
              {settings.homepage === option.url && (
                <Ionicons name="checkmark-circle" size={24} color="#4285f4" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom URL */}
        <View>
          <Text className="text-lg font-bold text-white mb-4">Custom Homepage</Text>
          <Controller
            control={control}
            name="homepage"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="https://example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.homepage?.message}
                leftIcon="link-outline"
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
          
          <Button
            title="Set Custom Homepage"
            onPress={handleSubmit(onSubmit)}
            gradient
            className="mt-4"
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}