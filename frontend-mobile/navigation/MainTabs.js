
import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import DonateScreen from "../screens/DonateScreen";
import AboutScreen from "../screens/AboutScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide React Navigation header
        headerShown: false,

        // ================================
        // TAB ICONS
        // ================================
        tabBarIcon: ({
          focused,
          color,
          size,
        }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused
              ? "home"
              : "home-outline";
          } else if (route.name === "Projects") {
            iconName = focused
              ? "folder"
              : "folder-outline";
          } else if (route.name === "Donate") {
            iconName = focused
              ? "heart"
              : "heart-outline";
          } else if (route.name === "About") {
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },

        // ================================
        // COLORS
        // ================================
        tabBarActiveTintColor: "#2E8B57",
        tabBarInactiveTintColor: "gray",

        // ================================
        // BOTTOM SAFE AREA
        // ================================
        tabBarStyle: {
          height: 60 + insets.bottom,

          paddingTop: 5,

          paddingBottom:
            insets.bottom > 0
              ? insets.bottom + 4
              : 8,
        },

        // ================================
        // TAB LABEL
        // ================================
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        headerTitleAlign: "center",
      })}
    >
      {/* ================================
          HOME
      ================================= */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      {/* ================================
          PROJECTS
      ================================= */}
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
      />

      {/* ================================
          DONATE
      ================================= */}
      <Tab.Screen
        name="Donate"
        component={DonateScreen}
      />

      {/* ================================
          ABOUT
      ================================= */}
      <Tab.Screen
        name="About"
        component={AboutScreen}
      />
    </Tab.Navigator>
  );
}

