import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, radii, typography, freshnessColor } from "../theme/theme";

export default function ResultScreen({ route, navigation }) {
  const { prediction } = route.params;
  const badgeColor = freshnessColor(prediction.result);

  const labels = {
    FRESH: "Fresh",
    MEDIUM: "Medium fresh",
    SPOILED: "Spoiled / not recommended",
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: prediction.imageUrl }} style={styles.image} />

      <View style={[styles.resultCard, { borderColor: badgeColor }]}>
        <View style={[styles.dot, { backgroundColor: badgeColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.title, { color: badgeColor }]}>{labels[prediction.result]}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: spacing(0.5) }}>
            {prediction.confidence}% confidence
          </Text>
        </View>
      </View>

      <Text style={[typography.body, { marginTop: spacing(2) }]}>{prediction.explanation}</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Dashboard")}>
        <Text style={styles.primaryButtonText}>Back to dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("PhotoUpload")}>
        <Text style={styles.link}>Check another photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  image: { width: "100%", height: 220, borderRadius: radii.lg, marginBottom: spacing(2), backgroundColor: colors.border },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: spacing(2),
  },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: spacing(1.5) },
  primaryButton: {
    backgroundColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.75),
    alignItems: "center",
    marginTop: spacing(4),
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  link: { color: colors.deep, textAlign: "center", marginTop: spacing(2), fontWeight: "600" },
});
