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

import { Ionicons } from "@expo/vector-icons";

/*
======================================================
BACKEND URL

Web browser:
http://localhost:5000

Android emulator:
http://10.0.2.2:5000

Physical Android phone:
Use your computer's local IP address.
Example:
http://192.168.1.100:5000
======================================================
*/

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000";


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


export default function ChatbotScreen({ navigation }) {

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


  /* ======================================================
     SEND MESSAGE
  ====================================================== */

  const sendMessage = async () => {

    const question = input.trim();

    if (!question || loading) {
      return;
    }


    /* ----------------------------------------------------
       ADD USER MESSAGE
    ---------------------------------------------------- */

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

      /* --------------------------------------------------
         SEND QUESTION TO BACKEND
      -------------------------------------------------- */

      console.log("Chatbot API URL:", API_URL);
      console.log("Chatbot question:", question);


      const response = await fetch(
        `${API_URL}/api/chatbot/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question,
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


      /* --------------------------------------------------
         ADD AI RESPONSE
      -------------------------------------------------- */

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


  /* ======================================================
     MESSAGE
  ====================================================== */

  const renderMessage = ({ item }) => {

    const isUser =
      item.role === "user";


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
              size={18}
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


          {/* ------------------------------------------------
             SOURCES
          ------------------------------------------------ */}

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


  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
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


          <View>

            <Text style={styles.headerTitle}>
              EIASC AI Assistant
            </Text>

            <Text style={styles.headerSubtitle}>
              Hajj Information Assistant
            </Text>

          </View>

        </View>

      </View>


      {/* ==================================================
          CHAT
      ================================================== */}

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          styles.messagesContainer
        }
        showsVerticalScrollIndicator={false}
      />


      {/* ==================================================
          LOADING
      ================================================== */}

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


      {/* ==================================================
          INPUT
      ================================================== */}

      <View style={styles.inputContainer}>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Hajj..."
          placeholderTextColor={COLORS.gray}
          style={styles.input}
          multiline
          maxLength={1000}
          editable={!loading}
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
        >

          <Ionicons
            name="send"
            size={20}
            color={COLORS.white}
          />

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>

  );

}


/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },


  /* ----------------------------------------------------
     HEADER
  ---------------------------------------------------- */

  header: {
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },


  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },


  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },


  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },


  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
  },


  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },


  /* ----------------------------------------------------
     MESSAGES
  ---------------------------------------------------- */

  messagesContainer: {
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 20,
  },


  messageRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },


  userRow: {
    justifyContent: "flex-end",
  },


  assistantRow: {
    justifyContent: "flex-start",
  },


  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },


  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
  },


  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },


  assistantBubble: {
    backgroundColor: COLORS.lightGray,
    borderBottomLeftRadius: 4,
  },


  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },


  userMessageText: {
    color: COLORS.white,
  },


  /* ----------------------------------------------------
     SOURCES
  ---------------------------------------------------- */

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
    marginBottom: 4,
  },


  sourceText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },


  /* ----------------------------------------------------
     LOADING
  ---------------------------------------------------- */

  loadingContainer: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },


  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },


  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.gray,
  },


  /* ----------------------------------------------------
     INPUT
  ---------------------------------------------------- */

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },


  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: COLORS.lightGray,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.black,
    marginRight: 8,
  },


  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },


  sendButtonDisabled: {
    opacity: 0.45,
  },

});