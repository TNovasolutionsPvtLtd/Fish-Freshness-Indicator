import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function PhotoUploadScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function submit() {
    if (!imageUri) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const ext = filename.split(".").pop();
      formData.append("image", { uri: imageUri, name: filename, type: `image/${ext}` });

      const { data } = await api.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigation.navigate("Result", { prediction: data });
    } catch (err) {
      Alert.alert("Prediction failed", err?.response?.data?.error || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typography.title}>Photograph the eye or gill</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing(3) }]}>
        Use good lighting and fill the frame, as close to the eye or gill as possible.
      </Text>

      <View style={styles.previewBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <Text style={{ color: colors.textSecondary }}>No photo selected</Text>
        )}
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
          <Text style={styles.secondaryButtonText}>Take photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={pickFromLibrary}>
          <Text style={styles.secondaryButtonText}>Choose from gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, (!imageUri || loading) && styles.disabled]}
        onPress={submit}
        disabled={!imageUri || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Analyse freshness</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  previewBox: {
    height: 240,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing(2),
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%" },
  row: { flexDirection: "row", gap: spacing(1.5), marginBottom: spacing(2) },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.5),
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.deep, fontWeight: "700" },
  primaryButton: {
    backgroundColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.75),
    alignItems: "center",
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.5 },
});
