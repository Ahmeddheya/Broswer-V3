import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  showPercentage = false,
  color = '#4285f4',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  className,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, {
      damping: 15,
      stiffness: 150,
    });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className={className}>
      {showPercentage && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white/70 text-sm">Progress</Text>
          <Text className="text-white font-medium text-sm">{Math.round(progress)}%</Text>
        </View>
      )}
      <View
        className="rounded-full overflow-hidden"
        style={{ height, backgroundColor }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[animatedStyle, { backgroundColor: color }]}
        />
      </View>
    </View>
  );
};