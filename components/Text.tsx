import React from 'react';
import { Text as NativeText, TextProps } from 'react-native';
import { sans } from '../game/theme';
export default function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily: sans }, style]} />;
}

