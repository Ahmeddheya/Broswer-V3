import React, { useState } from 'react';
import { View, Image, ImageProps, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useImageCache } from '../hooks/useImageCache';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  cacheOptions?: {
    maxAge?: number;
    maxSize?: number;
  };
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  placeholder,
  fallback,
  cacheOptions,
  style,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const { cachedUri, isLoading, error } = useImageCache(uri, cacheOptions);

  if (isLoading) {
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
        {placeholder || <ActivityIndicator size="small" color="#4285f4" />}
      </View>
    );
  }

  if (error || imageError || !cachedUri) {
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
        {fallback || <Ionicons name="image-outline" size={24} color="#666" />}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: cachedUri }}
      style={style}
      onError={() => setImageError(true)}
      {...props}
    />
  );
};