import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { Button } from '@/shared/ui/buttons/Button';

export default function AboutScreen() {
  const appInfo = {
    name: 'Aura Browser',
    version: '1.0.0',
    buildNumber: '100',
    developer: 'Aura Team',
    website: 'https://aura-browser.com',
    support: 'support@aura-browser.com',
    privacy: 'https://aura-browser.com/privacy',
    terms: 'https://aura-browser.com/terms',
  };

  const features = [
    'Fast and secure browsing',
    'Advanced privacy protection',
    'Ad and tracker blocking',
    'Night mode for comfortable reading',
    'Desktop mode support',
    'Bookmark and history sync',
    'Incognito browsing',
    'Multiple search engines',
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">About</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {/* App Icon and Info */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-3xl bg-primary-500/20 items-center justify-center mb-4">
            <Ionicons name="globe" size={48} color="#4285f4" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">{appInfo.name}</Text>
          <Text className="text-lg text-white/70 mb-1">Version {appInfo.version}</Text>
          <Text className="text-sm text-white/50">Build {appInfo.buildNumber}</Text>
        </View>

        {/* Description */}
        <View className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <Text className="text-white text-base leading-6 text-center">
            Aura Browser is a fast, secure, and privacy-focused web browser designed for modern mobile browsing. 
            Experience the web with advanced features and complete control over your privacy.
          </Text>
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-white mb-4">Key Features</Text>
          <View className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-center p-4 border-b border-white/5 last:border-b-0">
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" className="mr-3" />
                <Text className="text-white flex-1">{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Developer Info */}
        <View className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <Text className="text-lg font-bold text-white mb-4">Developer</Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={20} color="#4285f4" className="mr-3" />
              <Text className="text-white">{appInfo.developer}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleOpenLink(appInfo.website)}
              className="flex-row items-center"
            >
              <Ionicons name="globe-outline" size={20} color="#4285f4" className="mr-3" />
              <Text className="text-primary-400">{appInfo.website}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleOpenLink(`mailto:${appInfo.support}`)}
              className="flex-row items-center"
            >
              <Ionicons name="mail-outline" size={20} color="#4285f4" className="mr-3" />
              <Text className="text-primary-400">{appInfo.support}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View className="space-y-3 mb-8">
          <Button
            title="Privacy Policy"
            onPress={() => handleOpenLink(appInfo.privacy)}
            variant="outline"
            icon={<Ionicons name="shield-outline" size={20} color="#4285f4" />}
          />
          <Button
            title="Terms of Service"
            onPress={() => handleOpenLink(appInfo.terms)}
            variant="outline"
            icon={<Ionicons name="document-text-outline" size={20} color="#4285f4" />}
          />
        </View>

        {/* Copyright */}
        <View className="items-center pb-8">
          <Text className="text-white/50 text-sm text-center">
            © 2024 {appInfo.developer}. All rights reserved.
          </Text>
          <Text className="text-white/50 text-sm text-center mt-2">
            Made with ❤️ for better browsing experience
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}