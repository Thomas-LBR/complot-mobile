import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { EngineProvider } from "../game/EngineContext";

export default function RootLayout() {
  return (
    <EngineProvider>
      <View style={{ flex: 1, backgroundColor: "#050402" }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#050402" },
            animation: "fade",
          }}
        />
      </View>
    </EngineProvider>
  );
}