
import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

/*
======================================================
BACKEND URL
======================================================
*/

const API_URL =
  "https://jumma10birr-eiasc.onrender.com";

/*
======================================================
COLORS
======================================================
*/

const COLORS = {
  primary: "#2E8B57",
  primaryLight: "#EAF6EE",
  white: "#FFFFFF",
  black: "#222222",
  text: "#444444",
  gray: "#888888",
  lightGray: "#F5F5F5",
  border: "#E5E5E5",
  userBubble: "#2E8B57",
};

/*
======================================================
EXTRA SAFE AREA SPACE

We intentionally add extra space so the screen
does not feel crowded on smaller Android phones.
======================================================
*/

const TOP_EXTRA_SPACE = 18;
const BOTTOM_EXTRA_SPACE = 18;

export default function ChatbotScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Assalamu Alaikum! 👋\n\nI am the EIASC AI Assistant. I can help you with questions about Hajj registration, preparation, and EIASC Hajj operations.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /*
  ======================================================
  SEND MESSAGE
  ======================================================
  */

  const sendMessage = async () => {
    const question = input.trim();

    if (!question || loading) {
      return;
    }

    /*
    --------------------------------------------------
    ADD USER MESSAGE
    --------------------------------------------------
    */

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      /*
      --------------------------------------------------
      SEND QUESTION TO BACKEND
      --------------------------------------------------
      */

      console.log(
        "Chatbot API URL:",
        `${API_URL}/api/chatbot/ask`
      );

      console.log(
        "Chatbot question:",
        question
      );

      const response = await fetch(
        `${API_URL}/api/chatbot/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Chatbot response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Chatbot request failed."
        );
      }

      /*
      --------------------------------------------------
      ADD AI RESPONSE
      --------------------------------------------------
      */

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text:
          data.answer ||
          "I could not find an answer to that question.",
        sources: data.sources || [],
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.log(
        "Chatbot Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text:
            "Sorry, I couldn't connect to the AI Assistant. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /*
  ======================================================
  MESSAGE
  ======================================================
  */

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageRow,
          isUser
            ? styles.userRow
            : styles.assistantRow,
        ]}
      >
        {!isUser && (
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={17}
              color={COLORS.primary}
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser &&
                styles.userMessageText,
            ]}
          >
            {item.text}
          </Text>

          {/*
          ==================================================
          SOURCES
          ==================================================
          */}

          {!isUser &&
            item.sources &&
            item.sources.length > 0 && (
              <View style={styles.sourcesContainer}>
                <Text style={styles.sourcesTitle}>
                  Sources
                </Text>

                {item.sources.map(
                  (source, index) => (
                    <Text
                      key={
                        source.id ||
                        index.toString()
                      }
                      style={styles.sourceText}
                    >
                      •{" "}
                      {source.title ||
                        source.document_title ||
                        `Source ${index + 1}`}
                    </Text>
                  )
                )}
              </View>
            )}
        </View>
      </View>
    );
  };

  /*
  ======================================================
  SCREEN
  ======================================================
  */

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={0}
      >
        {/*
        ==================================================
        HEADER
        ==================================================
        */}

        <View
          style={[
            styles.header,
            {
              paddingTop:
                insets.top +
                TOP_EXTRA_SPACE,

              height:
                70 +
                insets.top +
                TOP_EXTRA_SPACE,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.black}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="sparkles"
                size={20}
                color={COLORS.white}
              />
            </View>

            <View style={styles.headerTextContainer}>
              <Text
                style={styles.headerTitle}
                numberOfLines={1}
              >
                EIASC AI Assistant
              </Text>

              <Text
                style={styles.headerSubtitle}
                numberOfLines={1}
              >
                Hajj Information Assistant
              </Text>
            </View>
          </View>
        </View>

        {/*
        ==================================================
        CHAT
        ==================================================
        */}

        <FlatList
          style={styles.chatList}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "on-drag"
          }
        />

        {/*
        ==================================================
        LOADING
        ==================================================
        */}

        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />

              <Text style={styles.loadingText}>
                Assistant is thinking...
              </Text>
            </View>
          </View>
        )}

        {/*
        ==================================================
        INPUT
        ==================================================
        */}

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom:
                insets.bottom +
                BOTTOM_EXTRA_SPACE,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about Hajj..."
            placeholderTextColor={COLORS.gray}
            style={styles.input}
            multiline
            maxLength={1000}
            editable={!loading}
            textAlignVertical="center"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || loading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={
              !input.trim() || loading
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/*
======================================================
STYLES
======================================================
*/

const styles = StyleSheet.create({
  /*
  ====================================================
  MAIN SCREEN
  ====================================================
  */

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  keyboardContainer: {
    flex: 1,
  },

  /*
  ====================================================
  HEADER
  ====================================================
  */

  header: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    backgroundColor: COLORS.white,

    borderBottomWidth: 1,

    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 44,
    height: 44,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  headerCenter: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    minWidth: 0,
  },

  headerIcon: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  headerTextContainer: {
    flex: 1,

    minWidth: 0,
  },

  headerTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.black,
  },

  headerSubtitle: {
    fontSize: 12,

    color: COLORS.gray,

    marginTop: 3,
  },

  /*
  ====================================================
  CHAT
  ====================================================
  */

  chatList: {
    flex: 1,
  },

  messagesContainer: {
    paddingHorizontal: 18,

    paddingTop: 22,

    paddingBottom: 22,
  },

  messageRow: {
    flexDirection: "row",

    width: "100%",

    marginBottom: 16,

    alignItems: "flex-end",
  },

  userRow: {
    justifyContent: "flex-end",

    paddingLeft: 45,
  },

  assistantRow: {
    justifyContent: "flex-start",

    paddingRight: 20,
  },

  /*
  ====================================================
  AI ICON
  ====================================================
  */

  aiIcon: {
    width: 32,
    height: 32,

    flexShrink: 0,

    borderRadius: 16,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  /*
  ====================================================
  MESSAGE BUBBLES
  ====================================================
  */

  messageBubble: {
    maxWidth: "82%",

    paddingHorizontal: 15,

    paddingVertical: 12,

    borderRadius: 17,
  },

  userBubble: {
    backgroundColor:
      COLORS.userBubble,

    borderBottomRightRadius: 5,
  },

  assistantBubble: {
    backgroundColor:
      COLORS.lightGray,

    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 15,

    lineHeight: 22,

    color: COLORS.text,
  },

  userMessageText: {
    color: COLORS.white,
  },

  /*
  ====================================================
  SOURCES
  ====================================================
  */

  sourcesContainer: {
    marginTop: 12,

    paddingTop: 10,

    borderTopWidth: 1,

    borderTopColor: COLORS.border,
  },

  sourcesTitle: {
    fontSize: 12,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 5,
  },

  sourceText: {
    fontSize: 11,

    lineHeight: 16,

    color: COLORS.gray,

    marginTop: 2,
  },

  /*
  ====================================================
  LOADING
  ====================================================
  */

  loadingContainer: {
    paddingHorizontal: 18,

    paddingBottom: 10,
  },

  loadingBubble: {
    flexDirection: "row",

    alignItems: "center",

    alignSelf: "flex-start",

    backgroundColor:
      COLORS.lightGray,

    paddingHorizontal: 15,

    paddingVertical: 11,

    borderRadius: 17,
  },

  loadingText: {
    marginLeft: 9,

    fontSize: 13,

    color: COLORS.gray,
  },

  /*
  ====================================================
  INPUT
  ====================================================
  */

  inputContainer: {
    flexDirection: "row",

    alignItems: "flex-end",

    paddingHorizontal: 18,

    paddingTop: 12,

    backgroundColor: COLORS.white,

    borderTopWidth: 1,

    borderTopColor: COLORS.border,
  },

  input: {
    flex: 1,

    minHeight: 48,

    maxHeight: 120,

    backgroundColor:
      COLORS.lightGray,

    borderRadius: 24,

    paddingHorizontal: 17,

    paddingVertical: 12,

    fontSize: 15,

    color: COLORS.black,

    marginRight: 10,

    borderWidth: 1,

    borderColor: "#EEEEEE",
  },

  sendButton: {
    width: 48,

    height: 48,

    flexShrink: 0,

    borderRadius: 24,

    backgroundColor:
      COLORS.primary,

    alignItems: "center",

    justifyContent: "center",
  },

  sendButtonDisabled: {
    opacity: 0.45,
  },
});

