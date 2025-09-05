import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface FadeInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'scale';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 300,
  from = 'scale',
  style,
  ...props
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(from === 'top' ? -20 : from === 'bottom' ? 20 : 0);
  const translateX = useSharedValue(from === 'left' ? -20 : from === 'right' ? 20 : 0);
  const scale = useSharedValue(from === 'scale' ? 0.9 : 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration });
      translateY.value = withSpring(0);
      translateX.value = withSpring(0);
      scale.value = withSpring(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, opacity, translateY, translateX, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};