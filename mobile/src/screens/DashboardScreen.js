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

const ListHeader = () => (
    <>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <Text style={styles.heroLabel}>WELCOME</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Log out</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroTitle}>{user?.name || "Angler"}</Text>
        <Text style={styles.heroSubtitle}>Freshness checks are one tap away.</Text>
      </View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.checkButton} onPress={() => navigation.navigate("PhotoUpload")}>
          <Text style={styles.checkButtonText}>Check Freshness</Text>
          <Text style={styles.checkButtonSub}>Photograph an eye or gill</Text>
        </TouchableOpacity>

        <Text style={[typography.title, { marginTop: spacing(4), marginBottom: spacing(1.5) }]}>Recent checks</Text>
      </View>
    </>
  );

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={<Text style={{ color: colors.textSecondary, paddingHorizontal: spacing(2) }}>No checks yet — tap Check Freshness to start.</Text>}
      renderItem={({ item }) => (
        <View style={styles.historyRow}>
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: spacing(1.5) }}>
            <Text style={[typography.body, { fontWeight: "600" }]}> {new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.confidence}% confidence</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: freshnessColor(item.result) }]}> 
            <Text style={styles.badgeText}>{item.result}</Text>
          </View>
        </View>
      )}
      ListFooterComponent={<View style={{ height: spacing(4) }} />}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  contentContainer: { flexGrow: 1, backgroundColor: colors.background, paddingBottom: spacing(4) },
  container: { backgroundColor: colors.background, paddingHorizontal: spacing(2), paddingTop: spacing(2), paddingBottom: 0 },
  hero: {
    backgroundColor: colors.deep,
    // borderRadius: radii.lg,
    padding: spacing(2),
    marginBottom: spacing(2),
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing(1.5) },
  heroLabel: { color: colors.white, fontSize: 12, fontWeight: "600", letterSpacing: 1, marginBottom: spacing(1) },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: "700", marginBottom: spacing(1) },
  heroSubtitle: { color: colors.white, fontSize: 14, lineHeight: 20 },
  logout: { color: colors.white, fontWeight: "600" },
  checkButton: {
    backgroundColor: colors.deep,
    borderRadius: radii.lg,
    padding: spacing(2),
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
