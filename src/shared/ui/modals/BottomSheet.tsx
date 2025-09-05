import React, { useEffect } from 'react';
import { View, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  enablePanDown?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  enablePanDown = true,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const snapPointsPixels = snapPoints.map(point => SCREEN_HEIGHT * (1 - point));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1);
      translateY.value = withSpring(snapPointsPixels[initialSnap]);
    } else {
      opacity.value = withTiming(0);
      translateY.value = withTiming(SCREEN_HEIGHT);
    }
  }, [visible, translateY, opacity, snapPointsPixels, initialSnap]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (enablePanDown) {
        translateY.value = context.startY + event.translationY;
      }
    },
    onEnd: (event) => {
      if (enablePanDown) {
        const shouldClose = event.velocityY > 500 || translateY.value > SCREEN_HEIGHT * 0.7;
        
        if (shouldClose) {
          translateY.value = withTiming(SCREEN_HEIGHT);
          opacity.value = withTiming(0, {}, () => {
            runOnJS(onClose)();
          });
        } else {
          // Snap to nearest point
          const closest = snapPointsPixels.reduce((prev, curr) =>
            Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev
          );
          translateY.value = withSpring(closest);
        }
      }
    },
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1">
          <Animated.View
            style={[backdropStyle]}
            className="absolute inset-0 bg-black/50"
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>

          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
              style={[sheetStyle]}
              className="absolute inset-x-0 bottom-0 bg-background-secondary rounded-t-3xl border-t border-white/10"
            >
              {/* Handle */}
              <View className="items-center py-3">
                <View className="w-12 h-1 bg-white/30 rounded-full" />
              </View>
              
              {children}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};