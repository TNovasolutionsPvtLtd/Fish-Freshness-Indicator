import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { colors, spacing, radii, typography } from "../theme/theme";

export default function PhotoUploadScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showToast("Allow camera access to take a photo.");
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

      const { data } = await api.post("/predict", formData);

      navigation.navigate("Result", { prediction: data });
    } catch (err) {
      showToast(err?.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
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
        <TouchableOpacity style={[styles.secondaryButton, { marginRight: spacing(1.5) }]} onPress={takePhoto}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  contentContainer: { flexGrow: 1, backgroundColor: colors.background, padding: spacing(3), paddingBottom: spacing(18) },
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
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing(2) },
  secondaryButton: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(2),
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: colors.deep, fontWeight: "700", fontSize: 13, textAlign: "center" },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.deep,
    borderRadius: radii.pill,
    paddingVertical: spacing(1.75),
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing(2),
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.5 },
});
