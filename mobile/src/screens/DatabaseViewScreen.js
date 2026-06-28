import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function DatabaseViewScreen() {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState(null); // freshnessClass filter

  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/images", {
        params: filter ? { freshnessClass: filter } : {},
      });
      setImages(data);
    } catch (err) {
      showToast(err?.response?.data?.error || "Unable to load dataset.");
    }
  }, [filter, showToast]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function setStatus(id, status) {
    try {
      await api.patch(`/admin/images/${id}`, { status });
      load();
      showToast(`Image ${status}.`, "success");
    } catch (err) {
      showToast(err?.response?.data?.error || "Unable to update image status.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typography.title}>Dataset</Text>

      <View style={styles.filterRow}>
        {[null, "FRESH", "MEDIUM", "SPOILED"].map((f, index) => (
          <TouchableOpacity
            key={f || "ALL"}
            style={[styles.filterChip, filter === f && styles.filterChipActive, index < 3 && styles.filterChipMargin]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f || "All"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={images}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        ListFooterComponent={<View style={{ height: spacing(4) }} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: spacing(1.5) }}>
              <Text style={[typography.body, { fontWeight: "600" }]}>
                {item.species} · {item.bodyPart} · {item.timeHours}h
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {item.freshnessClass} · {item.status}
              </Text>
            </View>
            {item.status === "pending" && (
              <View style={{ gap: spacing(0.5) }}>
                <TouchableOpacity onPress={() => setStatus(item._id, "approved")}>
                  <Text style={styles.approve}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStatus(item._id, "rejected")}>
                  <Text style={styles.reject}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>No images yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  filterRow: { flexDirection: "row", marginVertical: spacing(2) },
  filterChipMargin: { marginRight: spacing(1) },
  filterChip: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.deep, borderColor: colors.deep },
  filterText: { fontSize: 13, color: colors.textPrimary },
  filterTextActive: { color: colors.white, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing(1.5),
    marginBottom: spacing(1.25),
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 48, height: 48, borderRadius: radii.sm, backgroundColor: colors.border },
  approve: { color: colors.fresh, fontWeight: "700", fontSize: 12 },
  reject: { color: colors.spoiled, fontWeight: "700", fontSize: 12 },
});
