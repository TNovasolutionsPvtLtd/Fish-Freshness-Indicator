import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, Image, StyleSheet } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <AppNavigator />

        <View style={styles.footer} pointerEvents="none">
          <Image source={require("./assets/TNova_logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.powered}>Powered by TNovaSolutions Pvt Ltd</Text>
        </View>
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    opacity: 0.9,
  },
  logo: { width: 28, height: 28, marginRight: 8 },
  powered: { fontSize: 12, color: "#333" },
});
