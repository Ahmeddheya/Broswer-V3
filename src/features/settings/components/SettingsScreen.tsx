import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { useBrowserStore } from '@/shared/store/browser';
import { useAuthStore } from '@/shared/store/auth';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';
import { UserProfile } from './UserProfile';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearHistory, clearDownloads } = useBrowserStore();
  const { user, logout } = useAuthStore();

  const handleClearData = (type: 'history' | 'downloads' | 'all') => {
    const actions = {
      history: () => clearHistory(),
      downloads: () => clearDownloads(),
      all: () => {
        clearHistory();
        clearDownloads();
      },
    };
    
    actions[type]();
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Settings</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings/about')}>
            <Ionicons name="information-circle-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        {user && (
          <UserProfile user={user} onEditProfile={() => router.push('/(tabs)/settings/profile')} />
        )}

        {/* General Settings */}
        <SettingsSection title="General">
          <SettingsItem
            icon="search-outline"
            title="Search Engine"
            subtitle={settings.searchEngine.charAt(0).toUpperCase() + settings.searchEngine.slice(1)}
            onPress={() => router.push('/(tabs)/settings/search-engine')}
            showArrow
          />
          <SettingsItem
            icon="home-outline"
            title="Homepage"
            subtitle={settings.homepage}
            onPress={() => router.push('/(tabs)/settings/homepage')}
            showArrow
          />
          <SettingsItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => router.push('/(tabs)/settings/language')}
            showArrow
          />
        </SettingsSection>

        {/* Privacy & Security */}
        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon="shield-outline"
            title="Ad Blocker"
            subtitle="Block ads and trackers"
            value={settings.adBlockEnabled}
            onToggle={(value) => updateSettings({ adBlockEnabled: value })}
            type="switch"
          />
          <SettingsItem
            icon="eye-off-outline"
            title="Incognito Mode"
            subtitle="Browse without saving data"
            value={settings.incognitoMode}
            onToggle={(value) => updateSettings({ incognitoMode: value })}
            type="switch"
          />
          <SettingsItem
            icon="save-outline"
            title="Save History"
            subtitle="Automatically save browsing history"
            value={settings.autoSaveHistory}
            onToggle={(value) => updateSettings({ autoSaveHistory: value })}
            type="switch"
          />
          <SettingsItem
            icon="key-outline"
            title="Password Manager"
            subtitle="Manage saved passwords"
            onPress={() => router.push('/(tabs)/settings/passwords')}
            showArrow
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={settings.darkMode}
            onToggle={(value) => updateSettings({ darkMode: value })}
            type="switch"
          />
          <SettingsItem
            icon="moon"
            title="Night Mode"
            subtitle="Apply night filter to pages"
            value={settings.nightMode}
            onToggle={(value) => updateSettings({ nightMode: value })}
            type="switch"
          />
          <SettingsItem
            icon="desktop-outline"
            title="Desktop Mode"
            subtitle="Request desktop version of sites"
            value={settings.desktopMode}
            onToggle={(value) => updateSettings({ desktopMode: value })}
            type="switch"
          />
          <SettingsItem
            icon="color-palette-outline"
            title="Theme"
            subtitle="Customize app appearance"
            onPress={() => router.push('/(tabs)/settings/theme')}
            showArrow
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management">
          <SettingsItem
            icon="trash-outline"
            title="Clear History"
            subtitle="Remove all browsing history"
            onPress={() => handleClearData('history')}
            destructive
          />
          <SettingsItem
            icon="download-outline"
            title="Clear Downloads"
            subtitle="Remove all download records"
            onPress={() => handleClearData('downloads')}
            destructive
          />
          <SettingsItem
            icon="nuclear-outline"
            title="Clear All Data"
            subtitle="Reset all browser data"
            onPress={() => handleClearData('all')}
            destructive
          />
          <SettingsItem
            icon="cloud-upload-outline"
            title="Sync Settings"
            subtitle="Backup and sync your data"
            onPress={() => router.push('/(tabs)/settings/sync')}
            showArrow
          />
        </SettingsSection>

        {/* Advanced */}
        <SettingsSection title="Advanced">
          <SettingsItem
            icon="code-outline"
            title="Developer Tools"
            subtitle="Debug and development options"
            onPress={() => router.push('/(tabs)/settings/developer')}
            showArrow
          />
          <SettingsItem
            icon="bug-outline"
            title="Report Issue"
            subtitle="Send feedback or report bugs"
            onPress={() => router.push('/(tabs)/settings/feedback')}
            showArrow
          />
          <SettingsItem
            icon="document-text-outline"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => router.push('/(tabs)/settings/privacy-policy')}
            showArrow
          />
          <SettingsItem
            icon="document-outline"
            title="Terms of Service"
            subtitle="Read terms and conditions"
            onPress={() => router.push('/(tabs)/settings/terms')}
            showArrow
          />
        </SettingsSection>

        {/* Account */}
        {user && (
          <SettingsSection title="Account">
            <SettingsItem
              icon="log-out-outline"
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={() => logout()}
              destructive
            />
          </SettingsSection>
        )}

        {/* App Info */}
        <View className="bg-white/5 rounded-2xl p-6 mx-5 mb-8 border border-white/10 items-center">
          <View className="w-16 h-16 rounded-full bg-primary-500/20 items-center justify-center mb-4">
            <Ionicons name="globe" size={32} color="#4285f4" />
          </View>
          <Text className="text-xl font-bold text-white mb-2">Aura Browser</Text>
          <Text className="text-sm text-white/60 mb-4">Version 1.0.0</Text>
          <Text className="text-sm text-white/70 text-center leading-5">
            Fast, secure browser with advanced privacy features and smooth browsing experience
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};