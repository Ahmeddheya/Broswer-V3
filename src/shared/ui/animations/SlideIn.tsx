import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface SlideInProps extends ViewProps {
  children: React.ReactNode;
  from: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
  distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  from,
  delay = 0,
  duration = 400,
  distance = 100,
  style,
  ...props
}) => {
  const translateX = useSharedValue(
    from === 'left' ? -distance : from === 'right' ? distance : 0
  );
  const translateY = useSharedValue(
    from === 'top' ? -distance : from === 'bottom' ? distance : 0
  );
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: duration / 2 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};