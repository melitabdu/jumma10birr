import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import API from "../services/api";

const COLORS = {
  primary: "#2E8B57",
  primaryLight: "#EAF6EE",
  primaryBorder: "#D3EBDD",
  white: "#FFFFFF",
  black: "#222222",
  text: "#444444",
  gray: "#888888",
  lightGray: "#F5F5F5",
  border: "#EEEEEE",
};

export default function NewsScreen({ navigation }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================================================
     FETCH NEWS
  ===================================================== */

  const fetchNews = async () => {
    try {
      console.log("Fetching published news...");

      const response = await API.get(
        "/api/news/published"
      );

      console.log(
        "========== NEWS RESPONSE =========="
      );

      console.log(
        JSON.stringify(response.data, null, 2)
      );

      console.log(
        "=================================="
      );

      const responseData = response.data;

      /*
        Support different backend response formats:

        1. [ ... ]

        2. {
             success: true,
             news: [...]
           }

        3. {
             success: true,
             data: [...]
           }
      */

      if (Array.isArray(responseData)) {
        setNews(responseData);
      } else if (
        Array.isArray(responseData?.news)
      ) {
        setNews(responseData.news);
      } else if (
        Array.isArray(responseData?.data)
      ) {
        setNews(responseData.data);
      } else {
        console.log(
          "No news array found in response."
        );

        setNews([]);
      }

    } catch (error) {
      console.log("News Error =");
      console.log(error.message);
      console.log(error.response?.data);

      setNews([]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     LOAD NEWS WHEN SCREEN OPENS
  ===================================================== */

  useEffect(() => {
    fetchNews();
  }, []);

  /* =====================================================
     PULL TO REFRESH
  ===================================================== */

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  /* =====================================================
     OPEN NEWS
  ===================================================== */

  const handleNewsPress = (item) => {
    console.log("Selected News:", item);

    /*
      We will create the full News Details screen
      after confirming the News list works.
    */

    // For now just show the selected news in console.
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <View style={styles.centerContainer}>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading News...
        </Text>

      </View>
    );
  }

  /* =====================================================
     SCREEN
  ===================================================== */

  return (
    <View style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.black}
          />

        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>

          <Text style={styles.headerTitle}>
            EIASC News
          </Text>

          <Text style={styles.headerSubtitle}>
            Latest news and updates
          </Text>

        </View>

      </View>

      {/* =================================================
          NEWS CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >

        {news.length === 0 ? (

          /* =============================================
             NO NEWS
          ============================================= */

          <View style={styles.emptyContainer}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="newspaper-outline"
                size={45}
                color={COLORS.primary}
              />

            </View>

            <Text style={styles.emptyTitle}>
              No News Available
            </Text>

            <Text style={styles.emptyText}>
              There are currently no published
              news articles.
            </Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchNews}
              activeOpacity={0.8}
            >

              <Ionicons
                name="refresh"
                size={18}
                color={COLORS.white}
              />

              <Text style={styles.refreshButtonText}>
                Refresh
              </Text>

            </TouchableOpacity>

          </View>

        ) : (

          /* =============================================
             NEWS LIST
          ============================================= */

          <View>

            <View style={styles.newsHeaderRow}>

              <View>

                <Text style={styles.sectionTitle}>
                  Latest News
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {news.length}{" "}
                  {news.length === 1
                    ? "article"
                    : "articles"}
                </Text>

              </View>

              <Ionicons
                name="newspaper"
                size={28}
                color={COLORS.primary}
              />

            </View>

            {news.map((item, index) => (

              <TouchableOpacity
                key={
                  item._id ||
                  item.id ||
                  index
                }
                style={styles.newsCard}
                activeOpacity={0.85}
                onPress={() =>
                  handleNewsPress(item)
                }
              >

                {/* =======================================
                    COVER IMAGE
                ======================================= */}

                {item.coverImage ? (

                  <Image
                    source={{
                      uri: item.coverImage,
                    }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />

                ) : (

                  <View
                    style={
                      styles.imagePlaceholder
                    }
                  >

                    <Ionicons
                      name="newspaper-outline"
                      size={55}
                      color={COLORS.primary}
                    />

                  </View>

                )}

                {/* =======================================
                    NEWS CONTENT
                ======================================= */}

                <View style={styles.newsContent}>

                  {/* CATEGORY */}

                  {item.category ? (

                    <View
                      style={
                        styles.categoryBadge
                      }
                    >

                      <Text
                        style={
                          styles.categoryText
                        }
                      >
                        {item.category}
                      </Text>

                    </View>

                  ) : null}

                  {/* TITLE */}

                  <Text
                    style={styles.newsTitle}
                    numberOfLines={3}
                  >
                    {item.title}
                  </Text>

                  {/* SUMMARY */}

                  {item.summary ? (

                    <Text
                      style={styles.summary}
                      numberOfLines={4}
                    >
                      {item.summary}
                    </Text>

                  ) : null}

                  {/* FOOTER */}

                  <View
                    style={styles.newsFooter}
                  >

                    <View
                      style={
                        styles.dateContainer
                      }
                    >

                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color={COLORS.gray}
                      />

                      <Text
                        style={styles.date}
                      >
                        {item.publishedAt
                          ? new Date(
                              item.publishedAt
                            ).toLocaleDateString()
                          : item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </Text>

                    </View>

                    <View
                      style={
                        styles.readMoreContainer
                      }
                    >

                      <Text
                        style={
                          styles.readMore
                        }
                      >
                        Read More
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={17}
                        color={COLORS.primary}
                      />

                    </View>

                  </View>

                </View>

              </TouchableOpacity>

            ))}

          </View>

        )}

      </ScrollView>

    </View>
  );
}

/* ========================================================
   STYLES
======================================================== */

const styles = StyleSheet.create({

  /* ======================================================
     CONTAINER
  ====================================================== */

  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  /* ======================================================
     HEADER
  ====================================================== */

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.gray,
  },

  /* ======================================================
     SCROLL
  ====================================================== */

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  /* ======================================================
     NEWS HEADER
  ====================================================== */

  newsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.gray,
  },

  /* ======================================================
     NEWS CARD
  ====================================================== */

  newsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",

    elevation: 3,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 5,

    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  /* ======================================================
     COVER IMAGE
  ====================================================== */

  coverImage: {
    width: "100%",
    height: 210,
  },

  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ======================================================
     CONTENT
  ====================================================== */

  newsContent: {
    padding: 16,
  },

  /* ======================================================
     CATEGORY
  ====================================================== */

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 9,
  },

  categoryText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "bold",
  },

  /* ======================================================
     TITLE
  ====================================================== */

  newsTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },

  /* ======================================================
     SUMMARY
  ====================================================== */

  summary: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
  },

  /* ======================================================
     FOOTER
  ====================================================== */

  newsFooter: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  date: {
    marginLeft: 5,
    fontSize: 11,
    color: COLORS.gray,
  },

  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  readMore: {
    marginRight: 5,
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  /* ======================================================
     LOADING
  ====================================================== */

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.gray,
  },

  /* ======================================================
     EMPTY
  ====================================================== */

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.gray,
    textAlign: "center",
  },

  /* ======================================================
     REFRESH BUTTON
  ====================================================== */

  refreshButton: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },

  refreshButtonText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },

});