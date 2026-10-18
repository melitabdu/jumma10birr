
import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function Header({
  onNotificationPress,
  unreadCount = 0,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  const navigateToPage = (screenName) => {
    setMenuVisible(false);

    // Let the menu close before navigating.
    requestAnimationFrame(() => {
      navigation.navigate(screenName);
    });
  };

  const menuItems = [
    {
      label: "Home",
      icon: "home-outline",
      screen: "Home",
    },
    {
      label: "Donate",
      icon: "heart-outline",
      screen: "Donate",
    },
    {
      label: "News",
      icon: "newspaper-outline",
      screen: "News",
    },
    {
      label: "AI Assistance",
      icon: "chatbubbles-outline",
      screen: "ChatbotScreen",
    },
    {
      label: "About",
      icon: "information-circle-outline",
      screen: "About",
    },
  ];

  return (
    <View
      style={[
        styles.safeArea,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.container}>
        {/* Hamburger menu */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Open navigation menu"
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons
            name="menu"
            size={32}
            color="#2E8B57"
          />
        </TouchableOpacity>

        {/* App logo */}
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Notifications */}
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          onPress={() => {
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

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation drawer */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Dark background; tap to close */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setMenuVisible(false)}
          />

          {/* Drawer panel */}
          <View
            style={[
              styles.drawer,
              {
                paddingTop: insets.top + 12,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.brandContainer}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />

                <View>
                  <Text style={styles.brandTitle}>
                    10Birr in Jumma
                  </Text>
                  <Text style={styles.brandSubtitle}>
                    Give a little. Make a difference.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMenuVisible(false)}
                accessibilityLabel="Close navigation menu"
              >
                <Ionicons
                  name="close"
                  size={27}
                  color="#333333"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuList}
            >
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => navigateToPage(item.screen)}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={23}
                      color="#2E8B57"
                    />
                  </View>

                  <Text style={styles.menuItemText}>
                    {item.label}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#9CA3AF"
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Ionicons
                name="heart"
                size={16}
                color="#2E8B57"
              />
              <Text style={styles.footerText}>
                Together, we can make a difference.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    backgroundColor: "#FFFFFF",
  },

  container: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
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

  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  drawer: {
    width: "82%",
    maxWidth: 340,
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 75,
  },

  brandContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  drawerLogo: {
    width: 55,
    height: 55,
    marginRight: 10,
  },

  brandTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2E8B57",
  },

  brandSubtitle: {
    fontSize: 11,
    color: "#777777",
    marginTop: 4,
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginLeft: 8,
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
    marginBottom: 12,
  },

  menuList: {
    paddingTop: 4,
    paddingBottom: 16,
  },

  menuItem: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },

  chevron: {
    marginLeft: 8,
  },

  drawerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  footerText: {
    fontSize: 11,
    color: "#777777",
    marginLeft: 7,
  },
});
