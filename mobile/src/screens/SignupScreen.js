import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup() {
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
      // On register: auto-login and redirect to Dashboard happens automatically
      // because the navigator switches stacks once `user` is set.
    } catch (err) {
      const message = err?.response?.data?.error || "Could not create account.";
      setError(message);
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.eyebrow}>FISH FRESHNESS</Text>
      <Text style={typography.display}>Create your account</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
        Start checking freshness in seconds.
      </Text>

      <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={confirm} onChangeText={setConfirm} />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? "Creating account..." : "Sign up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
  error: { color: colors.spoiled, marginBottom: spacing(1.5) },
});
