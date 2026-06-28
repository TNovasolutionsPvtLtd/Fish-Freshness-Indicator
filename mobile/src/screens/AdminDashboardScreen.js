import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api
        .get("/admin/stats")
        .then(({ data }) => setStats(data))
        .catch(() => {});
    }, [])
  );

  const cards = [
    { label: "Training images", value: stats?.imageCount },
    { label: "Predictions today", value: stats?.predictionsToday },
    { label: "Total predictions", value: stats?.predictionCount },
    { label: "Registered users", value: stats?.userCount },
  ];

  const links = [
    { label: "Upload training image", screen: "ImageUpload" },
    { label: "Browse dataset", screen: "DatabaseView" },
    { label: "Manage users", screen: "UserManagement" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.title}>Admin dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.statCard}>
            <Text style={styles.statValue}>{c.value ?? "—"}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[typography.title, { marginTop: spacing(4), marginBottom: spacing(1.5) }]}>Manage</Text>
      {links.map((l) => (
        <TouchableOpacity key={l.screen} style={styles.linkRow} onPress={() => navigation.navigate(l.screen)}>
          <Text style={styles.linkText}>{l.label}</Text>
          <Text style={styles.chevron}>{">"}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing(3) },
  logout: { color: colors.textSecondary, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(1.5) },
  statCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
  },
  statValue: { fontSize: 26, fontWeight: "700", color: colors.deep },
  statLabel: { color: colors.textSecondary, marginTop: spacing(0.5), fontSize: 13 },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
    marginBottom: spacing(1.25),
  },
  linkText: { ...typography.body, fontWeight: "600" },
  chevron: { color: colors.textSecondary },
});
