import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  getAnnouncements,
} from "../services/announcementService";


export default function AnnouncementScreen({
  navigation,
}) {

  const [announcements, setAnnouncements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);


  // ==========================================
  // LOAD ANNOUNCEMENTS
  // ==========================================

  useEffect(() => {

    loadAnnouncements();

  }, []);


  const loadAnnouncements = async () => {

    try {

      setLoading(true);

      const data =
        await getAnnouncements();

      setAnnouncements(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.log(
        "Announcement Error:",
        error
      );

      setAnnouncements([]);

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // CLOSE MAIN MODAL
  // ==========================================

  const closeModal = () => {

    navigation.goBack();

  };


  // ==========================================
  // SELECT ANNOUNCEMENT
  // ==========================================

  const handleAnnouncementPress = (
    announcement
  ) => {

    setSelectedAnnouncement(
      announcement
    );

  };


  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  const closeDetails = () => {

    setSelectedAnnouncement(null);

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) return "";

    try {

      return new Date(date).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

    } catch {

      return "";

    }

  };


  // ==========================================
  // GET TYPE ICON
  // ==========================================

  const getAnnouncementIcon = (type) => {

    switch (type) {

      case "important":
        return "alert-circle";

      case "event":
        return "calendar";

      case "emergency":
        return "warning";

      default:
        return "megaphone";

    }

  };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <View style={styles.overlay}>

      {/* ======================================
          OUTSIDE AREA
      ====================================== */}

      <Pressable
        style={styles.outsideArea}
        onPress={closeModal}
      />


      {/* ======================================
          MAIN MODAL
      ====================================== */}

      <View style={styles.modal}>

        {/* ====================================
            HEADER
        ==================================== */}

        <View style={styles.header}>

          <View style={styles.headerLeft}>

            <View style={styles.headerIcon}>

              <Ionicons
                name="megaphone"
                size={22}
                color="#FFFFFF"
              />

            </View>

            <View>

              <Text style={styles.headerTitle}>
                Announcements
              </Text>

              <Text style={styles.headerSubtitle}>
                Latest news and updates
              </Text>

            </View>

          </View>


          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeModal}
            activeOpacity={0.7}
          >

            <Ionicons
              name="close"
              size={25}
              color="#555555"
            />

          </TouchableOpacity>

        </View>


        {/* ====================================
            CONTENT
        ==================================== */}

        {loading ? (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color="#2E8B57"
            />

            <Text style={styles.loadingText}>
              Loading announcements...
            </Text>

          </View>

        ) : announcements.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Ionicons
              name="notifications-off-outline"
              size={50}
              color="#AAAAAA"
            />

            <Text style={styles.emptyTitle}>
              No Announcements
            </Text>

            <Text style={styles.emptyText}>
              There are currently no announcements available.
            </Text>

          </View>

        ) : (

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.listContainer
            }
          >

            {announcements.map(
              (announcement, index) => (

                <TouchableOpacity
                  key={
                    announcement._id ||
                    announcement.id ||
                    index
                  }
                  activeOpacity={0.8}
                  style={styles.announcementCard}
                  onPress={() =>
                    handleAnnouncementPress(
                      announcement
                    )
                  }
                >

                  {/* ICON */}

                  <View
                    style={styles.announcementIcon}
                  >

                    <Ionicons
                      name={getAnnouncementIcon(
                        announcement.type
                      )}
                      size={24}
                      color="#2E8B57"
                    />

                  </View>


                  {/* CONTENT */}

                  <View
                    style={
                      styles.announcementContent
                    }
                  >

                    <View style={styles.titleRow}>

                      <Text
                        style={
                          styles.announcementTitle
                        }
                        numberOfLines={2}
                      >

                        {
                          announcement.title ||
                          "Announcement"
                        }

                      </Text>

                    </View>


                    <Text
                      style={
                        styles.announcementMessage
                      }
                      numberOfLines={3}
                    >

                      {
                        announcement.message ||
                        "No details available."
                      }

                    </Text>


                    <View style={styles.metaRow}>

                      {announcement.type && (

                        <Text style={styles.typeText}>
                          {announcement.type
                            .charAt(0)
                            .toUpperCase() +
                            announcement.type.slice(1)}
                        </Text>

                      )}

                      {announcement.publishedAt && (

                        <Text style={styles.date}>

                          {formatDate(
                            announcement.publishedAt
                          )}

                        </Text>

                      )}

                    </View>

                  </View>


                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#AAAAAA"
                  />

                </TouchableOpacity>

              )
            )}

          </ScrollView>

        )}

      </View>


      {/* ======================================
          DETAILS
      ====================================== */}

      {selectedAnnouncement && (

        <View style={styles.detailsOverlay}>

          <Pressable
            style={styles.detailsOutside}
            onPress={closeDetails}
          />


          <View style={styles.detailsModal}>

            {/* CLOSE */}

            <TouchableOpacity
              style={styles.detailsClose}
              onPress={closeDetails}
            >

              <Ionicons
                name="close"
                size={24}
                color="#555555"
              />

            </TouchableOpacity>


            {/* ICON */}

            <View style={styles.detailsIcon}>

              <Ionicons
                name={getAnnouncementIcon(
                  selectedAnnouncement.type
                )}
                size={30}
                color="#FFFFFF"
              />

            </View>


            {/* TYPE BADGE */}

            <View style={styles.newBadge}>

              <Ionicons
                name="notifications"
                size={13}
                color="#2E8B57"
              />

              <Text style={styles.newBadgeText}>

                {(
                  selectedAnnouncement.type ||
                  "general"
                ).toUpperCase()}

              </Text>

            </View>


            {/* TITLE */}

            <Text style={styles.detailsTitle}>

              {
                selectedAnnouncement.title ||
                "Announcement"
              }

            </Text>


            {/* DATE */}

            {selectedAnnouncement.publishedAt && (

              <Text style={styles.detailsDate}>

                Published{" "}
                {formatDate(
                  selectedAnnouncement.publishedAt
                )}

              </Text>

            )}


            {/* MESSAGE */}

            <ScrollView
              style={styles.detailsScroll}
              showsVerticalScrollIndicator={false}
            >

              <Text
                style={styles.detailsMessage}
              >

                {
                  selectedAnnouncement.message ||
                  "No announcement details available."
                }

              </Text>

            </ScrollView>


            {/* CLOSE */}

            <TouchableOpacity
              style={styles.detailsCloseButton}
              onPress={closeDetails}
              activeOpacity={0.8}
            >

              <Text
                style={styles.detailsCloseText}
              >
                Close
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      )}

    </View>

  );

}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  outsideArea: {
    ...StyleSheet.absoluteFillObject,
  },

  modal: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#2E8B57",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#888888",
    fontSize: 14,
  },

  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555555",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    marginTop: 7,
  },

  listContainer: {
    padding: 15,
  },

  announcementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  announcementIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  announcementContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  announcementTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 5,
  },

  announcementMessage: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 19,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  typeText: {
    fontSize: 10,
    color: "#2E8B57",
    fontWeight: "bold",
    marginRight: 10,
  },

  date: {
    fontSize: 11,
    color: "#999999",
  },

  detailsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 100,
  },

  detailsOutside: {
    ...StyleSheet.absoluteFillObject,
  },

  detailsModal: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 15,
  },

  detailsClose: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  detailsIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#2E8B57",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },

  newBadgeText: {
    color: "#2E8B57",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },

  detailsTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 5,
  },

  detailsDate: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 15,
  },

  detailsScroll: {
    width: "100%",
    maxHeight: 250,
  },

  detailsMessage: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555555",
    textAlign: "center",
  },

  detailsCloseButton: {
    width: "100%",
    backgroundColor: "#2E8B57",
    paddingVertical: 13,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },

  detailsCloseText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

});