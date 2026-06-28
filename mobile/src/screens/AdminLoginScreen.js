import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function AdminLoginScreen({ navigation }) {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role !== "admin") {
        // Regular users cannot access the admin area - sign them back out
        // of this session and show an explicit message.
        await logout();
        setError("This account does not have admin access.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ADMIN AREA</Text>
      <Text style={typography.display}>Admin login</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
        Manage the training dataset, model rollout, and users.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Admin email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? "Logging in..." : "Log in as admin"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Back to user login</Text>
      </TouchableOpacity>
    </View>
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
  link: { color: colors.textSecondary, textAlign: "center", marginTop: spacing(2) },
  error: { color: colors.spoiled, marginBottom: spacing(1.5) },
});
