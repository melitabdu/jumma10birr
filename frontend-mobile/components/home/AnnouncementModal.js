import React, { useState } from "react";

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";


export default function AnnouncementModal({
  visible,
  announcements = [],
  onClose,
}) {

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);


  // ==========================================
  // OPEN ANNOUNCEMENT DETAILS
  // ==========================================

  const openAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
  };


  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  const closeDetails = () => {
    setSelectedAnnouncement(null);
  };


  // ==========================================
  // CLOSE EVERYTHING
  // ==========================================

  const handleClose = () => {
    setSelectedAnnouncement(null);
    onClose();
  };


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >

      {/* DARK BACKGROUND */}

      <View style={styles.overlay}>

        {/* ================================
            MAIN ANNOUNCEMENT POPUP
        ================================= */}

        {!selectedAnnouncement && (

          <View style={styles.modalContainer}>

            {/* HEADER */}

            <View style={styles.header}>

              <View style={styles.headerLeft}>

                <Ionicons
                  name="notifications"
                  size={25}
                  color="#2E8B57"
                />

                <Text style={styles.headerTitle}>
                  Announcements
                </Text>

              </View>


              {/* CLOSE */}

              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >

                <Ionicons
                  name="close"
                  size={27}
                  color="#555"
                />

              </TouchableOpacity>

            </View>


            {/* ANNOUNCEMENTS */}

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.list}
            >

              {announcements.length === 0 ? (

                <View style={styles.empty}>

                  <Ionicons
                    name="notifications-off-outline"
                    size={45}
                    color="#BBBBBB"
                  />

                  <Text style={styles.emptyTitle}>
                    No announcements
                  </Text>

                  <Text style={styles.emptyText}>
                    There are no new announcements
                    at the moment.
                  </Text>

                </View>

              ) : (

                announcements.slice(0, 5).map(
                  (announcement) => (

                    <TouchableOpacity
                      key={announcement._id}
                      style={styles.announcementCard}
                      onPress={() =>
                        openAnnouncement(
                          announcement
                        )
                      }
                    >

                      {/* ICON */}

                      <View
                        style={styles.iconContainer}
                      >

                        <Ionicons
                          name={
                            announcement.type ===
                            "emergency"
                              ? "warning-outline"
                              : announcement.type ===
                                "event"
                              ? "calendar-outline"
                              : "megaphone-outline"
                          }
                          size={24}
                          color="#2E8B57"
                        />

                      </View>


                      {/* CONTENT */}

                      <View
                        style={styles.content}
                      >

                        <Text
                          style={styles.title}
                          numberOfLines={2}
                        >
                          {announcement.title}
                        </Text>


                        <Text
                          style={styles.message}
                          numberOfLines={2}
                        >
                          {announcement.message ||
                            announcement.description ||
                            "No details available."}
                        </Text>


                        <Text
                          style={styles.date}
                        >
                          {announcement.publishedAt
                            ? new Date(
                                announcement.publishedAt
                              ).toLocaleDateString()
                            : announcement.createdAt
                            ? new Date(
                                announcement.createdAt
                              ).toLocaleDateString()
                            : ""}
                        </Text>

                      </View>


                      {/* ARROW */}

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#999"
                      />

                    </TouchableOpacity>

                  )
                )

              )}

            </ScrollView>

          </View>

        )}


        {/* ================================
            FULL ANNOUNCEMENT
        ================================= */}

        {selectedAnnouncement && (

          <View style={styles.detailsContainer}>

            {/* DETAILS HEADER */}

            <View style={styles.header}>

              <Text style={styles.headerTitle}>
                Announcement
              </Text>


              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >

                <Ionicons
                  name="close"
                  size={27}
                  color="#555"
                />

              </TouchableOpacity>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.detailsContent
              }
            >

              {/* ICON */}

              <View
                style={styles.largeIcon}
              >

                <Ionicons
                  name={
                    selectedAnnouncement.type ===
                    "emergency"
                      ? "warning-outline"
                      : selectedAnnouncement.type ===
                        "event"
                      ? "calendar-outline"
                      : "megaphone-outline"
                  }
                  size={40}
                  color="#2E8B57"
                />

              </View>


              {/* TITLE */}

              <Text style={styles.detailsTitle}>
                {selectedAnnouncement.title}
              </Text>


              {/* DATE */}

              <Text style={styles.detailsDate}>

                {selectedAnnouncement.publishedAt
                  ? new Date(
                      selectedAnnouncement.publishedAt
                    ).toLocaleDateString()
                  : selectedAnnouncement.createdAt
                  ? new Date(
                      selectedAnnouncement.createdAt
                    ).toLocaleDateString()
                  : ""}

              </Text>


              {/* MESSAGE */}

              <Text style={styles.detailsMessage}>
                {selectedAnnouncement.message ||
                  selectedAnnouncement.description ||
                  "No announcement details available."}
              </Text>


              {/* CLOSE BUTTON */}

              <TouchableOpacity
                style={styles.closeDetailsButton}
                onPress={handleClose}
              >

                <Text
                  style={styles.closeDetailsText}
                >
                  Close
                </Text>

              </TouchableOpacity>

            </ScrollView>

          </View>

        )}

      </View>

    </Modal>
  );
}


const styles = StyleSheet.create({

  // ==========================================
  // OVERLAY
  // ==========================================

  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(0, 0, 0, 0.55)",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },


  // ==========================================
  // MAIN MODAL
  // ==========================================

  modalContainer: {
    width: "100%",

    maxHeight: "75%",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    overflow: "hidden",

    elevation: 10,
  },


  // ==========================================
  // DETAILS MODAL
  // ==========================================

  detailsContainer: {
    width: "100%",

    maxHeight: "80%",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    overflow: "hidden",

    elevation: 10,
  },


  // ==========================================
  // HEADER
  // ==========================================

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 18,

    paddingVertical: 15,

    borderBottomWidth: 1,

    borderBottomColor: "#EEEEEE",
  },


  headerLeft: {
    flexDirection: "row",

    alignItems: "center",
  },


  headerTitle: {
    fontSize: 20,

    fontWeight: "bold",

    color: "#2E8B57",

    marginLeft: 9,
  },


  closeButton: {
    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: "#F2F2F2",

    alignItems: "center",

    justifyContent: "center",
  },


  // ==========================================
  // LIST
  // ==========================================

  list: {
    padding: 15,
  },


  // ==========================================
  // ANNOUNCEMENT CARD
  // ==========================================

  announcementCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F8FBF8",

    borderRadius: 15,

    padding: 14,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: "#E4EFE5",
  },


  iconContainer: {
    width: 45,

    height: 45,

    borderRadius: 23,

    backgroundColor: "#E8F5E9",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 12,
  },


  content: {
    flex: 1,
  },


  title: {
    fontSize: 16,

    fontWeight: "bold",

    color: "#222",

    marginBottom: 5,
  },


  message: {
    fontSize: 13,

    color: "#666",

    lineHeight: 19,
  },


  date: {
    fontSize: 11,

    color: "#999",

    marginTop: 6,
  },


  // ==========================================
  // EMPTY
  // ==========================================

  empty: {
    alignItems: "center",

    paddingVertical: 40,

    paddingHorizontal: 20,
  },


  emptyTitle: {
    fontSize: 18,

    fontWeight: "bold",

    color: "#555",

    marginTop: 12,
  },


  emptyText: {
    fontSize: 14,

    color: "#888",

    textAlign: "center",

    marginTop: 6,
  },


  // ==========================================
  // DETAILS
  // ==========================================

  detailsContent: {
    padding: 25,

    alignItems: "center",
  },


  largeIcon: {
    width: 75,

    height: 75,

    borderRadius: 38,

    backgroundColor: "#E8F5E9",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 18,
  },


  detailsTitle: {
    fontSize: 23,

    fontWeight: "bold",

    color: "#222",

    textAlign: "center",

    marginBottom: 8,
  },


  detailsDate: {
    fontSize: 12,

    color: "#999",

    marginBottom: 20,
  },


  detailsMessage: {
    width: "100%",

    fontSize: 16,

    color: "#555",

    lineHeight: 25,

    textAlign: "left",
  },


  closeDetailsButton: {
    marginTop: 25,

    backgroundColor: "#2E8B57",

    paddingVertical: 13,

    paddingHorizontal: 40,

    borderRadius: 25,
  },


  closeDetailsText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "bold",
  },

});