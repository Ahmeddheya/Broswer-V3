import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  type?: 'switch' | 'button';
  showArrow?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  value = false,
  onToggle,
  onPress,
  type = 'button',
  showArrow = false,
  destructive = false,
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled) return;
    if (type === 'switch' && onToggle) {
      onToggle(!value);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || (type === 'switch' && !onToggle)}
      className={`flex-row items-center py-4 px-4 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
        destructive ? 'bg-red-500/20' : value && type === 'switch' ? 'bg-green-500/20' : 'bg-primary-500/20'
      }`}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={
            destructive ? '#ff6b6b' : 
            value && type === 'switch' ? '#4CAF50' : 
            '#4285f4'
          } 
        />
      </View>
      
      <View className="flex-1">
        <Text className={`text-base font-semibold mb-1 ${
          destructive ? 'text-red-400' : 'text-white'
        }`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-white/70">
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
          disabled={disabled}
        />
      )}

      {showArrow && type === 'button' && (
        <Ionicons name="chevron-forward" size={18} color="#666" />
      )}
    </TouchableOpacity>
  );
};