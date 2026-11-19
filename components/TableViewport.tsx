import React, { useState } from 'react';
import { View } from 'react-native';
import TableBoard from './TableBoard';

// Scale the complete table and its effects together, preserving measured trajectories.
export default function TableViewport(props: React.ComponentProps<typeof TableBoard>) {
  const [available, setAvailable] = useState({ width: 0, height: 0 });
  const [height, setHeight] = useState(0);
  const scale = height && available.height ? Math.min(1, available.height / height) : 1;
  return <View style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }} onLayout={e => {
    const { width, height: nextHeight } = e.nativeEvent.layout;
    setAvailable(old => old.width === width && old.height === nextHeight ? old : { width, height: nextHeight });
  }}>
    {available.width > 0 && <View style={{ position: 'absolute', width: available.width, top: Math.max(0, (available.height - height * scale) / 2), transformOrigin: 'top center', transform: [{ scale }] }} onLayout={e => setHeight(e.nativeEvent.layout.height)}>
      <TableBoard {...props}/>
    </View>}
  </View>;
}
