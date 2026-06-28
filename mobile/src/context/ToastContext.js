import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, typography } from "../theme/theme";

const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setToast((current) => ({ ...current, visible: false })));
  }, [opacity]);

  const showToast = useCallback(
    (message, type = "error") => {
      if (!message) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ visible: true, message, type });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
        timeoutRef.current = null;
      }, 3500);
    },
    [hideToast, opacity]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity,
              backgroundColor: toast.type === "error" ? colors.spoiled : colors.fresh,
            },
          ]}
        >
          <Text style={styles.text}>{toast.message}</Text>
          <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing(3),
    right: spacing(3),
    bottom: spacing(4),
    borderRadius: 12,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    color: colors.white,
    flex: 1,
    ...typography.body,
  },
  closeButton: {
    marginLeft: spacing(2),
    padding: spacing(0.5),
  },
  closeText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 18,
  },
});
