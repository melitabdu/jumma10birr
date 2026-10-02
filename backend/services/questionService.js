import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Convert the current user question + conversation history
 * into a standalone question that can be searched independently.
 */
export const createStandaloneQuestion = async (
  question,
  conversationHistory = []
) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  // No previous conversation means the question is already standalone.
  if (
    !conversationHistory ||
    conversationHistory.length === 0
  ) {
    return question.trim();
  }

  const historyText = conversationHistory
    .map((message) => {
      const role =
        message.role === "assistant"
          ? "Assistant"
          : "User";

      return `${role}: ${message.content}`;
    })
    .join("\n");

  const prompt = `
You are a question-rewriting assistant for the EIASC Hajj information chatbot.

Your task is to rewrite the user's latest question into a standalone question
that can be understood without seeing the previous conversation.

Rules:

1. Preserve the user's original meaning.
2. Use the conversation history only when necessary to understand references
   such as "it", "they", "that", "this", or "the requirements".
3. Do not answer the question.
4. Do not add information that is not present in the conversation.
5. Return ONLY the rewritten standalone question.
6. If the user's question is already standalone, return it unchanged.

Conversation history:

${historyText}

Latest user question:

${question}

Standalone question:
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const standaloneQuestion =
    response.text?.trim();

  if (!standaloneQuestion) {
    throw new Error(
      "Gemini did not return a standalone question."
    );
  }

  return standaloneQuestion;
};