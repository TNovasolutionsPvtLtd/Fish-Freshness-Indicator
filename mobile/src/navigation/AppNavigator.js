import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/theme";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import PhotoUploadScreen from "../screens/PhotoUploadScreen";
import ResultScreen from "../screens/ResultScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import ImageUploadScreen from "../screens/ImageUploadScreen";
import DatabaseViewScreen from "../screens/DatabaseViewScreen";
import UserManagementScreen from "../screens/UserManagementScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.deep },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: "700" },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} options={{ title: "Check Freshness" }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Result" }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ImageUpload" component={ImageUploadScreen} options={{ title: "Add training photo" }} />
      <Stack.Screen name="DatabaseView" component={DatabaseViewScreen} options={{ title: "Dataset" }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: "Users" }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.deep} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : isAdmin ? <AdminStack /> : <UserStack />}
    </NavigationContainer>
  );
}
