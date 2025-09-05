import React from 'react';
import { View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/shared/lib/utils';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  style,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const baseClasses = cn(
    'rounded-xl',
    paddingClasses[padding],
    className
  );

  if (variant === 'gradient') {
    return (
      <View className={cn('rounded-xl', className)} style={style} {...props}>
        <LinearGradient
          colors={['rgba(66, 133, 244, 0.1)', 'rgba(66, 133, 244, 0.05)']}
          className="absolute inset-0 rounded-xl"
        />
        <View className={paddingClasses[padding]}>
          {children}
        </View>
      </View>
    );
  }

  const variantClasses = {
    default: 'bg-white/5 border border-white/10',
    elevated: 'bg-white/10 border border-white/20 shadow-lg',
    outlined: 'bg-transparent border-2 border-primary-500/30',
    gradient: '', // handled above
  };

  return (
    <View
      className={cn(baseClasses, variantClasses[variant])}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};