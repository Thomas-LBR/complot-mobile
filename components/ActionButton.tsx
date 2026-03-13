import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

type Variant = "primary" | "danger" | "warning" | "ghost" | "success" | "purple";

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

const COLORS: Record<Variant, { bg: string; border: string; text: string; shadow: string }> = {
  primary: { bg: "#1a3a08",  border: "#3a8018", text: "#88ee44", shadow: "#44cc22" },
  danger:  { bg: "#2a0404",  border: "#aa1818", text: "#ee5544", shadow: "#cc2222" },
  warning: { bg: "#2a1800",  border: "#bb6600", text: "#ffaa22", shadow: "#cc7700" },
  ghost:   { bg: "#0c0804",  border: "#443322", text: "#886644", shadow: "#000" },
  success: { bg: "#001a10",  border: "#188844", text: "#44ddaa", shadow: "#22aa66" },
  purple:  { bg: "#160016",  border: "#882299", text: "#dd66ff", shadow: "#aa22cc" },
};

export default function ActionButton({
  label, onPress, variant = "primary", disabled, loading, style, small,
}: ActionButtonProps) {
  const c = COLORS[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.btn,
        {
          backgroundColor: c.bg,
          borderColor: disabled ? "#333" : c.border,
          shadowColor: c.shadow,
          opacity: disabled ? 0.45 : 1,
          paddingVertical: small ? 6 : 10,
          paddingHorizontal: small ? 12 : 18,
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color={c.text} />
        : <Text style={[styles.label, { color: disabled ? "#555" : c.text, fontSize: small ? 12 : 14 }]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  label: {
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});