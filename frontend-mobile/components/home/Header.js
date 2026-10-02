
import React from "react";

import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header({
  onNotificationPress,
  unreadCount = 0,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.container}>

        {/* ================= MENU ================= */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log("Menu pressed");
          }}
        >
          <Ionicons
            name="menu"
            size={32}
            color="#2E8B57"
          />
        </TouchableOpacity>


        {/* ================= LOGO ================= */}
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
        />


        {/* ================= NOTIFICATION ================= */}
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log("🔔 Notification button pressed");

            if (onNotificationPress) {
              onNotificationPress();
            }
          }}
        >
          <Ionicons
            name={
              unreadCount > 0
                ? "notifications"
                : "notifications-outline"
            }
            size={30}
            color="#2E8B57"
          />

          {/* ================= BADGE ================= */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}


const styles = StyleSheet.create({

  /*
   * Safe area is handled OUTSIDE
   * the actual header content.
   */
  safeArea: {
    width: "100%",
  },


  /*
   * Actual header content.
   */
  container: {
    height: 80,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 10,
  },


  iconButton: {
    width: 45,
    height: 45,

    alignItems: "center",
    justifyContent: "center",
  },


  logo: {
    width: 140,
    height: 70,

    resizeMode: "contain",
  },


  notificationButton: {
    width: 45,
    height: 45,

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },


  badge: {
    position: "absolute",

    right: -2,
    top: -3,

    minWidth: 19,
    height: 19,

    borderRadius: 10,

    backgroundColor: "#E53935",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 4,
  },


  badgeText: {
    color: "#FFFFFF",

    fontSize: 10,

    fontWeight: "bold",
  },

});

