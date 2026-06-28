import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { colors, spacing, radii, typography, freshnessColor } from "../theme/theme";

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const { showToast } = useToast();

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/history");
      setHistory(data);
    } catch (err) {
      showToast(err?.response?.data?.error || "Unable to load history.");
    }
  }, [showToast]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={typography.caption}>WELCOME</Text>
          <Text style={typography.title}>{user?.name || "Angler"}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.checkButton} onPress={() => navigation.navigate("PhotoUpload")}>
        <Text style={styles.checkButtonText}>Check Freshness</Text>
        <Text style={styles.checkButtonSub}>Photograph an eye or gill</Text>
      </TouchableOpacity>

      <Text style={[typography.title, { marginTop: spacing(4), marginBottom: spacing(1.5) }]}>
        Recent checks
      </Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary }}>No checks yet — tap Check Freshness to start.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.historyRow}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: spacing(1.5) }}>
              <Text style={[typography.body, { fontWeight: "600" }]}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.confidence}% confidence</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: freshnessColor(item.result) }]}>
              <Text style={styles.badgeText}>{item.result}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing(3) },
  logout: { color: colors.textSecondary, fontWeight: "600" },
  checkButton: {
    backgroundColor: colors.deep,
    borderRadius: radii.lg,
    padding: spacing(3),
  },
  checkButtonText: { color: colors.white, fontSize: 20, fontWeight: "700" },
  checkButtonSub: { color: "#CFE3E6", marginTop: spacing(0.5) },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing(1.5),
    marginBottom: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 48, height: 48, borderRadius: radii.sm, backgroundColor: colors.border },
  badge: { paddingHorizontal: spacing(1.25), paddingVertical: spacing(0.5), borderRadius: radii.pill },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
});
