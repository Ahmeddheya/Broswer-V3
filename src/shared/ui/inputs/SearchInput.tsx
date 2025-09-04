import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/shared/lib/utils';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  showClearButton?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  autoFocus = false,
  className,
  inputClassName,
  showClearButton = true,
  leftIcon = 'search',
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View 
      className={cn(
        'flex-row items-center bg-white/10 rounded-2xl px-4 py-3 border border-white/20',
        isFocused && 'border-primary-500 bg-white/15',
        className
      )}
    >
      {leftIcon && (
        <Ionicons 
          name={leftIcon} 
          size={20} 
          color="rgba(255, 255, 255, 0.6)" 
          className="mr-3"
        />
      )}
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className={cn(
          'flex-1 text-white text-base',
          inputClassName
        )}
      />
      
      {showClearButton && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2 p-1">
          <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      )}
      
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} className="ml-2 p-1">
          <Ionicons name={rightIcon} size={20} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      )}
    </View>
  );
};