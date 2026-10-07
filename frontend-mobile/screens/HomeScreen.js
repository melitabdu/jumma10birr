import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import ImpactCard from "../components/home/ImpactCard";
import ProjectCard from "../components/home/ProjectCard";

import { getImpact } from "../services/impactService";
import { getProjects } from "../services/ProposalService";
import { getAnnouncements } from "../services/announcementService";

import Header from "../components/home/Header";

import {
  registerForPushNotificationsAsync,
} from "../services/notificationService";


/* ======================================================
   SCREEN WIDTH
====================================================== */

const { width } = Dimensions.get("window");


/* ======================================================
   COLORS
====================================================== */

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
  red: "#E53935",
};


/* ======================================================
   BANNER IMAGES
====================================================== */

const banners = [
  require("../assets/banner1.jpg"),
  require("../assets/banner2.jpg"),
  require("../assets/banner3.jpg"),
  require("../assets/banner4.jpg"),
];


/* ======================================================
   TESTIMONIALS
====================================================== */

const testimonials = [
  {
    name: "Hana",
    message:
      "This initiative made giving so simple and rewarding. Every Friday, I feel part of something bigger.",
  },

  {
    name: "Abdul",
    message:
      "10 Birr might be small, but together we create a huge impact across our communities.",
  },
];


/* ======================================================
   QUICK SERVICES
====================================================== */

const quickServices = [
  {
    id: "qibla",
    title: "Qibla",
    subtitle: "Find direction",
    icon: "compass-outline",
  },

  {
    id: "mosque",
    title: "Mosques",
    subtitle: "Nearby mosques",
    icon: "location-outline",
  },

  {
    id: "chatbot",
    title: "Assistant",
    subtitle: "Ask anything",
    icon: "chatbubble-ellipses-outline",
  },

  {
    id: "announcement",
    title: "Announcements",
    subtitle: "Latest updates",
    icon: "megaphone-outline",
  },

  {
    id: "news",
    title: "News",
    subtitle: "Latest news",
    icon: "newspaper-outline",
  },

  {
    id: "zakat",
    title: "Zakat",
    subtitle: "Calculate Zakat",
    icon: "calculator-outline",
  },
];


/* ======================================================
   HOME SCREEN
====================================================== */

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  /* ====================================================
     DATA STATES
  ==================================================== */

  const [impact, setImpact] = useState([]);

  const [projects, setProjects] = useState([]);

  const [announcements, setAnnouncements] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);


  /* ====================================================
     BANNER STATE
  ==================================================== */

  const [currentIndex, setCurrentIndex] = useState(0);

  const sliderRef = useRef(null);


  /* ====================================================
     LOAD HOME DATA
  ==================================================== */

  useEffect(() => {
    fetchImpact();

    fetchProjects();

    fetchAnnouncements();

    registerNotifications();
  }, []);


  /* ====================================================
     REGISTER PUSH NOTIFICATIONS
  ==================================================== */

  const registerNotifications = async () => {
    try {
      await registerForPushNotificationsAsync();
    } catch (error) {
      console.log(
        "Notification Registration Error:",
        error
      );
    }
  };


  /* ====================================================
     AUTO BANNER SLIDER
  ==================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        (currentIndex + 1) % banners.length;

      sliderRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);


  /* ====================================================
     FETCH IMPACT
  ==================================================== */

  const fetchImpact = async () => {
    try {
      const data = await getImpact();

      console.log(
        "Impact Data:",
        data
      );

      setImpact(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.log(
        "Impact Error:",
        error
      );

      setImpact([]);
    }
  };


  /* ====================================================
     FETCH PROJECTS
  ==================================================== */

  const fetchProjects = async () => {
    try {
      const data = await getProjects();

      console.log(
        "Projects Data:",
        data
      );

      setProjects(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.log(
        "Projects Error:",
        error
      );

      setProjects([]);
    }
  };


  /* ====================================================
     FETCH ANNOUNCEMENTS
  ==================================================== */

  const fetchAnnouncements = async () => {
    try {
      const data =
        await getAnnouncements();

      console.log(
        "Announcements Data:",
        data
      );

      const announcementList =
        Array.isArray(data)
          ? data
          : [];

      setAnnouncements(
        announcementList
      );

      /* -----------------------------------------------
         COUNT UNREAD ANNOUNCEMENTS
      ------------------------------------------------ */

      const unread =
        announcementList.filter(
          (announcement) =>
            !announcement.isRead
        ).length;

      setUnreadCount(
        unread
      );
    } catch (error) {
      console.log(
        "Announcement Error:",
        error
      );

      setAnnouncements([]);

      setUnreadCount(0);
    }
  };


  /* ====================================================
     OPEN ANNOUNCEMENT
     
     IMPORTANT:
     Your stack route is "Announcement"
  ==================================================== */

  const openAnnouncementPopup = (
    announcement = null
  ) => {
    console.log(
      "Opening Announcement:",
      announcement
    );

    navigation.navigate(
      "Announcement",
      {
        announcement:
          announcement,
      }
    );
  };


  /* ====================================================
     NOTIFICATION BELL
  ==================================================== */

  const handleNotificationPress = () => {
    console.log(
      "Notification bell pressed"
    );

    /* -----------------------------------------------
       FIND UNREAD ANNOUNCEMENT
    ------------------------------------------------ */

    const unreadAnnouncement =
      announcements.find(
        (announcement) =>
          !announcement.isRead
      );

    /* -----------------------------------------------
       OPEN UNREAD ANNOUNCEMENT
    ------------------------------------------------ */

    if (unreadAnnouncement) {
      openAnnouncementPopup(
        unreadAnnouncement
      );

      return;
    }

    /* -----------------------------------------------
       OPEN LATEST ANNOUNCEMENT
    ------------------------------------------------ */

    if (announcements.length > 0) {
      openAnnouncementPopup(
        announcements[0]
      );

      return;
    }

    /* -----------------------------------------------
       NO ANNOUNCEMENTS
    ------------------------------------------------ */

    navigation.navigate(
      "Announcement"
    );
  };


  /* ====================================================
     QUICK SERVICE PRESS
  ==================================================== */

  const handleQuickServicePress = (
    service
  ) => {
    console.log(
      "Quick Service pressed:",
      service.id
    );

    /* ==================================================
       ANNOUNCEMENT
    ================================================== */

    if (
      service.id ===
      "announcement"
    ) {
      if (
        announcements.length > 0
      ) {
        const announcement =
          announcements.find(
            (item) =>
              !item.isRead
          ) ||
          announcements[0];

        openAnnouncementPopup(
          announcement
        );
      } else {
        navigation.navigate(
          "Announcement"
        );
      }

      return;
    }


    /* ==================================================
       QIBLA
    ================================================== */

    if (
      service.id ===
      "qibla"
    ) {
      navigation.navigate(
        "QiblaScreen"
      );

      return;
    }


    /* ==================================================
       MOSQUE
    ================================================== */

    if (
      service.id ===
      "mosque"
    ) {
      console.log(
        "Nearest Mosque functionality will be added later."
      );

      return;
    }


    /* ==================================================
       CHATBOT
    ================================================== */

    if (
      service.id ===
      "chatbot"
    ) {
      navigation.navigate(
        "ChatbotScreen"
      );

      return;
    }


    /* ==================================================
       NEWS
    ================================================== */

    if (
      service.id ===
      "news"
    ) {
      navigation.navigate(
        "News"
      );

      return;
    }


    /* ==================================================
       ZAKAT
    ================================================== */

    if (
      service.id ===
      "zakat"
    ) {
      console.log(
        "Zakat Calculator functionality will be added later."
      );

      return;
    }
  };


  /* ====================================================
     DONATE
  ==================================================== */

  const handleDonate = () => {
    navigation.navigate(
      "Donate"
    );
  };


  /* ====================================================
     PROJECTS
  ==================================================== */

  const handleViewProjects = () => {
    navigation.navigate(
      "Projects"
    );
  };


  /* ====================================================
     FLOATING CHATBOT
  ==================================================== */

  const handleFloatingChatbot = () => {
    navigation.navigate(
      "ChatbotScreen"
    );
  };


  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <View
      style={
        styles.screen
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,

          /*
          Extra bottom space so the floating
          chatbot does not cover the last
          content on the Home screen.
          */
          {
            paddingBottom:
              120 +
              insets.bottom,
          },
        ]}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.headerContainer
          }
        >
          <Header
            onNotificationPress={
              handleNotificationPress
            }
            unreadCount={
              unreadCount
            }
          />
        </View>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <View
          style={
            styles.container
          }
        >

          {/* ==================================================
              BANNER
          ================================================== */}

          <ScrollView
            ref={
              sliderRef
            }
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={
              false
            }
            style={
              styles.slider
            }
          >

            {banners.map(
              (
                image,
                index
              ) => (

                <View
                  key={
                    index
                  }
                  style={
                    styles.bannerContainer
                  }
                >

                  <Image
                    source={
                      image
                    }
                    style={
                      styles.bannerImage
                    }
                    resizeMode="cover"
                  />


                  {/* BANNER MESSAGE */}

                  <View
                    style={
                      styles.textContainer
                    }
                  >
                    <Text
                      style={
                        styles.bannerMessage
                      }
                    >
                      Together We Give •
                      Together We Grow
                    </Text>
                  </View>

                </View>
              )
            )}

          </ScrollView>


          {/* ==================================================
              BANNER DOTS
          ================================================== */}

          <View
            style={
              styles.bannerDots
            }
          >

            {banners.map(
              (
                _,
                index
              ) => (

                <View
                  key={
                    index
                  }
                  style={[
                    styles.bannerDot,

                    index === currentIndex &&
                      styles.activeBannerDot,
                  ]}
                />

              )
            )}

          </View>


          {/* ==================================================
              QUICK SERVICES
          ================================================== */}

          <View
            style={
              styles.quickServicesSection
            }
          >

            {/* HEADER */}

            <View
              style={
                styles.quickServicesHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.quickServicesTitle
                  }
                >
                  Quick Services
                </Text>

                <Text
                  style={
                    styles.quickServicesSubtitle
                  }
                >
                  Islamic services at your fingertips
                </Text>

              </View>


              <View
                style={
                  styles.servicesHeaderIcon
                }
              >
                <Ionicons
                  name="apps-outline"
                  size={20}
                  color={
                    COLORS.primary
                  }
                />
              </View>

            </View>


            {/* HORIZONTAL FLAT LIST */}

            <FlatList
              data={
                quickServices
              }
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              keyExtractor={
                (item) =>
                  item.id
              }
              contentContainerStyle={
                styles.quickServicesList
              }
              renderItem={({
                item,
              }) => (

                <TouchableOpacity
                  activeOpacity={
                    0.75
                  }
                  style={
                    styles.quickServiceItem
                  }
                  onPress={() =>
                    handleQuickServicePress(
                      item
                    )
                  }
                >

                  {/* CIRCLE */}

                  <View
                    style={
                      styles.quickServiceCircle
                    }
                  >

                    <Ionicons
                      name={
                        item.icon
                      }
                      size={
                        28
                      }
                      color={
                        COLORS.primary
                      }
                    />


                    {/* ANNOUNCEMENT BADGE */}

                    {item.id ===
                      "announcement" &&
                      unreadCount > 0 && (

                        <View
                          style={
                            styles.serviceNotificationBadge
                          }
                        >

                          <Text
                            style={
                              styles.serviceNotificationBadgeText
                            }
                          >
                            {unreadCount > 9
                              ? "9+"
                              : unreadCount}
                          </Text>

                        </View>

                      )}

                  </View>


                  {/* TITLE */}

                  <Text
                    style={
                      styles.quickServiceText
                    }
                  >
                    {item.title}
                  </Text>


                  {/* SUBTITLE */}

                  <Text
                    style={
                      styles.quickServiceSubtitleItem
                    }
                  >
                    {item.subtitle}
                  </Text>

                </TouchableOpacity>

              )}
            />

          </View>


          {/* ==================================================
              OUR IMPACT
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Our Impact
          </Text>


          <View
            style={
              styles.impactContainer
            }
          >

            {impact.length === 0 ? (

              <Text
                style={
                  styles.emptyText
                }
              >
                No Impact Data Available.
              </Text>

            ) : (

              impact.map(
                (
                  item,
                  index
                ) => (

                  <ImpactCard
                    key={
                      item._id ||
                      item.id ||
                      index
                    }
                    title={
                      item.title
                    }
                    count={
                      item.count
                    }
                  />

                )
              )

            )}

          </View>


          {/* ==================================================
              ONGOING PROJECTS
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Ongoing Projects
          </Text>


          {projects.length === 0 ? (

            <Text
              style={
                styles.emptyText
              }
            >
              No Ongoing Projects Available.
            </Text>

          ) : (

            <>

              <View
                style={
                  styles.projectContainer
                }
              >

                {projects
                  .slice(
                    0,
                    4
                  )
                  .map(
                    (
                      project,
                      index
                    ) => (

                      <ProjectCard
                        key={
                          project._id ||
                          project.id ||
                          index
                        }
                        title={
                          project.title
                        }
                        description={
                          project.description
                        }
                        progress={
                          project.progress
                        }
                        project={
                          project
                        }
                        navigation={
                          navigation
                        }
                      />

                    )
                  )}

              </View>


              {/* SEE MORE */}

              {projects.length > 4 && (

                <TouchableOpacity
                  style={
                    styles.seeMoreButton
                  }
                  onPress={
                    handleViewProjects
                  }
                  activeOpacity={
                    0.8
                  }
                >

                  <Text
                    style={
                      styles.seeMoreText
                    }
                  >
                    See More Projects
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={
                      COLORS.white
                    }
                  />

                </TouchableOpacity>

              )}

            </>

          )}

        </View>


        {/* ==================================================
            DONATE SECTION
        ================================================== */}

        <View
          style={
            styles.donateContainer
          }
        >

          <View
            style={
              styles.donateIcon
            }
          >

            <Ionicons
              name="heart"
              size={25}
              color={
                COLORS.primary
              }
            />

          </View>


          <Text
            style={
              styles.donateTitle
            }
          >
            Change a Life Today
          </Text>


          <Text
            style={
              styles.donateText
            }
          >
            Your donation helps build mosques,
            support students, provide food
            assistance, and uplift communities
            across Ethiopia.
          </Text>


          <TouchableOpacity
            activeOpacity={
              0.8
            }
            style={
              styles.donateButton
            }
            onPress={
              handleDonate
            }
          >

            <Text
              style={
                styles.donateButtonText
              }
            >
              Donate Now
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={
                COLORS.white
              }
            />

          </TouchableOpacity>

        </View>


        {/* ==================================================
            TESTIMONIALS
        ================================================== */}

        <View
          style={
            styles.testimonialContainer
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            What Donors Say
          </Text>


          {testimonials.map(
            (
              item,
              index
            ) => (

              <View
                key={
                  index
                }
                style={
                  styles.testimonialCard
                }
              >

                <View
                  style={
                    styles.quoteIcon
                  }
                >

                  <Ionicons
                    name="chatbox-ellipses"
                    size={18}
                    color={
                      COLORS.primary
                    }
                  />

                </View>


                <Text
                  style={
                    styles.testimonialMessage
                  }
                >
                  "{item.message}"
                </Text>


                <Text
                  style={
                    styles.testimonialName
                  }
                >
                  - {item.name}
                </Text>

              </View>

            )
          )}

        </View>

      </ScrollView>


      {/* ==================================================
          FLOATING CHATBOT BUTTON

          This stays fixed above the bottom
          navigation/tab bar.
      ================================================== */}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={
          handleFloatingChatbot
        }
        style={[
          styles.floatingChatbot,
          {
            bottom:
              78 +
              insets.bottom,
          },
        ]}
      >

        <Ionicons
          name="sparkles"
          size={28}
          color={
            COLORS.white
          }
        />

      </TouchableOpacity>

    </View>
  );
}


/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({

  /* ====================================================
     SCREEN
  ==================================================== */

  screen: {
    flex: 1,
    backgroundColor:
      COLORS.white,
  },


  scrollContent: {
    paddingBottom: 25,
  },


  /* ====================================================
     HEADER
  ==================================================== */

  headerContainer: {
    paddingHorizontal: 20,
  },


  /* ====================================================
     MAIN CONTAINER
  ==================================================== */

  container: {
    flex: 1,
    padding: 20,
  },


  /* ====================================================
     BANNER
  ==================================================== */

  slider: {
    marginTop: 20,
    marginBottom: 8,
  },


  bannerContainer: {
    width:
      width - 40,
    height: 250,
    marginRight: 10,
    borderRadius: 20,
    overflow: "hidden",
  },


  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },


  textContainer: {
    position: "absolute",

    top: "50%",

    left: "50%",

    transform: [
      {
        translateX: -120,
      },
      {
        translateY: -20,
      },
    ],

    backgroundColor:
      "rgba(0, 0, 0, 0.30)",

    paddingVertical: 8,

    paddingHorizontal: 15,

    borderRadius: 10,

    alignItems: "center",

    justifyContent: "center",
  },


  bannerMessage: {
    color:
      COLORS.white,

    fontSize: 16,

    fontWeight: "600",

    textAlign: "center",
  },


  /* ====================================================
     BANNER DOTS
  ==================================================== */

  bannerDots: {
    flexDirection:
      "row",

    justifyContent:
      "center",

    alignItems:
      "center",

    marginBottom: 12,
  },


  bannerDot: {
    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor:
      "#D5D5D5",

    marginHorizontal: 4,
  },


  activeBannerDot: {
    width: 20,

    backgroundColor:
      COLORS.primary,
  },


  /* ====================================================
     QUICK SERVICES
  ==================================================== */

  quickServicesSection: {
    marginTop: 2,

    marginBottom: 12,

    backgroundColor:
      COLORS.white,
  },


  quickServicesHeader: {
    flexDirection:
      "row",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    marginBottom: 8,
  },


  quickServicesTitle: {
    fontSize: 20,

    fontWeight:
      "bold",

    color:
      COLORS.primary,
  },


  quickServicesSubtitle: {
    fontSize: 12,

    color:
      COLORS.gray,

    marginTop: 3,
  },


  servicesHeaderIcon: {
    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor:
      COLORS.primaryLight,

    alignItems:
      "center",

    justifyContent:
      "center",
  },


  quickServicesList: {
    paddingVertical: 8,

    paddingRight: 10,
  },


  quickServiceItem: {
    width: 88,

    alignItems:
      "center",

    marginRight: 12,
  },


  quickServiceCircle: {
    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor:
      COLORS.primaryLight,

    alignItems:
      "center",

    justifyContent:
      "center",

    borderWidth: 1,

    borderColor:
      COLORS.primaryBorder,

    elevation: 3,

    shadowOffset: {
      width: 0,

      height: 2,
    },

    shadowOpacity: 0.10,

    shadowRadius: 3,

    position:
      "relative",
  },


  quickServiceText: {
    marginTop: 7,

    fontSize: 12,

    fontWeight:
      "700",

    color:
      COLORS.text,

    textAlign:
      "center",
  },


  quickServiceSubtitleItem: {
    marginTop: 2,

    fontSize: 9,

    color:
      COLORS.gray,

    textAlign:
      "center",
  },


  serviceNotificationBadge: {
    position:
      "absolute",

    right: -2,

    top: -2,

    minWidth: 19,

    height: 19,

    borderRadius: 10,

    backgroundColor:
      COLORS.red,

    alignItems:
      "center",

    justifyContent:
      "center",

    borderWidth: 2,

    borderColor:
      COLORS.white,
  },


  serviceNotificationBadgeText: {
    color:
      COLORS.white,

    fontSize: 9,

    fontWeight:
      "bold",
  },


  /* ====================================================
     SECTION TITLE
  ==================================================== */

  sectionTitle: {
    fontSize: 20,

    fontWeight:
      "bold",

    marginTop: 20,

    marginBottom: 15,

    color:
      COLORS.primary,
  },


  /* ====================================================
     EMPTY
  ==================================================== */

  emptyText: {
    color:
      COLORS.gray,

    fontSize: 14,

    marginBottom: 10,
  },


  /* ====================================================
     IMPACT
  ==================================================== */

  impactContainer: {
    flexDirection:
      "row",

    flexWrap:
      "wrap",

    justifyContent:
      "space-between",
  },


  /* ====================================================
     PROJECTS
  ==================================================== */

  projectContainer: {
    flexDirection:
      "row",

    flexWrap:
      "wrap",

    justifyContent:
      "space-between",
  },


  seeMoreButton: {
    marginTop: 10,

    marginBottom: 20,

    alignSelf:
      "center",

    backgroundColor:
      COLORS.primary,

    paddingHorizontal: 25,

    paddingVertical: 12,

    borderRadius: 25,

    flexDirection:
      "row",

    alignItems:
      "center",

    gap: 7,
  },


  seeMoreText: {
    color:
      COLORS.white,

    fontSize: 16,

    fontWeight:
      "bold",
  },


  /* ====================================================
     DONATE
  ==================================================== */

  donateContainer: {
    marginTop: 20,

    marginHorizontal: 20,

    marginBottom: 30,

    padding: 25,

    borderRadius: 22,

    backgroundColor:
      COLORS.primaryLight,

    alignItems:
      "center",

    borderWidth: 1,

    borderColor:
      COLORS.primaryBorder,
  },


  donateIcon: {
    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor:
      COLORS.white,

    alignItems:
      "center",

    justifyContent:
      "center",

    marginBottom: 10,
  },


  donateTitle: {
    fontSize: 25,

    fontWeight:
      "bold",

    color:
      COLORS.primary,

    textAlign:
      "center",

    marginBottom: 10,
  },


  donateText: {
    fontSize: 15,

    lineHeight: 23,

    color:
      "#555555",

    textAlign:
      "center",

    marginBottom: 20,
  },


  donateButton: {
    backgroundColor:
      COLORS.primary,

    paddingVertical: 14,

    paddingHorizontal: 30,

    borderRadius: 30,

    elevation: 3,

    flexDirection:
      "row",

    alignItems:
      "center",

    gap: 8,
  },


  donateButtonText: {
    color:
      COLORS.white,

    fontSize: 17,

    fontWeight:
      "bold",

    textAlign:
      "center",
  },


  /* ====================================================
     TESTIMONIALS
  ==================================================== */

  testimonialContainer: {
    marginHorizontal: 20,

    marginBottom: 40,
  },


  testimonialCard: {
    backgroundColor:
      COLORS.white,

    padding: 20,

    marginBottom: 15,

    borderRadius: 20,

    elevation: 4,

    borderWidth: 1,

    borderColor:
      "#F0F0F0",

    shadowOffset: {
      width: 0,

      height: 2,
    },

    shadowOpacity: 0.10,

    shadowRadius: 4,
  },


  quoteIcon: {
    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor:
      COLORS.primaryLight,

    alignItems:
      "center",

    justifyContent:
      "center",

    marginBottom: 10,
  },


  testimonialMessage: {
    fontSize: 16,

    lineHeight: 24,

    color:
      COLORS.text,

    fontStyle:
      "italic",
  },


  testimonialName: {
    marginTop: 15,

    fontSize: 16,

    fontWeight:
      "bold",

    color:
      COLORS.primary,

    textAlign:
      "right",
  },


  /* ====================================================
     FLOATING CHATBOT BUTTON
  ==================================================== */

  floatingChatbot: {
    position: "absolute",

    right: 20,

    width: 62,

    height: 62,

    borderRadius: 31,

    backgroundColor:
      COLORS.primary,

    alignItems:
      "center",

    justifyContent:
      "center",

    elevation: 8,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.28,

    shadowRadius: 6,

    zIndex: 999,

    borderWidth: 2,

    borderColor:
      COLORS.white,
  },

});