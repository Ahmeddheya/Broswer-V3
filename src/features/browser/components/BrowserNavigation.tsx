import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BrowserNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  onTabs: () => void;
  onMenu: () => void;
  isHomePage: boolean;
}

export const BrowserNavigation: React.FC<BrowserNavigationProps> = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onHome,
  onTabs,
  onMenu,
  isHomePage,
}) => {
  return (
    <View className="bg-background-secondary/90 px-5 py-3 border-t border-white/10">
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={onBack}
          disabled={!canGoBack && !isHomePage}
          className={`w-11 h-11 rounded-full bg-white/10 items-center justify-center ${
            (!canGoBack && !isHomePage) ? 'opacity-50' : ''
          }`}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={canGoBack || isHomePage ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onForward}
          disabled={!canGoForward}
          className={`w-11 h-11 rounded-full bg-white/10 items-center justify-center ${
            !canGoForward ? 'opacity-50' : ''
          }`}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={canGoForward ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onHome}
          className={`w-11 h-11 rounded-full items-center justify-center ${
            isHomePage ? 'bg-primary-500/20' : 'bg-white/10'
          }`}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={isHomePage ? '#4285f4' : '#ffffff'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTabs}
          className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="copy-outline" size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onMenu}
          className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};