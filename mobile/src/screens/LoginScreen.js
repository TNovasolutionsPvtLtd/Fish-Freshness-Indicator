import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("thiba800@hotmail.com");
  const [password, setPassword] = useState("Thiba@080494");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const message = err?.response?.data?.error || "Could not log in. Check your details.";
      setError(message);
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: spacing(3), justifyContent: "center", flexGrow: 1 },
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
