import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ProjectCard({
  title,
  description,
  progress,
  project,
  navigation,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text
        style={styles.description}
        numberOfLines={3}
      >
        {description}
      </Text>

      <Text style={styles.progress}>
        {progress}% Completed
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("ProjectDetails", {
            project,
          })
        }
      >
        <Text style={styles.buttonText}>
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  description: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  progress: {
    marginTop: 12,
    fontWeight: "bold",
    color: "#2E8B57",
  },

  button: {
    marginTop: 15,
    backgroundColor: "#2E8B57",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
