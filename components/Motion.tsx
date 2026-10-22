import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
const arrive = FadeInDown.duration(420).reduceMotion(ReduceMotion.System);
export function Entrance({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={arrive} style={style}>{children}</Animated.View>;
}

