import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";

import { Magnetometer } from "expo-sensors";


// Kaaba coordinates
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;


// Calculate Qibla bearing
function calculateQiblaBearing(latitude, longitude) {
  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (KAABA_LATITUDE * Math.PI) / 180;

  const deltaLongitude =
    ((KAABA_LONGITUDE - longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLongitude);

  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) *
      Math.cos(lat2) *
      Math.cos(deltaLongitude);

  let bearing =
    (Math.atan2(y, x) * 180) / Math.PI;

  bearing = (bearing + 360) % 360;

  return bearing;
}


// Convert magnetometer readings into compass heading
function calculateHeading(x, y) {
  let angle =
    Math.atan2(y, x) * (180 / Math.PI);

  angle = angle + 90;

  if (angle < 0) {
    angle += 360;
  }

  if (angle >= 360) {
    angle -= 360;
  }

  return angle;
}


// Normalize an angle
function normalizeAngle(angle) {
  return ((angle + 540) % 360) - 180;
}


export default function QiblaScreen({
  navigation,
}) {

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [latitude, setLatitude] = useState(null);

  const [longitude, setLongitude] = useState(null);

  const [qiblaDirection, setQiblaDirection] =
    useState(null);

  const [compassHeading, setCompassHeading] =
    useState(null);


  useEffect(() => {

    getLocation();

  }, []);


  // Start compass
  useEffect(() => {

    let subscription;

    const startCompass = async () => {

      try {

        const available =
          await Magnetometer.isAvailableAsync();

        if (!available) {

          console.log(
            "Magnetometer is not available."
          );

          return;
        }


        Magnetometer.setUpdateInterval(100);


        subscription =
          Magnetometer.addListener(
            (data) => {

              const {
                x,
                y,
              } = data;


              const heading =
                calculateHeading(x, y);


              setCompassHeading(heading);

            }
          );

      } catch (err) {

        console.log(
          "Compass error:",
          err
        );

      }

    };


    startCompass();


    return () => {

      if (subscription) {

        subscription.remove();

      }

    };

  }, []);


  const getLocation = async () => {

    try {

      setLoading(true);

      setError("");


      const {
        status,
      } =
        await Location.requestForegroundPermissionsAsync();


      if (status !== "granted") {

        setError(
          "Location permission is required to find the Qibla direction."
        );

        setLoading(false);

        return;
      }


      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });


      const currentLatitude =
        location.coords.latitude;

      const currentLongitude =
        location.coords.longitude;


      setLatitude(currentLatitude);

      setLongitude(currentLongitude);


      const bearing =
        calculateQiblaBearing(
          currentLatitude,
          currentLongitude
        );


      setQiblaDirection(bearing);

      setLoading(false);

    } catch (err) {

      console.log(
        "Qibla location error:",
        err
      );

      setError(
        "Unable to get your location. Please try again."
      );

      setLoading(false);

    }

  };


  // Calculate arrow rotation
  let arrowRotation = 0;

  if (
    qiblaDirection !== null &&
    compassHeading !== null
  ) {

    arrowRotation =
      normalizeAngle(
        qiblaDirection -
          compassHeading
      );

  }


  return (

    <View style={styles.screen}>

      {/* Header */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
        >

          <Ionicons
            name="arrow-back"
            size={25}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        <Text style={styles.headerTitle}>
          Qibla Direction
        </Text>


        <View style={{ width: 40 }} />

      </View>


      {/* Content */}

      <View style={styles.content}>

        <Text style={styles.title}>
          Find the Qibla
        </Text>


        <Text style={styles.subtitle}>
          Rotate your phone and follow the arrow
        </Text>


        {loading && (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color="#2E8B57"
            />

            <Text style={styles.loadingText}>
              Getting your location...
            </Text>

          </View>

        )}


        {!loading && error !== "" && (

          <View style={styles.errorContainer}>

            <Ionicons
              name="location-outline"
              size={40}
              color="#D9534F"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>


            <TouchableOpacity
              style={styles.retryButton}
              onPress={getLocation}
            >

              <Text style={styles.retryText}>
                Try Again
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {!loading &&
          error === "" &&
          qiblaDirection !== null && (

          <>

            {/* Compass */}

            <View style={styles.compass}>

              {/* Direction labels */}

              <Text
                style={[
                  styles.direction,
                  styles.north,
                ]}
              >
                N
              </Text>


              <Text
                style={[
                  styles.direction,
                  styles.east,
                ]}
              >
                E
              </Text>


              <Text
                style={[
                  styles.direction,
                  styles.south,
                ]}
              >
                S
              </Text>


              <Text
                style={[
                  styles.direction,
                  styles.west,
                ]}
              >
                W
              </Text>


              {/* Compass circle */}

              <View style={styles.innerCircle} />


              {/* Qibla arrow */}

              {compassHeading !== null && (

                <View
                  style={[
                    styles.arrowContainer,
                    {
                      transform: [
                        {
                          rotate: `${arrowRotation}deg`,
                        },
                      ],
                    },
                  ]}
                >

                  <Ionicons
                    name="navigate"
                    size={100}
                    color="#2E8B57"
                  />

                </View>

              )}


              {/* Center */}

              <View style={styles.centerPoint} />

            </View>


            {/* Bearing */}

            <View style={styles.resultCard}>

              <Text style={styles.resultLabel}>
                Qibla Bearing
              </Text>


              <Text style={styles.degree}>
                {qiblaDirection.toFixed(1)}°
              </Text>


              <Text style={styles.directionText}>
                from True North
              </Text>


              <View style={styles.divider} />


              <View style={styles.infoRow}>

                <View style={styles.infoItem}>

                  <Text style={styles.infoLabel}>
                    Phone Heading
                  </Text>

                  <Text style={styles.infoValue}>
                    {compassHeading !== null
                      ? `${compassHeading.toFixed(1)}°`
                      : "--"}
                  </Text>

                </View>


                <View style={styles.infoItem}>

                  <Text style={styles.infoLabel}>
                    Difference
                  </Text>

                  <Text style={styles.infoValue}>
                    {compassHeading !== null
                      ? `${Math.abs(
                          normalizeAngle(
                            qiblaDirection -
                              compassHeading
                          )
                        ).toFixed(1)}°`
                      : "--"}
                  </Text>

                </View>

              </View>

            </View>


            <Text style={styles.instruction}>
              Hold your phone flat and rotate slowly.
              Follow the green arrow toward the Qibla.
            </Text>


            <Text style={styles.coordinates}>
              Location:{" "}
              {latitude?.toFixed(5)},{" "}
              {longitude?.toFixed(5)}
            </Text>

          </>

        )}

      </View>

    </View>

  );
}


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: "#F7FAF8",
  },


  header: {
    height: 90,
    backgroundColor: "#2E8B57",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 18,
  },


  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },


  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },


  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 25,
  },


  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#1F3D2B",
  },


  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },


  loadingContainer: {
    alignItems: "center",
    marginTop: 50,
  },


  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: "#666666",
  },


  errorContainer: {
    alignItems: "center",
    marginTop: 45,
    paddingHorizontal: 20,
  },


  errorText: {
    marginTop: 15,
    textAlign: "center",
    color: "#555555",
    fontSize: 15,
    lineHeight: 22,
  },


  retryButton: {
    marginTop: 20,
    backgroundColor: "#2E8B57",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },


  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },


  compass: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 5,
    borderColor: "#2E8B57",
    backgroundColor: "#FFFFFF",
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },


  innerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "#DCEBE1",
    position: "absolute",
  },


  direction: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "800",
    color: "#2E8B57",
  },


  north: {
    top: 15,
  },


  east: {
    right: 17,
  },


  south: {
    bottom: 15,
  },


  west: {
    left: 17,
  },


  arrowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },


  centerPoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2E8B57",
    position: "absolute",
  },


  resultCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    elevation: 3,
  },


  resultLabel: {
    fontSize: 14,
    color: "#777777",
  },


  degree: {
    marginTop: 3,
    fontSize: 38,
    fontWeight: "800",
    color: "#2E8B57",
  },


  directionText: {
    fontSize: 13,
    color: "#777777",
  },


  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },


  infoRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },


  infoItem: {
    alignItems: "center",
  },


  infoLabel: {
    fontSize: 12,
    color: "#888888",
  },


  infoValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },


  instruction: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#666666",
    paddingHorizontal: 15,
  },


  coordinates: {
    marginTop: 8,
    fontSize: 11,
    color: "#999999",
  },

});