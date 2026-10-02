import { GoogleGenAI } from "@google/genai";
import { createEmbedding } from "../services/embeddingService.js";
import { retrieveRelevantChunks } from "../services/retrievalService.js";
import { createStandaloneQuestion } from "../services/questionService.js";
import { parseChatbotResponse } from "../services/outputParser.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askChatbot = async (req, res) => {
  try {
    const {
      question,
      conversationHistory = [],
    } = req.body;

    // ---------------------------------------
    // 1. Validate question
    // ---------------------------------------

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question.",
      });
    }

    console.log("🤖 User question:", question);

    // ---------------------------------------
    // 2. Create standalone question
    // ---------------------------------------

    console.log("🔄 Creating standalone question...");

    const standaloneQuestion =
      await createStandaloneQuestion(
        question,
        conversationHistory
      );

    console.log(
      "✅ Standalone question:",
      standaloneQuestion
    );

    // ---------------------------------------
    // 3. Create embedding
    // ---------------------------------------

    console.log("🧠 Creating question embedding...");

    const queryEmbedding =
      await createEmbedding(standaloneQuestion);

    console.log(
      "✅ Question embedding created:",
      queryEmbedding.length
    );

    // ---------------------------------------
    // 4. Search knowledge base
    // ---------------------------------------

    console.log("🔎 Searching document chunks...");

    const chunks = await retrieveRelevantChunks(
      queryEmbedding,
      5,
      0.70
    );

    console.log(
      `📚 Relevant chunks found: ${chunks.length}`
    );

    // ---------------------------------------
    // 5. No relevant information
    // ---------------------------------------

    if (!chunks || chunks.length === 0) {
      return res.status(200).json({
        success: true,
        question,
        standaloneQuestion,
        answer:
          "I could not find relevant information in the EIASC knowledge base.",
        hasAnswer: false,
        sources: [],
      });
    }

    // ---------------------------------------
    // 6. Build context
    // ---------------------------------------

    const context = chunks
      .map((chunk, index) => {
        return `
SOURCE ${index + 1}

${chunk.content}
`;
      })
      .join("\n");

    console.log("📖 Knowledge context created");

    // ---------------------------------------
    // 7. Structured Gemini prompt
    // ---------------------------------------

    const prompt = `
You are the EIASC Hajj Information Assistant.

Answer the user's question using ONLY the information
contained in the knowledge base.

IMPORTANT RULES:

1. Do not invent facts.
2. Do not use outside knowledge.
3. If the knowledge base does not contain enough
   information to answer the question, say so clearly.
4. Do not pretend that missing information is available.
5. Keep the answer clear and helpful.
6. Do not mention embeddings, vector search, RAG,
   similarity scores, or internal system details.

Return ONLY valid JSON.

The JSON MUST have exactly these fields:

{
  "answer": "Your answer to the user",
  "hasAnswer": true
}

Set "hasAnswer" to:

true
- when the knowledge base contains enough information
  to answer the question.

false
- when the knowledge base does not contain enough
  information to answer the question.

KNOWLEDGE BASE:

${context}

USER QUESTION:

${standaloneQuestion}
`;

    // ---------------------------------------
    // 8. Generate structured Gemini response
    //    with retry for temporary 503 errors
    // ---------------------------------------

    console.log(
      "🤖 Requesting structured Gemini response..."
    );

    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `🤖 Gemini generation attempt ${attempt}/3`
        );

        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

        console.log(
          "✅ Gemini response received"
        );

        break;

      } catch (error) {
        const isTemporaryError =
          error?.status === 503 ||
          error?.code === 503 ||
          error?.message?.includes("503") ||
          error?.message?.includes("UNAVAILABLE");

        // If this is not a temporary 503 error,
        // immediately stop and let the main catch block handle it.
        if (
          !isTemporaryError ||
          attempt === 3
        ) {
          throw error;
        }

        const waitTime = attempt * 5000;

        console.log(
          "⚠️ Gemini is temporarily unavailable."
        );

        console.log(
          `⏳ Waiting ${waitTime / 1000} seconds before retry...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, waitTime)
        );
      }
    }

    // ---------------------------------------
    // 9. Read Gemini response
    // ---------------------------------------

    const rawResponse = response.text?.trim();

    console.log(
      "📦 Raw Gemini response:",
      rawResponse
    );

    // ---------------------------------------
    // 10. Parse Gemini response
    // ---------------------------------------

    const parsedResponse =
      parseChatbotResponse(rawResponse);

    console.log(
      "✅ Structured response parsed successfully"
    );

    // ---------------------------------------
    // 11. Return API response
    // ---------------------------------------

    return res.status(200).json({
      success: true,
      question,
      standaloneQuestion,
      answer: parsedResponse.answer,
      hasAnswer: parsedResponse.hasAnswer,
      sources: chunks,
    });

  } catch (error) {
    console.error(
      "❌ Chatbot error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Chatbot request failed.",
      error: error.message,
    });
  }
};