import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { colors, spacing, radii, typography } from "../theme/theme";

const SPECIES = ["Indian Mackerel", "Oil Sardine"];
const FRESHNESS = ["FRESH", "MEDIUM", "SPOILED"];
const BODY_PARTS = ["eye", "gill", "body"];
const TIME_POINTS = [0, 2, 6, 8, 12, 24, 48];

function ChipRow({ options, value, onChange }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={String(opt)}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{String(opt)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ImageUploadScreen() {
  const { showToast } = useToast();
  const [imageUri, setImageUri] = useState(null);
  const [species, setSpecies] = useState(SPECIES[0]);
  const [timeHours, setTimeHours] = useState(TIME_POINTS[0]);
  const [freshnessClass, setFreshnessClass] = useState(FRESHNESS[0]);
  const [bodyPart, setBodyPart] = useState(BODY_PARTS[0]);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function submit() {
    if (!imageUri) {
      showToast("Add a photo first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const ext = filename.split(".").pop();
      formData.append("image", { uri: imageUri, name: filename, type: `image/${ext}` });
      formData.append("species", species);
      formData.append("timeHours", String(timeHours));
      formData.append("freshnessClass", freshnessClass);
      formData.append("bodyPart", bodyPart);

      await api.post("/admin/images", formData);

      showToast("Added to dataset. The labelled photo was saved.", "success");
      setImageUri(null);
    } catch (err) {
      showToast(err?.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
      <Text style={typography.title}>Add a labelled training photo</Text>

      <TouchableOpacity style={styles.previewBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <Text style={{ color: colors.textSecondary }}>Tap to choose a photo</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Species</Text>
      <ChipRow options={SPECIES} value={species} onChange={setSpecies} />

      <Text style={styles.fieldLabel}>Time after landing (hours)</Text>
      <ChipRow options={TIME_POINTS} value={timeHours} onChange={setTimeHours} />

      <Text style={styles.fieldLabel}>Freshness label</Text>
      <ChipRow options={FRESHNESS} value={freshnessClass} onChange={setFreshnessClass} />

      <Text style={styles.fieldLabel}>Body part</Text>
      <ChipRow options={BODY_PARTS} value={bodyPart} onChange={setBodyPart} />

      <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Add to dataset</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing(3) },
  previewBox: {
    height: 160,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing(2),
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%" },
  fieldLabel: { ...typography.caption, marginTop: spacing(2), marginBottom: spacing(1) },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    marginRight: spacing(1),
    marginBottom: spacing(1),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.deep, borderColor: colors.deep },
  chipText: { color: colors.textPrimary, fontSize: 13 },
  chipTextActive: { color: colors.white, fontWeight: "700" },
  primaryButton: {
    backgroundColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.75),
    alignItems: "center",
    marginTop: spacing(3),
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
