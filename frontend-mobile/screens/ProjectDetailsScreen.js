import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function ProjectDetailsScreen({
  route,
  navigation,
}) {
  const { project } = route.params;

  const openProposal = async () => {
    if (!project?.fileUrl) {
      return;
    }

    try {
      await Linking.openURL(project.fileUrl);
    } catch (error) {
      console.error(
        "Unable to open proposal:",
        error
      );
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
    >
      <View style={styles.container}>

        {/* ================= BACK ARROW ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color="#2E8B57"
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>


        {/* ================= TITLE ================= */}

        <Text style={styles.title}>
          {project.title}
        </Text>


        {/* ================= IMAGE PLACEHOLDER ================= */}

        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>
            Project Images Coming Here
          </Text>
        </View>


        {/* ================= PROGRESS ================= */}

        <View style={styles.progressContainer}>

          <Text style={styles.progress}>
            {project.progress || 0}% Completed
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${project.progress || 0}%`,
                },
              ]}
            />
          </View>

        </View>


        {/* ================= DESCRIPTION ================= */}

        <Text style={styles.heading}>
          About This Project
        </Text>

        <Text style={styles.description}>
          {project.description}
        </Text>


        {/* ================= DOCUMENTS ================= */}

        <Text style={styles.heading}>
          Documents
        </Text>

        <View style={styles.card}>

          <Text style={styles.documentName}>
            Proposal Document
          </Text>

          {project.fileUrl ? (
            <TouchableOpacity
              onPress={openProposal}
            >
              <Text style={styles.download}>
                📄 View / Download
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noDocument}>
              No document available
            </Text>
          )}

        </View>


        {/* ================= REPORTS ================= */}

        <Text style={styles.heading}>
          Reports
        </Text>

        <View style={styles.card}>

          <Text style={styles.documentName}>
            Monthly Progress Report
          </Text>

          <TouchableOpacity>
            <Text style={styles.download}>
              📄 Coming Soon
            </Text>
          </TouchableOpacity>

        </View>


        {/* ================= BENEFICIARIES ================= */}

        <Text style={styles.heading}>
          Beneficiaries
        </Text>

        <Text style={styles.info}>
          500+ Families
        </Text>


        {/* ================= LOCATION ================= */}

        <Text style={styles.heading}>
          Location
        </Text>

        <Text style={styles.info}>
          Addis Ababa
        </Text>


        {/* ================= DONATE BUTTON ================= */}

        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => {
            navigation.navigate("MainTabs", {
              screen: "Donate",
            });
          }}
        >
          <Text style={styles.donateText}>
            Donate Now
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({

  scrollView: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  container: {
    padding: 20,
    paddingTop: 15,
  },

  /* ================= BACK ================= */

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  backText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "600",
    color: "#2E8B57",
  },

  /* ================= TITLE ================= */

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E8B57",
    marginBottom: 20,
  },

  /* ================= IMAGE ================= */

  imageContainer: {
    height: 220,
    backgroundColor: "#EEEEEE",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  imageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#777",
  },

  /* ================= PROGRESS ================= */

  progressContainer: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  progress: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E8B57",
    marginBottom: 15,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#D5D5D5",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#2E8B57",
    borderRadius: 10,
  },

  /* ================= HEADINGS ================= */

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
    color: "#2E8B57",
  },

  description: {
    fontSize: 16,
    lineHeight: 25,
    color: "#555",
    marginBottom: 10,
  },

  /* ================= CARDS ================= */

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 4,
  },

  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  download: {
    marginTop: 15,
    fontWeight: "bold",
    color: "#2E8B57",
    fontSize: 15,
  },

  noDocument: {
    marginTop: 12,
    color: "#999",
  },

  /* ================= INFO ================= */

  info: {
    fontSize: 17,
    marginBottom: 15,
    color: "#444",
  },

  /* ================= DONATE ================= */

  donateButton: {
    backgroundColor: "#2E8B57",
    padding: 18,
    borderRadius: 30,
    marginTop: 30,
    marginBottom: 50,
  },

  donateText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

});