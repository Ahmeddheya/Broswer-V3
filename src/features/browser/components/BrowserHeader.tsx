import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchInput } from '@/shared/ui/inputs/SearchInput';

interface BrowserHeaderProps {
  title?: string;
  showUrlBar?: boolean;
  url?: string;
  onUrlChange?: (url: string) => void;
  onUrlSubmit?: () => void;
  isLoading?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  onReload?: () => void;
  onNewTab?: () => void;
  onFindInPage?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  incognitoMode?: boolean;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  title = 'Aura Browser',
  showUrlBar = false,
  url = '',
  onUrlChange,
  onUrlSubmit,
  isLoading = false,
  canGoBack = false,
  canGoForward = false,
  onBack,
  onForward,
  onReload,
  onNewTab,
  onFindInPage,
  onBookmark,
  isBookmarked = false,
  incognitoMode = false,
}) => {
  if (showUrlBar) {
    return (
      <View className="bg-background-secondary/90 px-4 py-3 pt-12 border-b border-white/10">
        <View className="flex-row items-center space-x-2">
          {/* Navigation Buttons */}
          <TouchableOpacity
            onPress={onBack}
            disabled={!canGoBack}
            className={`w-9 h-9 rounded-full bg-white/10 items-center justify-center ${
              !canGoBack ? 'opacity-50' : ''
            }`}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={canGoBack ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onForward}
            disabled={!canGoForward}
            className={`w-9 h-9 rounded-full bg-white/10 items-center justify-center ${
              !canGoForward ? 'opacity-50' : ''
            }`}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={canGoForward ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onReload}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* URL Bar */}
          <View className="flex-1 mx-3">
            <SearchInput
              value={url}
              onChangeText={onUrlChange || (() => {})}
              onSubmit={onUrlSubmit}
              placeholder="Search Google or type a URL"
              leftIcon={url.startsWith('https') ? 'lock-closed' : 'globe-outline'}
              rightIcon={isLoading ? undefined : undefined}
              className="min-h-[40px]"
            />
            {isLoading && (
              <View className="absolute right-3 top-1/2 -translate-y-1/2">
                <ActivityIndicator size="small" color="#4285f4" />
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={onBookmark}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={isBookmarked ? "#4CAF50" : "#ffffff"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onNewTab}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-background-secondary/90 px-5 py-4 pt-12 border-b border-white/10">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onReload}
          className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="refresh-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View className="flex-1 items-center">
          <Text className={`text-xl font-bold ${incognitoMode ? 'text-red-400' : 'text-white'}`}>
            {title}
          </Text>
          {incognitoMode && (
            <Text className="text-xs text-red-400 font-semibold uppercase tracking-wide mt-1">
              Incognito
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          onPress={onNewTab}
          className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};