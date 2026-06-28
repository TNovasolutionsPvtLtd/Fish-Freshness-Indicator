import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleFlag(user) {
    await api.patch(`/admin/users/${user._id}`, { flagged: !user.flagged });
    load();
  }

  return (
    <View style={styles.container}>
      <Text style={typography.title}>Users</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ marginTop: spacing(2) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { fontWeight: "600" }]}>{item.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.email}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {item.predictionCount} prediction{item.predictionCount === 1 ? "" : "s"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleFlag(item)}>
              <Text style={item.flagged ? styles.flagged : styles.flagAction}>
                {item.flagged ? "Flagged" : "Flag"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>No users yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
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
  flagAction: { color: colors.deep, fontWeight: "700", fontSize: 12 },
  flagged: { color: colors.spoiled, fontWeight: "700", fontSize: 12 },
});
