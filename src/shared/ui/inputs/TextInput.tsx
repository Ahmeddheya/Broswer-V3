import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/shared/lib/utils';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
  inputClassName?: string;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName,
  inputClassName,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text className="text-white font-medium mb-2 text-base">
          {label}
        </Text>
      )}
      
      <View 
        className={cn(
          'flex-row items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20',
          isFocused && 'border-primary-500 bg-white/15',
          error && 'border-red-500 bg-red-500/10',
          'min-h-[52px]'
        )}
      >
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={error ? '#ff6b6b' : isFocused ? '#4285f4' : 'rgba(255, 255, 255, 0.6)'} 
            className="mr-3"
          />
        )}
        
        <RNTextInput
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          className={cn(
            'flex-1 text-white text-base',
            inputClassName
          )}
        />
        
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-3 p-1">
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-red-400 text-sm mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};