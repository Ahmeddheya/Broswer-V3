import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  action,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const typeConfig = {
    success: { icon: 'checkmark-circle', color: '#4CAF50', bg: 'bg-green-500/10' },
    error: { icon: 'close-circle', color: '#ff6b6b', bg: 'bg-red-500/10' },
    warning: { icon: 'warning', color: '#ff9800', bg: 'bg-orange-500/10' },
    info: { icon: 'information-circle', color: '#4285f4', bg: 'bg-blue-500/10' },
  };

  const config = typeConfig[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0);
      opacity.value = withTiming(1);

      const timer = setTimeout(() => {
        translateY.value = withSpring(-100);
        opacity.value = withTiming(0, {}, () => {
          runOnJS(onHide)();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, translateY, opacity, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className={`absolute top-12 left-5 right-5 z-50 ${config.bg} rounded-xl border border-white/10 p-4`}
    >
      <View className="flex-row items-center">
        <Ionicons name={config.icon as any} size={24} color={config.color} />
        <Text className="text-white flex-1 ml-3 font-medium">{message}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} className="ml-3">
            <Text className="text-primary-400 font-semibold">{action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onHide} className="ml-2">
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};