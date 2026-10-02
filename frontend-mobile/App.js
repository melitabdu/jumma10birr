import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainStack from "./navigation/MainStack";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
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
