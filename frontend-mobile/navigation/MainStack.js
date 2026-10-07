import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import MainTabs from "./MainTabs";
import NewsScreen from "../screens/NewsScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import AnnouncementScreen from "../screens/AnnouncementScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import QiblaScreen from "../screens/QiblaScreen";

import ProjectDetailsScreen from "../screens/ProjectDetailsScreen";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ================= MAIN TABS ================= */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      {/* ================= AUTH ================= */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      {/* ================= OTHER SCREENS ================= */}
      <Stack.Screen
        name="QiblaScreen"
        component={QiblaScreen}
      />

      <Stack.Screen
        name="ChatbotScreen"
        component={ChatbotScreen}
      />

      <Stack.Screen
        name="Announcement"
        component={AnnouncementScreen}
        options={{
          presentation: "transparentModal",
          animation: "fade",
          contentStyle: {
            backgroundColor: "transparent",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
  name="News"
  component={NewsScreen}
/>

      {/* ================= PROJECT DETAILS ================= */}
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}