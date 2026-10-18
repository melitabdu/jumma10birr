
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  TextInput,
  Switch,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import API from "../services/api";

const VIDEO_URL = "https://www.youtube.com/watch?v=Mr5v34qtYFs";
const VIDEO_THUMBNAIL =
  "https://img.youtube.com/vi/Mr5v34qtYFs/maxresdefault.jpg";

const SUCCESS_RETURN_PREFIX = "myapp://donation-success";
const ACTIVE_DONATION_KEY = "@jumma10birr/last-donation-order";

const supportProjects = [
  {
    id: 1,
    title: "Mosque Construction",
    description: "Support building and maintaining mosques for communities.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 2,
    title: "Quran Education",
    description: "Help provide Islamic education for children and youth.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 3,
    title: "Food Assistance",
    description: "Provide food support for families in need.",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 4,
    title: "Water Projects",
    description: "Support clean water projects for communities.",
    image: "https://via.placeholder.com/300",
  },
];

const donationTypes = [
  {
    title: "Sadaqah",
    description: "Voluntary charity that creates continuous reward.",
  },
  {
    title: "Zakat",
    description: "Support eligible people through proper Zakat distribution.",
  },
  {
    title: "Waqf",
    description: "Create a lasting charity through permanent projects.",
  },
  {
    title: "Fidyah & Kaffarah",
    description: "Support those in need through religious obligations.",
  },
];

// Avoid logging signed Telebirr checkout query parameters.
function getSafeUrl(value) {
  if (!value) return undefined;

  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return "URL unavailable";
  }
}

export default function DonateScreen() {
  const [selectedType, setSelectedType] = useState("Sadaqah");
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [weeklyDonation, setWeeklyDonation] = useState(true);

  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutAttempt, setCheckoutAttempt] = useState(0);

  // Keep the order available while allowing the status panel to stay hidden.
  const [activeDonationOrder, setActiveDonationOrder] = useState(null);
  const [orderToCheck, setOrderToCheck] = useState("");
  const [donationStatus, setDonationStatus] = useState("UNKNOWN");
  const [checkingPayment, setCheckingPayment] = useState(false);

  // The payment-status details are collapsed initially.
  const [showPaymentStatusPanel, setShowPaymentStatusPanel] = useState(false);

  // Temporary thank-you banner.
  const [successMessage, setSuccessMessage] = useState("");

  const verifiedOrders = useRef(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Hide the thank-you banner automatically after five seconds.
  useEffect(() => {
    if (!successMessage) return undefined;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const openVideo = async () => {
    try {
      await Linking.openURL(VIDEO_URL);
    } catch {
      Alert.alert("Error", "Could not open the video.");
    }
  };

  const closeCheckout = () => {
    setPaymentUrl(null);
    setCheckoutLoading(false);
    setCheckoutError(null);
  };

  // Restore the most recent donation order after reopening the app.
  useEffect(() => {
    let cancelled = false;

    const restoreDonationOrder = async () => {
      try {
        const savedOrder = await AsyncStorage.getItem(ACTIVE_DONATION_KEY);

        if (cancelled || !savedOrder) return;

        setActiveDonationOrder(savedOrder);
        setOrderToCheck(savedOrder);
        setDonationStatus("UNKNOWN");
      } catch (error) {
        console.warn("Could not restore saved donation order.");
      }
    };

    restoreDonationOrder();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveDonationOrder = async (orderNo) => {
    const normalizedOrder = String(orderNo || "").trim();

    if (!normalizedOrder) return;

    setActiveDonationOrder(normalizedOrder);
    setOrderToCheck(normalizedOrder);

    try {
      await AsyncStorage.setItem(ACTIVE_DONATION_KEY, normalizedOrder);
    } catch (error) {
      console.warn("Could not save donation order locally.");
    }
  };

  // Ask the backend to verify the payment. The frontend never marks it PAID
  // without a PAID response from the backend.
  const verifyDonationStatus = useCallback(
    async (orderNo, showMessage = false) => {
      const normalizedOrder = String(orderNo || "").trim();

      if (!normalizedOrder) {
        if (showMessage) {
          Alert.alert("Order required", "Enter your donation order number.");
        }

        return "UNKNOWN";
      }

      if (!/^DON[A-Za-z0-9]+$/.test(normalizedOrder)) {
        if (showMessage) {
          Alert.alert(
            "Invalid order number",
            "Enter a valid donation order number beginning with DON."
          );
        }

        return "UNKNOWN";
      }

      if (verifiedOrders.current.has(normalizedOrder)) {
        if (mountedRef.current) {
          setDonationStatus("PAID");
        }

        return "PAID";
      }

      if (mountedRef.current) {
        setCheckingPayment(true);
      }

      try {
        const response = await API.get(
          `/api/donations/verify/${encodeURIComponent(normalizedOrder)}`
        );

        const data = response.data;

        if (data?.success && data?.donationStatus === "PAID") {
          const firstConfirmation =
            !verifiedOrders.current.has(normalizedOrder);

          verifiedOrders.current.add(normalizedOrder);

          if (mountedRef.current) {
            setDonationStatus("PAID");
            setActiveDonationOrder(normalizedOrder);
            setOrderToCheck(normalizedOrder);
            closeCheckout();
          }

          // Keep the confirmed order stored on the device.
          try {
            await AsyncStorage.setItem(
              ACTIVE_DONATION_KEY,
              normalizedOrder
            );
          } catch (storageError) {
            console.warn("Could not persist the verified donation order.");
          }

          // Show the thank-you banner once for a newly verified order.
          if (firstConfirmation && mountedRef.current) {
            setSuccessMessage(
              "Your payment has been verified and recorded. Alhamdulillah! May Allah accept your charity."
            );
          }

          return "PAID";
        }

        const status = data?.donationStatus || "PENDING";

        if (mountedRef.current) {
          setDonationStatus(status);
        }

        if (showMessage) {
          Alert.alert(
            "Payment not confirmed yet",
            "The backend has not confirmed this donation as paid. Wait a little and check again. Do not make another payment for this order."
          );
        }

        return status;
      } catch (error) {
        const httpStatus = error.response?.status ?? null;

        console.warn("Donation verification request failed:", {
          status: httpStatus,
          message: error.message,
        });

        if (mountedRef.current) {
          setDonationStatus("ERROR");
        }

        if (showMessage) {
          if (httpStatus === 404) {
            Alert.alert(
              "Order not found",
              "The backend could not find this donation order. Check the order number and try again."
            );
          } else {
            Alert.alert(
              "Unable to verify payment",
              "We could not verify your payment right now. Check your internet connection and try again. Do not pay again while checking the existing order."
            );
          }
        }

        return "ERROR";
      } finally {
        if (mountedRef.current) {
          setCheckingPayment(false);
        }
      }
    },
    []
  );

  // Poll a pending order every ten seconds for up to ten minutes.
  // Polling continues even if the status panel is collapsed.
  useEffect(() => {
    if (!activeDonationOrder || donationStatus === "PAID") {
      return undefined;
    }

    let attempts = 0;
    let inFlight = false;
    let timer = null;
    let cancelled = false;

    const checkStatus = async () => {
      if (cancelled || inFlight || attempts >= 60) return;

      inFlight = true;
      attempts += 1;

      try {
        const status = await verifyDonationStatus(activeDonationOrder);

        if (status === "PAID" && timer) {
          clearInterval(timer);
          timer = null;
        }
      } finally {
        inFlight = false;

        if ((cancelled || attempts >= 60) && timer) {
          clearInterval(timer);
          timer = null;
        }
      }
    };

    checkStatus();
    timer = setInterval(checkStatus, 10000);

    return () => {
      cancelled = true;

      if (timer) {
        clearInterval(timer);
      }
    };
  }, [activeDonationOrder, donationStatus, verifyDonationStatus]);

  const handleTelebirrDonate = async () => {
    if (loading) return;

    const finalAmount =
      customAmount.trim() !== ""
        ? Number(customAmount)
        : Number(selectedAmount);

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid donation amount.");
      return;
    }

    if (Math.round(finalAmount * 100) !== finalAmount * 100) {
      Alert.alert(
        "Invalid amount",
        "The donation amount can have at most two decimal places."
      );
      return;
    }

    // On web, open a tab immediately to reduce popup-blocking problems.
    let checkoutWindow = null;

    if (Platform.OS === "web") {
      try {
        checkoutWindow = window.open("about:blank", "_blank");
      } catch (error) {
        console.warn("Could not open checkout tab:", error.message);
      }
    }

    try {
      setLoading(true);

      const response = await API.post("/api/donations/initiate-donation", {
        amount: finalAmount,
        donorName: "App Donor",
        donationType: selectedType,
      });

      const data = response.data;

      if (!data?.success || !data?.paymentUrl || !data?.outTradeNo) {
        if (checkoutWindow && !checkoutWindow.closed) {
          checkoutWindow.close();
        }

        console.error("Unexpected donation response:", {
          success: data?.success,
          message: data?.message,
          hasPaymentUrl: Boolean(data?.paymentUrl),
          hasOrderNumber: Boolean(data?.outTradeNo),
        });

        Alert.alert(
          "Payment unavailable",
          data?.message ||
            "The payment gateway did not return a complete checkout response."
        );

        return;
      }

      await saveDonationOrder(data.outTradeNo);
      setDonationStatus("PENDING");
      setSuccessMessage("");

      console.log("Telebirr checkout initialized:", {
        outTradeNo: data.outTradeNo,
        status: data.status,
        hasPaymentUrl: Boolean(data.paymentUrl),
        checkoutOrigin: getSafeUrl(data.paymentUrl),
      });

      if (Platform.OS === "web") {
        if (checkoutWindow && !checkoutWindow.closed) {
          checkoutWindow.location.href = data.paymentUrl;
        } else {
          window.location.assign(data.paymentUrl);
        }

        return;
      }

      setCheckoutError(null);
      setCheckoutLoading(true);
      setCheckoutAttempt(0);
      setPaymentUrl(data.paymentUrl);
    } catch (error) {
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.close();
      }

      console.error("Donation initialization failed:", {
        status: error.response?.status ?? null,
        response: error.response?.data
          ? {
              success: error.response.data.success,
              message: error.response.data.message,
              providerCode: error.response.data.providerCode,
              providerMessage: error.response.data.providerMessage,
            }
          : null,
        message: error.message,
      });

      Alert.alert(
        "Connection error",
        error.response?.data?.message ||
          "Could not initialize your donation. Check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async () => {
    const order = orderToCheck.trim();

    if (!order) {
      Alert.alert(
        "Order required",
        "Enter your donation order number before checking."
      );

      return;
    }

    await saveDonationOrder(order);
    setDonationStatus("UNKNOWN");

    await verifyDonationStatus(order, true);
  };

  const handleNavigationChange = (navState) => {
    if (!navState?.url) return;

    console.log("Telebirr navigation:", {
      url: getSafeUrl(navState.url),
      loading: navState.loading,
      title: navState.title,
      canGoBack: navState.canGoBack,
    });

    if (navState.url.startsWith(SUCCESS_RETURN_PREFIX)) {
      closeCheckout();

      // A checkout redirect by itself is not proof of payment.
      Alert.alert(
        "Payment returned",
        "The checkout returned to the app. Your donation will be confirmed only after the backend verifies the payment."
      );
    }
  };

  const handleShouldStartLoad = (request) => {
    const url = request?.url || "";

    if (url.startsWith(SUCCESS_RETURN_PREFIX)) {
      closeCheckout();

      Alert.alert(
        "Payment returned",
        "Please check your payment status. Returning from checkout alone does not confirm payment."
      );

      return false;
    }

    return true;
  };

  const handleWebViewError = (event) => {
    const nativeEvent = event?.nativeEvent || {};

    console.error("Telebirr WebView error:", {
      code: nativeEvent.code,
      description: nativeEvent.description,
      url: getSafeUrl(nativeEvent.url),
      isLoading: nativeEvent.isLoading,
    });

    setCheckoutLoading(false);

    setCheckoutError(
      nativeEvent.description ||
        "The checkout page could not load. Check your internet connection and try again."
    );
  };

  const handleHttpError = (event) => {
    const nativeEvent = event?.nativeEvent || {};

    if (nativeEvent.isForMainFrame === false) return;

    console.error("Telebirr HTTP error:", {
      statusCode: nativeEvent.statusCode,
      description: nativeEvent.description,
      url: getSafeUrl(nativeEvent.url),
    });

    if (nativeEvent.statusCode >= 400) {
      setCheckoutLoading(false);

      setCheckoutError(
        `The checkout server returned HTTP ${nativeEvent.statusCode}. Please retry.`
      );
    }
  };

  const retryCheckout = () => {
    if (!paymentUrl) return;

    setCheckoutError(null);
    setCheckoutLoading(true);
    setCheckoutAttempt((attempt) => attempt + 1);
  };

  const statusLabel =
    donationStatus === "PAID"
      ? "PAID — Payment confirmed"
      : donationStatus === "PENDING"
        ? "Pending — Awaiting confirmation"
        : donationStatus === "ERROR"
          ? "Unable to verify — Try again"
          : "Not checked yet";

  return (
    <View style={styles.screenRoot}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>10 Birr in Jumma</Text>

          <Text style={styles.heroSubtitle}>
            A small donation every Friday can create a lasting impact in our
            communities.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={handleTelebirrDonate}
            disabled={loading}
          >
            <Text style={styles.heroButtonText}>
              {loading ? "Preparing donation..." : "Donate Now"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* VIDEO */}
        <Text style={styles.sectionTitle}>Message from EIASC</Text>

        <TouchableOpacity style={styles.videoCard} onPress={openVideo}>
          <Image
            source={{ uri: VIDEO_THUMBNAIL }}
            style={styles.videoImage}
            resizeMode="cover"
          />

          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.centerText}>
          Tap to watch our official message
        </Text>

        {/* PROJECTS */}
        <Text style={styles.sectionTitle}>Projects Needing Support</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {supportProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <Image
                source={{ uri: project.image }}
                style={styles.projectImage}
                resizeMode="cover"
              />

              <Text style={styles.projectTitle}>{project.title}</Text>

              <Text style={styles.projectDescription}>
                {project.description}
              </Text>

              <TouchableOpacity
                style={styles.smallDonateButton}
                onPress={handleTelebirrDonate}
                disabled={loading}
              >
                <Text style={styles.smallDonateText}>Support</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* WHY DONATE */}
        <Text style={styles.sectionTitle}>Why Your Donation Matters</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>🕌 Build and maintain mosques</Text>
          <Text style={styles.infoItem}>📖 Support Islamic education</Text>
          <Text style={styles.infoItem}>🤲 Help needy families</Text>
          <Text style={styles.infoItem}>🍚 Provide food assistance</Text>
          <Text style={styles.infoItem}>💧 Support community projects</Text>
        </View>

        {/* DONATION TYPES */}
        <Text style={styles.sectionTitle}>Choose Donation Type</Text>

        {donationTypes.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.typeCard,
              selectedType === item.title && styles.selectedType,
            ]}
            onPress={() => setSelectedType(item.title)}
          >
            <Text style={styles.typeTitle}>{item.title}</Text>
            <Text style={styles.typeDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}

        {/* DONATION AMOUNT */}
        <Text style={styles.sectionTitle}>Choose Amount</Text>

        <View style={styles.amountContainer}>
          {[10, 25, 50, 100, 250, 500].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.amountButton,
                selectedAmount === item &&
                  !customAmount &&
                  styles.selectedAmount,
              ]}
              onPress={() => {
                setSelectedAmount(item);
                setCustomAmount("");
              }}
            >
              <Text
                style={[
                  styles.amountText,
                  selectedAmount === item &&
                    !customAmount &&
                    styles.selectedAmountText,
                ]}
              >
                {item} Birr
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="Custom amount"
          value={customAmount}
          onChangeText={(value) => {
            setCustomAmount(value);

            if (value.trim() !== "") {
              setSelectedAmount(null);
            } else {
              setSelectedAmount(10);
            }
          }}
        />

        {/* RECURRING DONATION PREFERENCE */}
        <View style={styles.recurringCard}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.recurringText}>Donate every Friday</Text>

            <Text style={styles.recurringNote}>
              Preference only; automatic recurring payments are not configured.
            </Text>
          </View>

          <Switch
            value={weeklyDonation}
            onValueChange={setWeeklyDonation}
            trackColor={{ false: "#ccc", true: "#9bd5ad" }}
            thumbColor={weeklyDonation ? "#2E8B57" : "#f4f3f4"}
          />
        </View>

        {/* DONATE BUTTON */}
        <TouchableOpacity
          style={[styles.mainDonateButton, loading && styles.disabledButton]}
          onPress={handleTelebirrDonate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mainDonateText}>Donate using Telebirr</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.paymentNote}>
          Secure checkout through Telebirr. Your donation supports communities
          across Ethiopia.
        </Text>

        {/* PAYMENT STATUS — DETAILS HIDDEN UNTIL BUTTON IS CLICKED */}
        <TouchableOpacity
          style={styles.paymentStatusToggle}
          onPress={() => setShowPaymentStatusPanel((visible) => !visible)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showPaymentStatusPanel }}
        >
          <Text style={styles.paymentStatusToggleText}>
            {showPaymentStatusPanel
              ? "Hide Payment Status"
              : "Check Payment Status"}
          </Text>

          <Text style={styles.paymentStatusToggleIcon}>
            {showPaymentStatusPanel ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {showPaymentStatusPanel && (
          <View style={styles.statusCard}>
            <Text style={styles.projectTitle}>Donation Payment Status</Text>

            <Text style={styles.projectDescription}>
              Enter an existing donation order number to check its payment
              status.
            </Text>

            <TextInput
              style={styles.input}
              value={orderToCheck}
              onChangeText={setOrderToCheck}
              placeholder="DON..."
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!checkingPayment}
              accessibilityLabel="Donation order number"
            />

            {activeDonationOrder &&
              activeDonationOrder === orderToCheck.trim() && (
                <Text style={styles.projectDescription}>
                  Current order: {activeDonationOrder}
                </Text>
              )}

            <Text
              style={[
                styles.projectDescription,
                donationStatus === "PAID" && styles.paidStatus,
              ]}
            >
              Status: {statusLabel}
            </Text>

            <TouchableOpacity
              style={[
                styles.smallDonateButton,
                checkingPayment && styles.disabledButton,
              ]}
              disabled={checkingPayment || !orderToCheck.trim()}
              onPress={handleManualVerification}
            >
              {checkingPayment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.smallDonateText}>Verify Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* FINAL MESSAGE */}
        <View style={styles.finalCard}>
          <Text style={styles.finalText}>
            "Whoever saves one life, it is as if they have saved all mankind."
          </Text>

          <Text style={styles.finalArabic}>
            May Allah accept your charity.
          </Text>
        </View>

        {/* TELEBIRR CHECKOUT */}
        <Modal
          visible={Boolean(paymentUrl)}
          animationType="slide"
          onRequestClose={closeCheckout}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Telebirr Checkout</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={closeCheckout}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            {paymentUrl ? (
              <View style={styles.webViewContainer}>
                <WebView
                  key={checkoutAttempt}
                  source={{ uri: paymentUrl }}
                  onLoadStart={() => {
                    setCheckoutError(null);
                    setCheckoutLoading(true);
                  }}
                  onLoadEnd={() => setCheckoutLoading(false)}
                  onNavigationStateChange={handleNavigationChange}
                  onShouldStartLoadWithRequest={handleShouldStartLoad}
                  onError={handleWebViewError}
                  onHttpError={handleHttpError}
                  javaScriptEnabled
                  domStorageEnabled
                  sharedCookiesEnabled
                  javaScriptCanOpenWindowsAutomatically
                  setSupportMultipleWindows={false}
                  originWhitelist={["http://*", "https://*", "myapp://*"]}
                  style={styles.webView}
                />

                {checkoutLoading && !checkoutError && (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color="#2E8B57" />

                    <Text style={styles.loadingText}>
                      Loading Telebirr checkout...
                    </Text>

                    <Text style={styles.loadingHint}>
                      If the page stays blank, check the connection and retry.
                    </Text>
                  </View>
                )}

                {checkoutError && (
                  <View style={styles.webViewLoading}>
                    <Text style={styles.checkoutErrorTitle}>
                      Checkout could not load
                    </Text>

                    <Text style={styles.checkoutErrorMessage}>
                      {checkoutError}
                    </Text>

                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={retryCheckout}
                    >
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={closeCheckout}
                    >
                      <Text style={styles.closeBtnText}>Close Checkout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null}
          </SafeAreaView>
        </Modal>
      </ScrollView>

      {/* Auto-dismissing thank-you banner */}
      {successMessage ? (
        <View
          style={styles.successToast}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Text style={styles.successTitle}>
            ✓ Thank you for your donation!
          </Text>

          <Text style={styles.successToastText}>{successMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F9F8",
    paddingHorizontal: 20,
  },
  hero: {
    backgroundColor: "#2E8B57",
    padding: 25,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 23,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  heroButtonText: {
    color: "#2E8B57",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#2E8B57",
    marginTop: 30,
    marginBottom: 15,
  },
  videoCard: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  videoImage: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "40%",
    left: "42%",
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 30,
    color: "#fff",
  },
  centerText: {
    textAlign: "center",
    marginTop: 10,
    color: "#777",
  },
  projectCard: {
    width: 260,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginRight: 15,
    elevation: 4,
  },
  projectImage: {
    height: 130,
    width: "100%",
    borderRadius: 15,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  projectDescription: {
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  smallDonateButton: {
    backgroundColor: "#2E8B57",
    padding: 10,
    borderRadius: 20,
    marginTop: 15,
    alignItems: "center",
  },
  smallDonateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
  },
  infoItem: {
    fontSize: 16,
    marginBottom: 15,
  },
  typeCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
  },
  selectedType: {
    borderWidth: 2,
    borderColor: "#2E8B57",
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  typeDescription: {
    marginTop: 8,
    color: "#666",
  },
  amountContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amountButton: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  selectedAmount: {
    backgroundColor: "#2E8B57",
  },
  amountText: {
    fontWeight: "bold",
  },
  selectedAmountText: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    color: "#222",
  },
  recurringCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  recurringText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  recurringNote: {
    marginTop: 5,
    color: "#777",
    fontSize: 12,
    lineHeight: 17,
  },
  mainDonateButton: {
    backgroundColor: "#2E8B57",
    padding: 18,
    borderRadius: 35,
    alignItems: "center",
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  mainDonateText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  paymentNote: {
    textAlign: "center",
    color: "#777",
    marginTop: 15,
    lineHeight: 21,
  },
  paymentStatusToggle: {
    backgroundColor: "#2E8B57",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 28,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentStatusToggleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentStatusToggleIcon: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 10,
  },
  statusCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d8e9dc",
  },
  paidStatus: {
    color: "#2E8B57",
    fontWeight: "bold",
  },
  finalCard: {
    backgroundColor: "#E8F5E9",
    padding: 25,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  finalText: {
    fontSize: 17,
    fontStyle: "italic",
    textAlign: "center",
    color: "#444",
  },
  finalArabic: {
    textAlign: "center",
    marginTop: 15,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  successToast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 35,
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 999,
    backgroundColor: "#E8F5E9",
    borderColor: "#2E8B57",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  successTitle: {
    color: "#2E8B57",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  successToastText: {
    color: "#234A32",
    fontSize: 15,
    lineHeight: 21,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: "#d9534f",
    fontWeight: "bold",
    fontSize: 16,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#555",
    fontSize: 16,
    textAlign: "center",
  },
  loadingHint: {
    marginTop: 10,
    color: "#777",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  checkoutErrorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b42318",
    textAlign: "center",
    marginBottom: 12,
  },
  checkoutErrorMessage: {
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2E8B57",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
