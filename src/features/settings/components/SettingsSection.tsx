import React from 'react';
import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <View className="mx-5 mb-8">
      <Text className="text-sm font-bold text-primary-400 uppercase tracking-wide mb-4 px-2">
        {title}
      </Text>
      <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        {children}
      </View>
    </View>
  );
};