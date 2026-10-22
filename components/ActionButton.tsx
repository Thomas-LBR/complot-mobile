import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { C, sansBold } from '../game/theme';
import Text from './Text';
type Variant = 'primary' | 'danger' | 'warning' | 'ghost' | 'success' | 'purple';
export default function ActionButton({ label, onPress, variant = 'primary', disabled, loading, style, small }: { label: string; onPress: () => void; variant?: Variant; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const solid = variant === 'primary' || variant === 'warning', locked = !!disabled || !!loading;
  const color = solid ? '#203024' : variant === 'danger' ? C.red : variant === 'success' ? C.mint : C.text;
  const animate = (value: number) => { scale.value = withTiming(value, { duration: 140, reduceMotion: ReduceMotion.System }); };
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: locked, busy: !!loading }} disabled={locked} onPress={onPress} onPressIn={() => animate(0.97)} onPressOut={() => animate(1)} onHoverIn={() => animate(1.025)} onHoverOut={() => animate(1)} style={[{ opacity: locked ? 0.42 : 1 }, style]}>
    <Animated.View style={[motion, { borderWidth: 1, borderColor: solid ? '#D8BA80' : variant === 'success' ? '#426851' : C.line, borderRadius: 8, overflow: 'hidden', boxShadow: solid ? '0px 4px 12px rgba(0,0,0,0.18)' : undefined }]}>
      <LinearGradient colors={solid ? ['#E9D3A4', '#C4A36A'] : variant === 'success' ? ['#274733', '#193325'] : ['#1C332A', '#11251E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ minHeight: 44, paddingVertical: small ? 11 : 16, paddingHorizontal: small ? 13 : 21, alignItems: 'center', justifyContent: 'center' }}>
          {loading ? <ActivityIndicator color={color} /> : <Text style={{ color, fontSize: small ? 11 : 13, fontFamily: sansBold, textAlign: 'center', letterSpacing: 0.3 }}>{label}</Text>}
        </View>
      </LinearGradient>
    </Animated.View>
  </Pressable>;
}

