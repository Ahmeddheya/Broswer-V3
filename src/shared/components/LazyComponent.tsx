import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { LoadingSpinner } from '../ui/feedback/LoadingSpinner';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
}) => {
  const defaultFallback = (
    <View className="flex-1 items-center justify-center">
      <LoadingSpinner size={32} />
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Helper function to create lazy-loaded components
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return lazy(importFn);
};