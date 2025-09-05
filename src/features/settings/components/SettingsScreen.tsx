import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { useBrowserStore } from '@/shared/store/browser';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearHistory, clearDownloads } = useBrowserStore();

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

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    onPress, 
    type = 'button',
    destructive = false 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    onPress?: () => void;
    type?: 'switch' | 'button';
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      onPress={type === 'button' ? onPress : undefined}
      style={styles.settingsItem}
    >
      <View style={[
        styles.settingsIcon,
        destructive && styles.destructiveIcon,
        value && type === 'switch' && styles.activeIcon
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={destructive ? '#ff6b6b' : value && type === 'switch' ? '#4CAF50' : '#4285f4'} 
        />
      </View>
      
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingsSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {type === 'switch' && onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#333', true: '#4CAF50' }}
          thumbColor={value ? '#ffffff' : '#666'}
          ios_backgroundColor="#333"
        />
      )}

      {type === 'button' && (
        <Ionicons name="chevron-forward" size={18} color="#666" />
      )}
    </TouchableOpacity>
  );

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <SettingsSection title="General">
          <SettingsItem
            icon="search-outline"
            title="Search Engine"
            subtitle={settings.searchEngine.charAt(0).toUpperCase() + settings.searchEngine.slice(1)}
            onPress={() => console.log('Search engine settings')}
          />
          <SettingsItem
            icon="home-outline"
            title="Homepage"
            subtitle={settings.homepage}
            onPress={() => console.log('Homepage settings')}
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
        </SettingsSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="globe" size={32} color="#4285f4" />
          </View>
          <Text style={styles.appName}>Aura Browser</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Fast, secure browser with advanced privacy features
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285f4',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  destructiveIcon: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  activeIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  destructiveText: {
    color: '#ff6b6b',
  },
  settingsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  appInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});