import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not log in. Check your details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.eyebrow}>FISH FRESHNESS</Text>
      <Text style={typography.display}>Welcome back</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
        Log in to check a catch or review your history.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? "Logging in..." : "Log in"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>New here? Create an account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("AdminLogin")} style={{ marginTop: spacing(6) }}>
        <Text style={styles.linkMuted}>Admin login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3), justifyContent: "center" },
  eyebrow: { ...typography.caption, color: colors.accent, marginBottom: spacing(1) },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    marginBottom: spacing(1.5),
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.75),
    alignItems: "center",
    marginTop: spacing(1),
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  link: { color: colors.deep, textAlign: "center", marginTop: spacing(2), fontWeight: "600" },
  linkMuted: { color: colors.textSecondary, textAlign: "center", fontSize: 13 },
  error: { color: colors.spoiled, marginBottom: spacing(1.5) },
});
