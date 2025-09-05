import React from 'react';
import { Text, TextProps } from 'react-native';
import { useRTL } from '../hooks/useRTL';
import { cn } from '../lib/utils';

interface RTLTextProps extends TextProps {
  children: React.ReactNode;
}

export const RTLText: React.FC<RTLTextProps> = ({ 
  children, 
  className,
  style,
  ...props 
}) => {
  const { isRTL, textAlign } = useRTL();
  
  return (
    <Text 
      className={cn(
        isRTL ? 'text-right' : 'text-left',
        className
      )}
      style={[
        { textAlign: textAlign as any, writingDirection: isRTL ? 'rtl' : 'ltr' },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};