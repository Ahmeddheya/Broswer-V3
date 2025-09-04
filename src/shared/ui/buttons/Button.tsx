import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/shared/lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  gradient = false,
  className,
  textClassName,
}) => {
  const baseClasses = 'rounded-xl items-center justify-center flex-row';
  
  const sizeClasses = {
    sm: 'px-3 py-2 min-h-[36px]',
    md: 'px-4 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  };
  
  const variantClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    outline: 'border-2 border-primary-500 bg-transparent',
    ghost: 'bg-transparent',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-primary-500 font-semibold',
    ghost: 'text-primary-500 font-medium',
  };

  const isDisabled = disabled || loading;

  const buttonContent = (
    <View className="flex-row items-center justify-center">
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#4285f4' : '#ffffff'} 
          className="mr-2"
        />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <View className="mr-2">{icon}</View>
      )}
      <Text 
        className={cn(
          textSizeClasses[size],
          textVariantClasses[variant],
          isDisabled && 'opacity-50',
          textClassName
        )}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && !loading && (
        <View className="ml-2">{icon}</View>
      )}
    </View>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        className={cn(baseClasses, sizeClasses[size], isDisabled && 'opacity-50', className)}
      >
        <LinearGradient
          colors={['#4285f4', '#5a95f5']}
          className={cn('absolute inset-0 rounded-xl')}
        />
        {buttonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        isDisabled && 'opacity-50',
        className
      )}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};