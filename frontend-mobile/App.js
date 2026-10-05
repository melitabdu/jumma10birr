import React, { useEffect } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainStack from "./navigation/MainStack";

import { AuthProvider } from "./context/AuthContext";

import {
  registerForPushNotificationsAsync,
} from "./services/notificationService";

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}