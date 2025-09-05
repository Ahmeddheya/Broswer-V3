import React from 'react';
import { View, ViewProps } from 'react-native';
import { useRTL } from '../hooks/useRTL';
import { cn } from '../lib/utils';

interface RTLViewProps extends ViewProps {
  children: React.ReactNode;
  reverse?: boolean;
}

export const RTLView: React.FC<RTLViewProps> = ({ 
  children, 
  reverse = false, 
  className,
  style,
  ...props 
}) => {
  const { isRTL } = useRTL();
  
  const shouldReverse = reverse ? !isRTL : isRTL;
  
  return (
    <View 
      className={cn(
        shouldReverse ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};