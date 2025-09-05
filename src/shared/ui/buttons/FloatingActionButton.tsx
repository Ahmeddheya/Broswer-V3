import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  gradient?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  position = 'bottom-right',
  gradient = true,
  style,
}) => {
  const scale = useSharedValue(1);

  const sizeConfig = {
    sm: { width: 48, height: 48, iconSize: 20 },
    md: { width: 56, height: 56, iconSize: 24 },
    lg: { width: 64, height: 64, iconSize: 28 },
  };

  const positionConfig = {
    'bottom-right': 'absolute bottom-6 right-6',
    'bottom-left': 'absolute bottom-6 left-6',
    'bottom-center': 'absolute bottom-6 self-center',
  };

  const config = sizeConfig[size];

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonContent = (
    <Ionicons name={icon} size={config.iconSize} color="#ffffff" />
  );

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          width: config.width,
          height: config.height,
          borderRadius: config.width / 2,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        style,
      ]}
      className={`${positionConfig[position]} items-center justify-center`}
    >
      {gradient ? (
        <LinearGradient
          colors={['#4285f4', '#5a95f5']}
          className="absolute inset-0 rounded-full"
        />
      ) : (
        <View className="absolute inset-0 bg-primary-500 rounded-full" />
      )}
      {buttonContent}
    </AnimatedTouchableOpacity>
  );
};